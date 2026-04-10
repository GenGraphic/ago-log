import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export type FilterKey = 'ALL' | 'UNREAD' | 'EXPIRED' | 'UPCOMING';

export const FILTERS: FilterKey[] = ['ALL', 'UNREAD', 'EXPIRED', 'UPCOMING'];

type Props = {
  activeFilter: FilterKey;
  unreadCount: number;
  onSelect: (key: FilterKey) => void;
};

export default function NotificationFilterBar({ activeFilter, unreadCount, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {FILTERS.map((f) => {
        const active = activeFilter === f;
        const label = f === 'UNREAD' && unreadCount > 0 ? `${f}  ${unreadCount}` : f;
        return (
          <TouchableOpacity
            key={f}
            onPress={() => onSelect(f)}
            style={[styles.chip, active && styles.chipActive]}
            activeOpacity={0.7}>
            <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>
              {label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 16, paddingBottom: 14, alignItems: 'center' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#141414',
    alignSelf: 'flex-start',
  },
  chipActive: { backgroundColor: '#00F0FF', borderColor: '#00F0FF' },
  chipText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, color: '#555' },
  chipTextActive: { color: '#00363A' },
});
