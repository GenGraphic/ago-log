import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAppSelector } from '@/store/hooks';

export default function HomeHeader() {
  const user = useAppSelector((state) => state.user);
  const tint = useThemeColor({}, 'tint');

  return (
    <View style={styles.container}>
      {/* Status row */}
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: tint }]} />
        <ThemedText style={[styles.statusText, { color: tint }]}>SYSTEM ONLINE</ThemedText>
      </View>

      {/* Welcome heading */}
      <ThemedText style={styles.welcomeText}>
        Welcome back,{'\n'}{user.name !== '' ? user.name : 'Guest'}!
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 44,
  },
  card: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 4,
    marginTop: 4,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});