import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PriceInfo {
  amount: string;
  period: string;
  note: string;
}

interface Props {
  price: PriceInfo;
  features: string[];
}

export function PriceCard({ price, features }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.tierBadge}>
          <Text style={styles.tierText}>ELITE TIER</Text>
        </View>
        <View style={styles.boltBadge}>
          <Feather name="zap" size={14} color="#0D0D0D" />
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.amount}>{price.amount}</Text>
        <Text style={styles.period}>{price.period}</Text>
      </View>
      <Text style={styles.note}>{price.note}</Text>

      <View style={styles.featureList}>
        {features.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Feather name="check-circle" size={14} color="#00F0FF" />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.2)',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
    backgroundColor: '#1A1A1A',
  },
  tierText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#555',
    letterSpacing: 1.5,
  },
  boltBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 4,
  },
  amount: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ECEDEE',
    lineHeight: 54,
  },
  period: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
    marginBottom: 8,
  },
  note: {
    fontSize: 10,
    color: '#333',
    letterSpacing: 0.8,
    marginBottom: 20,
  },
  featureList: {
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    color: '#BBBBBB',
  },
});
