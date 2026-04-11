import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
  unreadCount: number;
  onMarkAllRead: () => void;
};

export default function NotificationsHeader({ unreadCount, onMarkAllRead }: Props) {
  const background = useThemeColor(
    { light: '#FFFFFF', dark: '#151718' },
    'background'
  );
  const titleColor = useThemeColor({ light: '#11181C', dark: '#ECEDEE' }, 'text');

  return (
    <View style={[styles.header, { backgroundColor: background }]}>
      <View style={styles.row}>
        <View>
          <ThemedText style={[styles.title, { color: titleColor }]}>Notifications</ThemedText>
          {unreadCount > 0 && (
            <ThemedText style={styles.subtitle}>{unreadCount} unread</ThemedText>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={onMarkAllRead} style={styles.btn}>
            <ThemedText style={styles.btnText}>Mark all read</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: 0.5 },
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
