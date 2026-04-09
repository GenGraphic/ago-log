import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

export function RowDivider() {
  return <View style={styles.divider} />;
}

export function SettingRow({
  label,
  value,
  onPress,
  danger = false,
  rightIcon = 'chevron-right',
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  rightIcon?: React.ComponentProps<typeof Feather>['name'];
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Feather name={rightIcon} size={14} color={danger ? '#FF6060' : '#444'} />
      </View>
    </TouchableOpacity>
  );
}

export const sharedStyles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#141414',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 13,
    color: '#BBBBBB',
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#444',
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 13,
    color: '#BBBBBB',
    fontWeight: '500',
  },
  rowLabelDanger: {
    color: '#FF6060',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 12,
    color: '#555',
  },
});
