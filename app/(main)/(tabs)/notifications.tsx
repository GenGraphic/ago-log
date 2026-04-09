import { NotifType } from '@/models/enums';
import { Notification } from '@/models/types';
import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FilterKey = 'ALL' | 'UNREAD' | 'EXPIRED' | 'UPCOMING';


interface Section {
  title: string;
  data: Notification[];
}

const ALL_NOTIFICATIONS: Section[] = [
  {
    title: 'TODAY',
    data: [
      {
        id: '1',
        title: 'Car Insurance Expired',
        body: 'Policy #AU-9928 expired 2 days ago. Ledger auto-update failed.',
        time: '08:42 AM',
        read: false,
        type: 'expired',
      },
      {
        id: '2',
        title: 'System Sync Complete',
        body: 'The Sentient Ledger has successfully indexed 14 new assets.',
        time: '07:15 AM',
        read: true,
        type: 'sync',
      },
    ],
  },
  {
    title: 'YESTERDAY',
    data: [
      {
        id: '3',
        title: 'Passport Renewal',
        body: 'Your primary travel document expires in 30 days. Secure a slot.',
        time: 'Yesterday',
        read: true,
        type: 'warning',
      },
      {
        id: '4',
        title: 'Vault Audit Scheduled',
        body: 'Quarterly security audit begins in 48 hours.',
        time: 'Yesterday',
        read: true,
        type: 'info',
      },
    ],
  },
  {
    title: 'THIS WEEK',
    data: [
      {
        id: '5',
        title: 'Medical Record Expiring',
        body: 'Health insurance policy #MED-4471 expires in 6 days.',
        time: 'Mon',
        read: false,
        type: 'warning',
      },
      {
        id: '6',
        title: 'Driver\'s Licence Renewed',
        body: 'Your licence renewal was confirmed by the issuing authority.',
        time: 'Mon',
        read: true,
        type: 'sync',
      },
      {
        id: '7',
        title: 'Home Insurance Expired',
        body: 'Coverage for property #BRK-2209 lapsed. Action required.',
        time: 'Sun',
        read: false,
        type: 'expired',
      },
    ],
  },
];

const FILTERS: FilterKey[] = ['ALL', 'UNREAD', 'EXPIRED', 'UPCOMING'];

const ICON_CONFIG: Record<NotifType, { name: React.ComponentProps<typeof Feather>['name']; color: string; bg: string }> = {
  expired: { name: 'alert-circle', color: '#FF6060', bg: 'rgba(255,96,96,0.12)' },
  warning: { name: 'alert-triangle', color: '#FFA500', bg: 'rgba(255,165,0,0.12)' },
  info:    { name: 'info',          color: '#9BA1A6', bg: 'rgba(155,161,166,0.12)' },
  sync:    { name: 'refresh-cw',    color: '#00F0FF', bg: 'rgba(0,240,255,0.10)' },
};

function filterSections(sections: Section[], filter: FilterKey): Section[] {
  if (filter === 'ALL') return sections;
  return sections
    .map((s) => ({
      ...s,
      data: s.data.filter((n) => {
        if (filter === 'UNREAD') return !n.read;
        if (filter === 'EXPIRED') return n.type === 'expired';
        if (filter === 'UPCOMING') return n.type === 'warning';
        return true;
      }),
    }))
    .filter((s) => s.data.length > 0);
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ALL');

  const sections = filterSections(ALL_NOTIFICATIONS, activeFilter);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} style={styles.filterTab}>
            <Text style={[styles.filterLabel, activeFilter === f && styles.filterLabelActive]}>
              {f}
            </Text>
            {activeFilter === f && <View style={styles.filterUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const icon = ICON_CONFIG[item.type];
          return (
            <View style={[styles.row, item.type === 'expired' && styles.rowExpired]}>
              <View style={[styles.iconBox, { backgroundColor: icon.bg }]}>
                <Feather name={icon.name} size={18} color={icon.color} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.rowDesc} numberOfLines={2}>{item.body}</Text>
              </View>
              <View style={styles.rowMeta}>
                <Text style={styles.rowTime}>{item.time}</Text>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bell-off" size={40} color="#444" />
            <Text style={styles.emptyText}>Nothing here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ECEDEE',
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
    marginBottom: 8,
  },
  filterTab: {
    marginRight: 24,
    paddingBottom: 10,
    alignItems: 'center',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    letterSpacing: 0.8,
  },
  filterLabelActive: {
    color: '#ECEDEE',
  },
  filterUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#00F0FF',
    borderRadius: 1,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#444',
    letterSpacing: 1.2,
    marginTop: 20,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 0,
  },
  rowExpired: {
    borderLeftWidth: 2,
    borderLeftColor: '#FF6060',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ECEDEE',
  },
  rowDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 17,
  },
  rowMeta: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  rowTime: {
    fontSize: 11,
    color: '#444',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#00F0FF',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#444',
  },
});
