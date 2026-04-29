import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface FloatingActionButtonProps {
  onPress: () => void;
}

export default function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  return (
    <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={onPress}>
      <Text style={styles.fabPlus}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#00F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00F0FF',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabPlus: {
    color: '#151718',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
