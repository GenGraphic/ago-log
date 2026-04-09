import { LimitBanner } from '@/components/upgrade/LimitBanner';
import { useFreeLimitReached } from '@/hooks/useFreeLimitReached';
import { useNotifications } from '@/hooks/useNotifications';
import { NotifType } from '@/models/enums';
import { Notification } from '@/models/types';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FilterKey = 'ALL' | 'UNREAD' | 'EXPIRED' | 'UPCOMING';

interface Section {
  title: string;
  data: Notification[];
}

const FILTERS: FilterKey[] = ['ALL', 'UNREAD', 'EXPIRED', 'UPCOMING'];

const ICON_CONFIG: Record<NotifType, { name: React.ComponentProps<typeof Feather>['name']; color: string; bg: string }> = {
  expired: { name: 'alert-circle',   color: '#FF6060', bg: 'rgba(255,96,96,0.12)' },
  warning: { name: 'alert-triangle', color: '#FFA500', bg: 'rgba(255,165,0,0.12)' },
  info:    { name: 'info',            color: '#9BA1A6', bg: 'rgba(155,161,166,0.12)' },
  sync:    { name: 'refresh-cw',      color: '#00F0FF', bg: 'rgba(0,240,255,0.10)' },
};

function formatSentAt(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'TODAY';
  if (d.toDateString() === yesterday.toDateString()) return 'YESTERDAY';

  const diffDays = Math.floor((today.getTime() - d.getTime()) / 86_400_000);
  if (diffDays <= 7) return 'THIS WEEK';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

function groupIntoSections(items: Notification[]): Section[] {
  const map = new Map<string, Notification[]>();
  for (const n of items) {
    const key = formatSentAt(n.sentAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(n);
  }
  return Array.from(map.entries()).map(([title, data]) => ({ title, data }));
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const limitStatus = useFreeLimitReached();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ALL');

  const { notifications, loading, unreadCount, fetchNotifications, markAsRead, markAllAsRead } =
    useNotifications();

  useFocusEffect(useCallback(() => { fetchNotifications(); }, [fetchNotifications]));

  const filtered = useMemo(() => {
    switch (activeFilter) {
      case 'UNREAD':   return notifications.filter((n) => !n.read);
      case 'EXPIRED':  return notifications.filter((n) => n.type === 'expired');
      case 'UPCOMING': return notifications.filter((n) => n.type === 'warning');
      default:         return notifications;
    }
  }, [notifications, activeFilter]);

  const sections = useMemo(() => groupIntoSections(filtered), [filtered]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {limitStatus !== 'none' && <LimitBanner variant={limitStatus} style={{ marginTop: -8, marginBottom: 12 }} />}

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} style={styles.filterTab}>
            <Text style={[styles.filterLabel, activeFilter === f && styles.filterLabelActive]}>
              {f}{f === 'UNREAD' && unreadCount > 0 ? ` (${unreadCount})` : ''}
            </Text>
            {activeFilter === f && <View style={styles.filterUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#00F0FF" style={{ marginTop: 40 }} />
      ) : (
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
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => { if (!item.read) markAsRead(item.id); }}
                style={[styles.row, item.type === 'expired' && styles.rowExpired, !item.read && styles.rowUnread]}
              >
                <View style={[styles.iconBox, { backgroundColor: icon.bg }]}>
                  <Feather name={icon.name} size={18} color={icon.color} />
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.rowDesc} numberOfLines={2}>{item.body}</Text>
                </View>
                <View style={styles.rowMeta}>
                  <Text style={styles.rowTime}>{formatTime(item.sentAt)}</Text>
                  {!item.read && <View style={styles.unreadDot} />}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="bell-off" size={40} color="#444" />
              <Text style={styles.emptyText}>Nothing here</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D' },
  header: { paddingHorizontal: 16, marginBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#ECEDEE', letterSpacing: 0.5 },
  markAllBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  markAllText: { fontSize: 12, color: '#00F0FF', fontWeight: '600' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
    marginBottom: 8,
  },
  filterTab: { marginRight: 24, paddingBottom: 10, alignItems: 'center' },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#555', letterSpacing: 0.8 },
  filterLabelActive: { color: '#ECEDEE' },
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
    fontSize: 11, fontWeight: '700', color: '#444', letterSpacing: 1.2, marginTop: 20, marginBottom: 8,
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
  rowUnread: { backgroundColor: '#181818' },
  rowExpired: { borderLeftWidth: 2, borderLeftColor: '#FF6060' },
  iconBox: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 1 },
  rowBody: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: '#ECEDEE' },
  rowDesc: { fontSize: 12, color: '#666', lineHeight: 17 },
  rowMeta: { alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  rowTime: { fontSize: 11, color: '#444' },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#00F0FF' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: '#444' },
});
