import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import SuggestionRow from '@/components/suggestions/SuggestionRow';
import { ThemedText } from '@/components/ThemedText';
import useAssets from '@/hooks/useAssets';
import useEntries from '@/hooks/useEntries';
import useUser from '@/hooks/useUser';
import { useThemeColor } from '@/hooks/useThemeColor';
import { checklist, Suggestion } from '@/models/suggestions';
import { useAppSelector } from '@/store/hooks';

// Open items shown at once; the rest appear as these get done.
const MAX_VISIBLE = 4;

/**
 * Home checklist built from the first-run setup: what the user should add
 * for the things they own. Disappears when everything is added or dismissed.
 */
export default function GettingStarted() {
  const { t } = useTranslation();
  const tint = useThemeColor({}, 'tint');
  const icon = useThemeColor({}, 'icon');
  const text = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#FFFFFF', dark: '#141C2A' }, 'background');

  const goals = useAppSelector((s) => s.user.setupGoals);
  const dismissed = useAppSelector((s) => s.user.checklistDismissed);
  const { listAssets } = useAssets();
  const { listEntries } = useEntries();
  const { updateUserData } = useUser();
  const [items, setItems] = useState<Suggestion[]>([]);

  const load = useCallback(async () => {
    const [assets, entries] = await Promise.all([listAssets(), listEntries()]);
    if (!assets.success || !entries.success) return;
    setItems(checklist(goals ?? [], assets.data, entries.data));
  }, [goals, listAssets, listEntries]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const open = items.filter((i) => !i.done);
  if (dismissed || !open.length) return null;

  const doneCount = items.length - open.length;

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: `${tint}30` }]}>
      <View style={styles.header}>
        <ThemedText style={[styles.label, { color: tint }]}>{t('gettingStarted.title')}</ThemedText>
        <ThemedText style={[styles.progressText, { color: `${icon}B0` }]}>
          {doneCount}/{items.length}
        </ThemedText>
        <TouchableOpacity
          onPress={() => updateUserData({ checklistDismissed: true })}
          hitSlop={10}
          accessibilityLabel={t('common.dismiss')}>
          <Feather name="x" size={16} color={`${icon}90`} />
        </TouchableOpacity>
      </View>

      <View style={[styles.track, { backgroundColor: `${icon}20` }]}>
        <View style={[styles.fill, { backgroundColor: tint, width: `${(doneCount / items.length) * 100}%` }]} />
      </View>

      <ThemedText style={[styles.intro, { color: text }]}>{t('gettingStarted.intro')}</ThemedText>

      {open.slice(0, MAX_VISIBLE).map((s) => (
        <SuggestionRow key={s.key} suggestion={s} showAsset />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { flex: 1, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  progressText: { fontSize: 12, fontWeight: '600' },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  intro: { fontSize: 13, lineHeight: 19, marginTop: 4 },
});
