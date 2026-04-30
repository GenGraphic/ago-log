import { useThemeColor } from '@/hooks/useThemeColor';
import { Asset } from '@/models/assets';
import { AssetType } from '@/models/enums';
import Feather from '@expo/vector-icons/Feather';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AssetCardProps {
  item: Asset;
}

  // Map asset type to Feather icon name
  const typeIconMap: Record<AssetType, keyof typeof Feather.glyphMap> = {
    [AssetType.VEHICLE]: 'truck',
    [AssetType.HOME]: 'home',
    [AssetType.LAND]: 'map',
    [AssetType.PERSONAL]: 'user',
    [AssetType.BUSINESS]: 'briefcase',
    [AssetType.OTHER]: 'box',
  };

export default function AssetCard({ item }: AssetCardProps) {
  const tint = useThemeColor({}, 'tint');

  return (
    <View style={styles.card}> 
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <Feather
            name={typeIconMap[item.type] || 'box'}
            size={22}
            color={tint}
            style={{ alignSelf: 'center', marginTop: 7 }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {!!item.description && <Text ellipsizeMode='tail' style={[styles.cardSubtitle, { color: tint }]}>{item.description}</Text>}
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
