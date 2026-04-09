import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { StatusColors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { EntryStatus, EntryType } from '@/models/enums';
import { Entry } from '@/models/types';

const ICON_MAP: Record<EntryType, React.ComponentProps<typeof Feather>['name']> = {
  [EntryType.PASSPORT]:             'book-open',
  [EntryType.DRIVING_LICENSE]:      'credit-card',
  [EntryType.ID_CARD]:              'credit-card',
  [EntryType.VISA]:                 'globe',
  [EntryType.CAR_INSURANCE]:        'shield',
  [EntryType.HEALTH_INSURANCE]:     'activity',
  [EntryType.HOME_INSURANCE]:       'home',
  [EntryType.TRAVEL_INSURANCE]:     'map',
  [EntryType.CAR_INSPECTION]:       'truck',
  [EntryType.CAR_MAINTENANCE]:      'tool',
  [EntryType.VEHICLE_REGISTRATION]: 'file-text',
  [EntryType.VACCINATION]:          'thermometer',
  [EntryType.PRESCRIPTION]:         'clipboard',
  [EntryType.MEDICAL_CHECKUP]:      'heart',
  [EntryType.SUBSCRIPTION]:         'refresh-cw',
  [EntryType.CONTRACT]:             'file',
  [EntryType.WARRANTY]:             'award',
  [EntryType.PROPERTY_LEASE]:       'key',
  [EntryType.BIRTHDAY]:             'gift',
  [EntryType.ANNIVERSARY]:          'star',
  [EntryType.CREDENTIAL]:           'lock',
  [EntryType.REMINDER]:             'bell',
};

const MONTH_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTH_SHORT[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}, ${d.getFullYear()}`;
}

function getDaysLeft(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

type Props = { item: Entry };

export default function EntryRow({ item }: Props) {
  const router = useRouter();
  const icon = useThemeColor({}, 'icon');

  const daysLeft = item.expiryDate ? getDaysLeft(item.expiryDate) : null;
  const isExpired = item.status === EntryStatus.EXPIRED || (daysLeft !== null && daysLeft < 0);
  const isUpcoming = !isExpired && daysLeft !== null && daysLeft <= 14;

  const accentColor = isExpired
    ? StatusColors.expired
    : isUpcoming
      ? '#FFA500'
      : StatusColors.active;

  const rightLabel = isExpired
    ? (item.expiryDate ? formatDate(item.expiryDate) : 'EXPIRED')
    : isUpcoming
      ? `IN ${daysLeft} DAYS`
      : item.expiryDate
        ? formatDate(item.expiryDate)
        : null;

  const typeLabel = item.entryType.replace(/_/g, ' ').toUpperCase();

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => router.push(`/(main)/entry-details/${item.id}` as any)}>
      {/* Left accent bar */}
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      {/* Icon box */}
      <View style={[styles.iconBox, { backgroundColor: `${accentColor}18` }]}>
        <Feather name={ICON_MAP[item.entryType] ?? 'file'} size={20} color={accentColor} />
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <ThemedText style={styles.title} numberOfLines={1}>{item.title}</ThemedText>
        <ThemedText style={[styles.type, { color: `${icon}80` }]}>{typeLabel}</ThemedText>
      </View>

      {/* Right side */}
      <View style={styles.right}>
        {rightLabel && (
          <ThemedText style={[styles.dateLabel, { color: isExpired ? StatusColors.expired : isUpcoming ? '#FFA500' : `${icon}80` }]}>
            {rightLabel}
          </ThemedText>
        )}
        <View style={[styles.dot, { backgroundColor: accentColor }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingRight: 8,
  },
  accent: {
    width: 3,
    height: 44,
    borderRadius: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  type: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
