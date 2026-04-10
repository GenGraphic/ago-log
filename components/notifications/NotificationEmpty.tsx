import { ThemedText } from '@/components/ThemedText';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function NotificationEmpty() {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Feather name="bell-off" size={28} color="#444" />
      </View>
      <ThemedText style={styles.title}>All caught up</ThemedText>
      <ThemedText style={styles.subtitle}>No notifications to show here.</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 80, gap: 12 },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#666' },
  subtitle: { fontSize: 13, color: '#444' },
});
