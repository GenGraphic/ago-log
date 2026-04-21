import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
  unreadCount: number;
  onMarkAllRead: () => void;
};

export default function NotificationsHeader({ unreadCount, onMarkAllRead }: Props) {
  const { t } = useTranslation();
  const titleColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');

  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <View>
          <ThemedText style={[styles.title, { color: titleColor }]}>{t('notifications.title')}</ThemedText>
          {unreadCount > 0 && (
            <ThemedText style={styles.subtitle}>{t('notifications.unread', { count: unreadCount })}</ThemedText>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={onMarkAllRead} style={styles.btn}>
            <ThemedText style={styles.btnText}>{t('notifications.markAllRead')}</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: 0.5, lineHeight: 34 },
  subtitle: { fontSize: 12, color: '#00F0FF', marginTop: 2, fontWeight: '500' },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0,240,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.2)',
  },
  btnText: { fontSize: 12, color: '#00F0FF', fontWeight: '600' },
});
