import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface ComparisonRow {
  label: string;
  free: string;
  pro: string;
}

interface Props {
  rows: ComparisonRow[];
}

export function ComparisonTable({ rows }: Props) {
  return (
    <View style={styles.table}>
      {/* Header */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.labelCell, styles.headerText]}>CAPABILITIES</Text>
        <Text style={[styles.cell, styles.headerText]}>FREE EDITION</Text>
        <View style={styles.proHeaderCell}>
          <Text style={styles.headerTextPro}>PRO NEURAL</Text>
        </View>
      </View>

      {rows.map((r, i) => (
        <View key={r.label} style={[styles.row, i % 2 === 0 && styles.rowAlt]}>
          <Text style={[styles.cell, styles.labelCell, styles.labelText]}>{r.label}</Text>
          <Text style={[styles.cell, styles.freeText]}>{r.free}</Text>
          <Text style={[styles.cell, styles.proText]}>{r.pro}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    marginBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  rowAlt: {
    backgroundColor: '#0F0F0F',
  },
  headerRow: {
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  cell: {
    flex: 1,
    fontSize: 11,
    color: '#555',
    textAlign: 'center',
  },
  labelCell: {
    flex: 1.2,
    textAlign: 'left',
  },
  headerText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#444',
    letterSpacing: 1,
  },
  proHeaderCell: {
    flex: 1,
    alignItems: 'center',
  },
  headerTextPro: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00F0FF',
    letterSpacing: 1,
    textAlign: 'center',
  },
  labelText: {
    color: '#666',
    fontWeight: '500',
  },
  freeText: {
    color: '#333',
    fontSize: 11,
  },
  proText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '500',
  },
});
