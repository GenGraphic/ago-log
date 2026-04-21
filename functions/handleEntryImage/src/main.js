import fetch, { FormData, Headers, Request, Response } from 'node-fetch';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

// Polyfills for older Node runtimes
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
if (typeof globalThis.Headers === 'undefined')  globalThis.Headers  = Headers;
if (typeof globalThis.FormData === 'undefined') globalThis.FormData = FormData;
if (typeof globalThis.Request === 'undefined')  globalThis.Request  = Request;
if (typeof globalThis.Response === 'undefined') globalThis.Response = Response;

const EntryAIPrefillSchema = z.object({
  // Core
  title:      z.string(),
  entryType:  z.enum([
    'Passport', 'Driving_License', 'ID_Card', 'Visa',
    'Car_Insurance', 'Health_Insurance', 'Home_Insurance', 'Travel_Insurance',
    'Car_Inspection', 'Car_Maintenance', 'Vehicle_Registration',
    'Vaccination', 'Prescription', 'Medical_Checkup',
    'Subscription', 'Contract', 'Warranty', 'Property_Lease',
    'Birthday', 'Anniversary',
    'Credential',
    'Reminder',
  ]),
  notes:       z.string(),

  // Expiry / renewal
  expiryDate:  z.string().nullable(),  // ISO 8601 datetime string

  // Origin
  issuer:      z.string().nullable(),
  identifier:  z.string().nullable(),

  // Credentials
  username:    z.string().nullable(),
  url:         z.string().nullable(),

  // Maintenance / Vehicle
  lastServiceDate:  z.string().nullable(),  // ISO 8601 datetime string — when the work was done
  lastMileage:      z.number().nullable(),  // odometer reading AT the time of service (e.g. 85000)
  mileageInterval:  z.number().nullable(),  // how many km/miles UNTIL next service (e.g. 30000)
});

export default async ({ req, res, log, error }) => {
 
  const { image } = req.bodyJson;
  if(!image) {
    log("Image is missing");
    return res.json({
      success: false,
      message: "The image is missing!",
    });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, fetch });

  try {
    const completion = await openai.chat.completions.parse({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert document analysis assistant for a personal vault app called AGO-LOG. Your job is to extract structured metadata from photos of physical or digital documents.

                    TODAY'S DATE: ${new Date().toISOString()} — use this as the reference when interpreting partial dates (e.g. "09/04" means 2026-04-09, "today" means ${new Date().toISOString().split('T')[0]}).

                    ENTRY TYPES — pick the single best match:
                    - Passport: travel passport booklet
                    - Driving_License: driver's licence card
                    - ID_Card: national identity card
                    - Visa: visa sticker or stamp
                    - Car_Insurance: motor insurance certificate/policy
                    - Health_Insurance: health/medical insurance card or policy
                    - Home_Insurance: home or property insurance policy
                    - Travel_Insurance: travel insurance policy
                    - Car_Inspection: MOT, TÜV, roadworthiness certificate
                    - Car_Maintenance: service record, oil change, tyre change receipt
                    - Vehicle_Registration: vehicle registration certificate (V5C, logbook)
                    - Vaccination: vaccination record, immunisation certificate
                    - Prescription: medical prescription from a doctor
                    - Medical_Checkup: health screening, blood test results, checkup certificate
                    - Subscription: subscription invoice or renewal notice (Netflix, Spotify, SaaS, etc.)
                    - Contract: any signed contract, agreement, service contract, utility bill, invoice
                    - Warranty: product warranty card or certificate
                    - Property_Lease: rental agreement, lease contract
                    - Birthday: birthday reminder (not usually a document)
                    - Anniversary: anniversary reminder
                    - Credential: login credentials, password, PIN, API key
                    - Reminder: generic reminder — use ONLY if nothing else fits

                    FIELD DEFINITIONS:
                    - title: short human-readable name for the entry (e.g. "Allianz Car Insurance", "Romanian Passport", "Netflix Invoice Apr 2026")
                    - entryType: one value from the enum above
                    - expiryDate: the date the document expires, renews, or is due — ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
                    - issuer: the organisation, company, or authority that issued the document (e.g. "Allianz", "DVLA", "Ministry of Interior")
                    - identifier: the unique reference number on the document (policy number, passport number, invoice number, VIN, etc.)
                    - notes: any other useful information visible on the document that doesn't fit the other fields
                    - username: login username or email (credentials only)
                    - url: website URL (credentials or subscriptions)
                    - lastServiceDate: date the maintenance/service was performed — ISO 8601
                    - lastMileage: the odometer reading AT THE TIME of the service (e.g. current km on the car when you changed the oil: 85000)
                    - mileageInterval: how many km/miles UNTIL the next service is due (e.g. "change oil again in 30,000 km" → 30000)

                    RULES:
                    1. Think step by step:
                       a. First, read all visible text in the image and identify what language it is written in (look at words, labels, sentences — not just the country or logo).
                       b. Then identify the document type.
                       c. Then extract each field.
                    2. "title" and "entryType" must NEVER be null — always infer them even from partial information.
                    3. For dates, always output ISO 8601 format with time defaulting to midnight UTC: YYYY-MM-DDTHH:mm:ss.sssZ
                    4. Write "title" and "notes" in the SAME LANGUAGE as the document text identified in step 1a. If the document contains mixed languages, use the dominant one. Only fall back to English if no language can be detected at all.
                    5. Use null for fields that genuinely cannot be determined from the image.
                    6. Do NOT guess sensitive data (passwords, PINs) — return null for those.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyse this document image and extract all the structured fields you can identify.',
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${image}`, detail: 'high' },
            },
          ],
        },
      ],
      response_format: zodResponseFormat(EntryAIPrefillSchema, 'entry'),
    });

    const data = completion.choices[0].message.parsed;
    log('AI extraction result: ' + JSON.stringify(data));

    return res.json({ success: true, data });
  } catch(err) {
    error('OpenAI extraction failed: ' + err.message);
    return res.json({
      success: false,
      message: err.message,
    });
  }
};
