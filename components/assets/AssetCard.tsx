import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AssetCardProps {
  title: string;
  subtitle?: string;
}

export default function AssetCard({ title, subtitle }: AssetCardProps) {
  return (
    <View style={styles.card}> 
      <View style={styles.cardRow}>
        <View style={styles.iconBox} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{title}</Text>
          {!!subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
       
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#23263A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#23263A',
    borderWidth: 1.5,
    borderColor: '#2E324A',
    marginRight: 16,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardSubtitle: {
    color: '#7B8CFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  }
});
