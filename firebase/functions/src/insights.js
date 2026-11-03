import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { logger } from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { z } from 'zod';

import { COL, db, OPENAI_API_KEY, RESEND_API_KEY } from './config.js';
import { insightsEmail, sendEmail } from './email.js';
import { langOf, t } from './messages.js';
import { pushToUser } from './push.js';

// gpt-5-mini + web search: sourced answers for ~1.5 cents per user.
const MODEL = 'gpt-5-mini';
// Users processed in parallel (each one waits several seconds on OpenAI).
const CONCURRENCY = 5;
// Titles of recent tips kept on the user, so the next week brings something new.
const RECENT_TOPICS_KEPT = 12;

const LANGUAGE_NAMES = { en: 'English', ro: 'Romanian' };
const DEFAULT_COUNTRY = { ro: 'RO' };

const InsightSchema = z.object({
  title: z.string(),
  summary: z.string(),
  tips: z
    .array(
      z.object({
        topic: z.string(),
        text: z.string(),
        sourceUrl: z.string().nullable(),
        sourceTitle: z.string().nullable(),
      }),
    )
    .min(1)
    .max(3),
});

function daysUntil(isoDate) {
  return Math.round((new Date(isoDate) - Date.now()) / 86_400_000);
}

// Only what the AI needs: no secrets, identifiers, usernames, addresses or VINs.
function describeAsset(a) {
  const parts = [`${a.type}: ${a.name}`];
  if (a.brand || a.model) parts.push([a.brand, a.model].filter(Boolean).join(' '));
  if (a.year) parts.push(`year ${a.year}`);
  if (a.constructionYear) parts.push(`built ${a.constructionYear}`);
  if (a.surface) parts.push(`${a.surface} m²`);
  if (a.activityType) parts.push(a.activityType);
  return `- ${parts.join(', ')}`;
}

function describeEntry(e) {
  const parts = [`${e.entryType}: ${e.title}`];
  if (e.issuer) parts.push(`issuer ${e.issuer}`);
  if (e.expiryDate) {
    const d = daysUntil(e.expiryDate);
    parts.push(d >= 0 ? `expires in ${d} days` : `expired ${-d} days ago`);
  }
  return `- ${parts.join(', ')}`;
}

function buildPrompt({ language, country, assets, entries, recentTopics }) {
  const today = new Date().toISOString().slice(0, 10);
  return `Today is ${today}. You write the weekly note of Ago Log, an app where people keep track of their documents, insurances, vehicles and properties, and get reminded before anything expires.

The user lives in country code ${country}. Write in ${LANGUAGE_NAMES[language] ?? 'English'}.

The user's assets:
${assets.length ? assets.map(describeAsset).join('\n') : '- none'}

The user's tracked items:
${entries.length ? entries.map(describeEntry).join('\n') : '- none'}

Topics already covered in recent weeks (do not repeat them):
${recentTopics.length ? recentTopics.map((x) => `- ${x}`).join('\n') : '- none'}

Search the web and give 1 to 3 tips that are useful to THIS user right now. Prefer, in this order:
- recent or upcoming changes in ${country} that affect what they own (property or vehicle tax, mandatory insurance, inspections, vignettes, document rules), with dates and amounts when known;
- deadlines coming up in ${country} (e.g. local tax payment deadlines and early-payment discounts);
- something important they don't track yet: for a car without mandatory insurance or inspection, a home without home insurance, and so on. Suggest adding it in the app.

Rules:
- Only state facts you found in a reliable, current source (government sites, official journals, major news). Put that page in sourceUrl and its site or title in sourceTitle.
- A general reminder with no source is fine, but then sourceUrl and sourceTitle are null and it must not claim any specific change, date or amount.
- Reminders about expiry dates the app already sends are not useful here; mention a tracked item only if there is something new to say about it.
- Never invent news. If nothing new and relevant was found, give practical reminders based on their items instead.
- title: max 60 characters, catchy but factual. summary: max 140 characters, it is the push notification body. Each tip text: max 300 characters, plain text, no markdown, no links inside the text.
- topic: 2-5 words naming the tip's subject, used to avoid repeats.`;
}

export async function generateInsight(openai, context) {
  const response = await openai.responses.parse({
    model: MODEL,
    tools: [{ type: 'web_search', user_location: { type: 'approximate', country: context.country } }],
    reasoning: { effort: 'low' },
    input: buildPrompt(context),
    text: { format: zodTextFormat(InsightSchema, 'insight') },
  });
  return { insight: response.output_parsed, usage: response.usage };
}

/** Runs `worker` over `items`, at most `limit` at a time. */
async function runPool(items, limit, worker) {
  let next = 0;
  const lanes = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await worker(item);
    }
  });
  await Promise.all(lanes);
}

async function loadUserData(uid) {
  const [assets, entries] = await Promise.all([
    db.collection(COL.assets).where('userId', '==', uid).get(),
    db.collection(COL.entries).where('userId', '==', uid).where('status', '==', 'Active').get(),
  ]);
  return {
    assets: assets.docs.map((d) => d.data()),
    entries: entries.docs.map((d) => d.data()),
  };
}

async function sendInsightToUser(openai, userDoc) {
  const uid = userDoc.id;
  const user = userDoc.data();
  const userRef = userDoc.ref;

  const canPush = user.pushEnabled !== false && !!user.expoPushToken;
  const canEmail = user.emailEnabled === true && !!user.email;
  // Nobody would see it until they open the app anyway; skip the AI cost.
  if (!canPush && !canEmail) return 'no_channel';

  const lang = langOf(user);
  const s = t(lang);
  const { assets, entries } = await loadUserData(uid);

  // Nothing tracked yet: a plain nudge, no AI.
  if (!assets.length && !entries.length) {
    await pushToUser(userRef, user, [{ title: s.emptyTitle, body: s.emptyBody, data: { screen: 'add' } }]);
    await db.collection(COL.notifications).add({
      userId: uid,
      title: s.emptyTitle,
      body: s.emptyBody,
      type: 'info',
      read: false,
      sentAt: new Date().toISOString(),
    });
    return 'empty_nudge';
  }

  const recentTopics = user.recentInsightTopics ?? [];
  const { insight, usage } = await generateInsight(openai, {
    language: lang,
    country: user.country || DEFAULT_COUNTRY[lang] || 'RO',
    assets,
    entries,
    recentTopics,
  });

  const body = [insight.summary, ...insight.tips.map((tip) => `• ${tip.text}`)].join('\n\n');
  const sources = insight.tips
    .filter((tip) => tip.sourceUrl)
    .map((tip) => ({ title: tip.sourceTitle || tip.sourceUrl, url: tip.sourceUrl }));

  const notificationRef = await db.collection(COL.notifications).add({
    userId: uid,
    title: insight.title,
    body,
    sources,
    type: 'insight',
    read: false,
    sentAt: new Date().toISOString(),
  });

  if (canPush) {
    try {
      await pushToUser(userRef, user, [
        { title: insight.title, body: insight.summary, data: { screen: 'notifications', notificationId: notificationRef.id } },
      ]);
    } catch (err) {
      logger.error(`Insight push failed for ${uid}`, err);
    }
  }
  if (canEmail) {
    try {
      await sendEmail({ to: user.email, subject: insight.title, html: insightsEmail(insight, s) });
    } catch (err) {
      logger.error(`Insight email failed for ${uid}`, err);
    }
  }

  await userRef.update({
    lastInsightAt: new Date().toISOString(),
    recentInsightTopics: [...insight.tips.map((tip) => tip.topic), ...recentTopics].slice(0, RECENT_TOPICS_KEPT),
  });

  logger.info('Insight sent', { uid, tips: insight.tips.length, usage });
  return 'insight';
}

/**
 * Weekly job: a short, personalised note per user, built from their assets
 * and tracked items plus current information found on the web (taxes,
 * mandatory insurance, inspections, deadlines in their country). Users who
 * track nothing yet get a plain nudge to add their first item.
 */
export const sendWeeklyInsights = onSchedule(
  {
    schedule: '0 10 * * 1',
    timeZone: 'Europe/Bucharest',
    secrets: [OPENAI_API_KEY, RESEND_API_KEY],
    timeoutSeconds: 1800,
    memory: '512MiB',
  },
  async () => {
    const users = await db.collection(COL.users).where('status', '==', 'Active').get();
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY.value() });
    const results = {};

    await runPool(users.docs, CONCURRENCY, async (userDoc) => {
      let result;
      try {
        result = await sendInsightToUser(openai, userDoc);
      } catch (err) {
        logger.error(`Weekly insight failed for ${userDoc.id}`, err);
        result = 'error';
      }
      results[result] = (results[result] ?? 0) + 1;
    });

    logger.info(`Weekly insights done for ${users.size} users`, results);
  },
);
