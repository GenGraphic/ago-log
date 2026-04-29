import { ThemedText } from '@/components/ThemedText';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function EmptyAssetsList() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📦</Text>
      <ThemedText style={styles.title}>No Assets Yet</ThemedText>
      <ThemedText style={styles.subtitle}>
        Start by adding your first asset to keep track of your valuables securely.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    opacity: 0.7,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#00F0FF',
  },
  subtitle: {
    fontSize: 14,
    color: '#7B8CFF',
    textAlign: 'center',
    maxWidth: 260,
  },
});
