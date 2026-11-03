import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { EntryType } from '@/models/enums';
import { SuggestedType, Suggestion } from '@/models/suggestions';

const ICONS: Record<SuggestedType, React.ComponentProps<typeof Feather>['name']> = {
  [EntryType.CAR_INSURANCE]: 'shield',
  [EntryType.CAR_INSPECTION]: 'tool',
  [EntryType.VIGNETTE]: 'map',
  [EntryType.CAR_MAINTENANCE]: 'settings',
  [EntryType.HOME_INSURANCE]: 'home',
  [EntryType.ID_CARD]: 'credit-card',
  [EntryType.DRIVING_LICENSE]: 'credit-card',
  [EntryType.PASSPORT]: 'globe',
  [EntryType.SUBSCRIPTION]: 'repeat',
  [EntryType.WARRANTY]: 'file-text',
};

type Props = {
  suggestion: Suggestion;
  /** Show which asset the suggestion is for (home checklist). */
  showAsset?: boolean;
};

/** "RCA — mandatory, fines if missing  [+]" → opens the form with the type preset. */
export default function SuggestionRow({ suggestion, showAsset }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const icon = useThemeColor({}, 'icon');
  const text = useThemeColor({}, 'text');

  const { entryType, assetId, assetName, done } = suggestion;
  const title = t(`suggestions.types.${entryType}.title`);

  const add = () =>
    router.push({
      pathname: '/(main)/add-entry/manual',
      params: {
        entryType,
        title: assetName ? `${title} · ${assetName}` : title,
        ...(assetId && { assetId }),
      },
    });

  return (
    <TouchableOpacity style={styles.row} onPress={add} disabled={done} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: done ? `${icon}15` : `${tint}15` }]}>
        <Feather name={done ? 'check' : ICONS[entryType]} size={16} color={done ? icon : tint} />
      </View>
      <View style={styles.texts}>
        <ThemedText
          style={[styles.title, { color: done ? `${icon}90` : text }, done && styles.doneTitle]}
          numberOfLines={1}>
          {title}
          {showAsset && assetName ? <ThemedText style={{ color: `${icon}90` }}> · {assetName}</ThemedText> : null}
        </ThemedText>
        {!done && (
          <ThemedText style={[styles.why, { color: `${icon}B0` }]} numberOfLines={2}>
            {t(`suggestions.types.${entryType}.why`)}
          </ThemedText>
        )}
      </View>
      {!done && <Feather name="plus-circle" size={20} color={tint} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '600' },
  doneTitle: { textDecorationLine: 'line-through' },
  why: { fontSize: 12, lineHeight: 16 },
});
