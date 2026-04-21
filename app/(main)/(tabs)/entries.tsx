import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    RefreshControl,
    SectionList,
    StyleSheet,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedBackground from '@/components/AnimatedBackground';
import CategoryFilter, { CategoryKey } from '@/components/entries/CategoryFilter';
import EntryRow from '@/components/entries/EntryRow';
import SearchBar from '@/components/entries/SearchBar';
import { ThemedText } from '@/components/ThemedText';
import { LimitBanner } from '@/components/upgrade/LimitBanner';
import { StatusColors } from '@/constants/Colors';
import useEntries from '@/hooks/useEntries';
import { useFreeLimitReached } from '@/hooks/useFreeLimitReached';
import { useThemeColor } from '@/hooks/useThemeColor';
import { EntryStatus, EntryType } from '@/models/enums';
import { Entry } from '@/models/types';

const TAB_BAR_HEIGHT = 74;

// --- helpers ---

function getDaysLeft(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function isEntryExpired(e: Entry) {
  return e.status === EntryStatus.EXPIRED || (e.expiryDate ? getDaysLeft(e.expiryDate) < 0 : false);
}

function isEntryUpcoming(e: Entry) {
  if (isEntryExpired(e)) return false;
  return e.expiryDate ? getDaysLeft(e.expiryDate) <= 14 : false;
}

const TYPE_CATEGORY: Record<EntryType, CategoryKey> = {
  [EntryType.PASSPORT]:             'DOCUMENTS',
  [EntryType.DRIVING_LICENSE]:      'DOCUMENTS',
  [EntryType.ID_CARD]:              'DOCUMENTS',
  [EntryType.VISA]:                 'DOCUMENTS',
  [EntryType.CAR_INSURANCE]:        'INSURANCE',
  [EntryType.HEALTH_INSURANCE]:     'INSURANCE',
  [EntryType.HOME_INSURANCE]:       'INSURANCE',
  [EntryType.TRAVEL_INSURANCE]:     'INSURANCE',
  [EntryType.CAR_INSPECTION]:       'VEHICLE',
  [EntryType.CAR_MAINTENANCE]:      'VEHICLE',
  [EntryType.VEHICLE_REGISTRATION]: 'VEHICLE',
  [EntryType.VACCINATION]:          'MEDICAL',
  [EntryType.PRESCRIPTION]:         'MEDICAL',
  [EntryType.MEDICAL_CHECKUP]:      'MEDICAL',
  [EntryType.SUBSCRIPTION]:         'LEGAL',
  [EntryType.CONTRACT]:             'LEGAL',
  [EntryType.WARRANTY]:             'LEGAL',
  [EntryType.PROPERTY_LEASE]:       'LEGAL',
  [EntryType.BIRTHDAY]:             'PERSONAL',
  [EntryType.ANNIVERSARY]:          'PERSONAL',
  [EntryType.CREDENTIAL]:           'SECURE',
  [EntryType.REMINDER]:             'PERSONAL',
};

type SectionData = { title: string; dot: string; count: number; data: Entry[] };

// --- screen ---

export default function EntriesScreen() {
  const { t } = useTranslation();
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryKey>('ALL');

  const { listEntries } = useEntries();
  const limitStatus = useFreeLimitReached();
  const tint = useThemeColor({}, 'tint');
  const icon = useThemeColor({}, 'icon');
  const dividerBg = useThemeColor({ light: '#FFFFFF', dark: '#141C2A' }, 'background');
  const insets = useSafeAreaInsets();

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true); else setLoading(true);
    const result = await listEntries();
    if (result.success) setAllEntries(result.data);
    setLoading(false);
    setRefreshing(false);
  }, [listEntries]);

  useEffect(() => { load(); }, [load]);

  // Filter by search + category
  const filtered = useMemo(() => {
    let entries = allEntries;

    if (search.trim()) {
      const q = search.toLowerCase();
      entries = entries.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.entryType.toLowerCase().includes(q) ||
        (e.issuer ?? '').toLowerCase().includes(q)
      );
    }

    if (category === 'EXPIRED') return entries.filter(isEntryExpired);
    if (category === 'UPCOMING') return entries.filter(isEntryUpcoming);
    if (category !== 'ALL') return entries.filter(e => TYPE_CATEGORY[e.entryType] === category);

    return entries;
  }, [allEntries, search, category]);

  // Group into sections
  const sections = useMemo<SectionData[]>(() => {
    const expired = filtered.filter(isEntryExpired)
      .sort((a, b) => (a.expiryDate ?? '').localeCompare(b.expiryDate ?? ''));

    const upcoming = filtered.filter(isEntryUpcoming)
      .sort((a, b) => (a.expiryDate ?? '').localeCompare(b.expiryDate ?? ''));

    const stable = filtered
      .filter(e => !isEntryExpired(e) && !isEntryUpcoming(e))
      .sort((a, b) => (a.expiryDate ?? '').localeCompare(b.expiryDate ?? ''));

    const result: SectionData[] = [];
    if (expired.length)  result.push({ title: t('entries.priorityOverride'), dot: StatusColors.expired, count: expired.length, data: expired });
    if (upcoming.length) result.push({ title: t('entries.incomingBuffer'),   dot: '#FFA500',            count: upcoming.length, data: upcoming });
    if (stable.length)   result.push({ title: t('entries.stabilizedVault'),  dot: StatusColors.active,  count: stable.length,  data: stable });
    return result;
  }, [filtered]);

  if (loading) {
    return (
      <AnimatedBackground style={styles.fill}>
        <ActivityIndicator color={tint} style={{ flex: 1 }} />
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground style={styles.fill}>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: TAB_BAR_HEIGHT + insets.bottom },
        ]}
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            {limitStatus !== 'none' && <LimitBanner variant={limitStatus} style={{ marginHorizontal: 0, marginBottom: 12 }} />}
            <SearchBar value={search} onChangeText={setSearch} />
            <CategoryFilter selected={category} onSelect={setCategory} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText style={[styles.emptyText, { color: `${icon}60` }]}>{t('entries.noEntries')}</ThemedText>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={[styles.sectionHeader, { borderBottomColor: `${icon}10` }]}>
            <View style={[styles.sectionDot, { backgroundColor: section.dot }]} />
            <ThemedText style={[styles.sectionTitle, { color: `${icon}80` }]}>
              {section.title}
            </ThemedText>
            <ThemedText style={[styles.sectionCount, { color: `${icon}50` }]}>
              {t('entries.record', { count: section.count })}
            </ThemedText>
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <View style={[styles.rowWrapper, { backgroundColor: dividerBg }]}>
            <EntryRow item={item} />
            {index < section.data.length - 1 && (
              <View style={[styles.divider, { backgroundColor: `${icon}10` }]} />
            )}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(true)}
            tintColor={tint}
            colors={[tint]}
          />
        }
      />
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  listContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  header: {
    gap: 12,
    paddingBottom: 4,
  },
  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 2,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  sectionCount: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  // Row
  rowWrapper: {
    borderRadius: 14,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginLeft: 62,
  },
  // Empty
  empty: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
