import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type Props = {
  unreadCount: number;
  onMarkAllRead: () => void;
};

export default function NotificationsHeader({ unreadCount, onMarkAllRead }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <View>
          <ThemedText style={styles.title}>Notifications</ThemedText>
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
  title: { fontSize: 26, fontWeight: '700', color: '#ECEDEE', letterSpacing: 0.5 },
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
