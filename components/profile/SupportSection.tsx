import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRevenueCat } from '@/hooks/useRevenueCat';
import { SectionLabel } from './shared';

export function SupportSection() {
  const { presentCustomerCenter, isPro } = useRevenueCat();

  return (
    <>
      <SectionLabel title="SUPPORT" />
      <View style={styles.row}>
        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
          <Feather name="book-open" size={22} color="#00F0FF" />
          <Text style={styles.label}>HELP/FAQ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} activeOpacity={0.7}>
          <Feather name="message-circle" size={22} color="#00F0FF" />
          <Text style={styles.label}>CONTACT</Text>
        </TouchableOpacity>
        {isPro && (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={presentCustomerCenter}
          >
            <Feather name="settings" size={22} color="#00F0FF" />
            <Text style={styles.label}>MANAGE SUB</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#141414',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#555',
    letterSpacing: 1,
  },
});
