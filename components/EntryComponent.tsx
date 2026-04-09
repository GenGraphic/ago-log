import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { StatusColors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { EntryStatus } from '@/models/enums';
import { Entry } from '@/models/types';

interface Props {
  item: Entry;
}

function getDaysUntil(isoDate: string): number {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function EntryComponent({ item }: Props) {
  const router = useRouter();
  const cardBg = useThemeColor({ light: '#1C2333', dark: '#1C2333' }, 'background');

  const isExpired = item.status === EntryStatus.EXPIRED ||
    (item.expiryDate ? getDaysUntil(item.expiryDate) < 0 : false);

  const daysLeft = item.expiryDate ? getDaysUntil(item.expiryDate) : null;

  const accentColor = isExpired
    ? StatusColors.expired
    : item.status === EntryStatus.ARCHIVED
      ? StatusColors.archived
      : StatusColors.active;

  const badgeLabel = isExpired
    ? 'EXPIRED'
    : daysLeft !== null
      ? `EXPIRES IN ${daysLeft}D`
      : 'ACTIVE';

  const actionIcon: React.ComponentProps<typeof Feather>['name'] =
    isExpired ? 'refresh-cw' : 'edit-2';

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />

      <View style={styles.content}>
        {/* Badge */}
        <View style={[styles.badge, { backgroundColor: `${accentColor}22`, borderColor: accentColor }]}>
          <ThemedText style={[styles.badgeText, { color: accentColor }]}>{badgeLabel}</ThemedText>
        </View>

        {/* Title & subtitle */}
        <ThemedText style={styles.title}>{item.title}</ThemedText>
        {item.identifier ? (
          <ThemedText style={styles.subtitle}>{item.identifier}</ThemedText>
        ) : item.issuer ? (
          <ThemedText style={styles.subtitle}>{item.issuer}</ThemedText>
        ) : null}
      </View>

      {/* Action button */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: accentColor }]}
        onPress={() => router.push(`/(main)/edit-entry/${item.id}` as any)}
        activeOpacity={0.8}>
        <Feather name={actionIcon} size={18} color="#0A1A1A" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
    paddingRight: 16,
    minHeight: 90,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    marginRight: 14,
  },
  content: {
    flex: 1,
    paddingVertical: 14,
    gap: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.55,
  },
  actionBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});