import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  message?: string;
}

export function LimitBanner({ message = "You've reached the 5 log limit" }: Props) {
  return (
    <View style={styles.banner}>
      <Feather name="alert-triangle" size={13} color="#FF6060" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,96,96,0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,96,96,0.25)',
  },
  text: {
    fontSize: 12,
    color: '#FF6060',
    fontWeight: '600',
  },
});
