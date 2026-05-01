import AnimatedBackground from '@/components/AnimatedBackground';
import AssetTypeFilter, { AssetFilterKey } from '@/components/assets/AssetTypeFilter';
import { ThemedText } from '@/components/ThemedText';

import AssetCard from '@/components/assets/AssetCard';
import SearchBar from '@/components/entries/SearchBar';
import MyFAB from '@/components/MyFAB';
import { StatusColors } from '@/constants/Colors';
import useAssets from '@/hooks/useAssets';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Asset } from '@/models/assets';
import { AssetType } from '@/models/enums';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const TYPE_ORDER: AssetType[] = [
  AssetType.VEHICLE,
  AssetType.HOME,
  AssetType.LAND,
  AssetType.BUSINESS,
  AssetType.PERSONAL,
  AssetType.OTHER,
];

const TYPE_DOT_COLOR: Record<AssetType, string> = {
  [AssetType.VEHICLE]: '#3DB8FF',
  [AssetType.HOME]: '#22C55E',
  [AssetType.LAND]: '#84CC16',
  [AssetType.BUSINESS]: '#A78BFA',
  [AssetType.PERSONAL]: '#F59E0B',
  [AssetType.OTHER]: StatusColors.active,
};

type SectionData = {
  title: string;
  dot: string;
  count: number;
  data: Asset[];
};

export default function AssetsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<AssetFilterKey>('ALL');
  const { t } = useTranslation();
  const tint = useThemeColor({}, 'tint');
  const icon = useThemeColor({}, 'icon');
  const dividerBg = useThemeColor({ light: '#FFFFFF', dark: '#141C2A' }, 'background');
  const { listAssets } = useAssets();

  const loadAssets = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const assetsResult = await listAssets();

      if(!assetsResult.success) {
        Toast.show({
          type: 'error',
          text1: t('assets.loadError'),
          text2: assetsResult.message || t('assets.loadErrorDesc'),
        });
        return;
      };

      setAssets(assetsResult.data);

    }finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [listAssets, t]);

  useFocusEffect(
    useCallback(() => {
      loadAssets();
    }, [loadAssets]),
  );

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesType = selectedType === 'ALL' ? true : asset.type === selectedType;

      if (!matchesType) return false;
      if (!query) return true;

      return (
        asset.name.toLowerCase().includes(query) ||
        asset.type.toLowerCase().includes(query) ||
        (asset.description ?? '').toLowerCase().includes(query) ||
        (asset.address ?? '').toLowerCase().includes(query) ||
        (asset.registrationNumber ?? '').toLowerCase().includes(query)
      );
    });
  }, [assets, search, selectedType]);

  const sections = useMemo<SectionData[]>(() => {
    const grouped: SectionData[] = [];

    TYPE_ORDER.forEach((type) => {
      const items = filteredAssets
        .filter((asset) => asset.type === type)
        .sort((a, b) => a.name.localeCompare(b.name));

      if (!items.length) return;

      grouped.push({
        title: t(`assets.type.${type}`),
        dot: TYPE_DOT_COLOR[type],
        count: items.length,
        data: items,
      });
    });

    return grouped;
  }, [filteredAssets, t]);


  return (
    <AnimatedBackground style={styles.fill}>
      <SafeAreaView style={styles.fill}>
        {loading ? (
          <ActivityIndicator color={tint} style={{ flex: 1 }} />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <SearchBar
                  value={search}
                  onChangeText={setSearch}
                  placeholder={t('assets.searchPlaceholder')}
                />
                <AssetTypeFilter selected={selectedType} onSelect={setSelectedType} />
              </View>
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <ThemedText style={[styles.emptyText, { color: `${icon}60` }]}>
                  {t('assets.noAssets')}
                </ThemedText>
              </View>
            }
            renderSectionHeader={({ section }) => (
              <View style={[styles.sectionHeader, { borderBottomColor: `${icon}10` }]}>
                <View style={[styles.sectionDot, { backgroundColor: section.dot }]} />
                <ThemedText style={[styles.sectionTitle, { color: `${icon}80` }]}>
                  {section.title}
                </ThemedText>
                <ThemedText style={[styles.sectionCount, { color: `${icon}50` }]}>
                  {t('entries.record', { count: section.count })}
                </ThemedText>
              </View>
            )}
            renderItem={({ item, index, section }) => (
              <View style={[styles.rowWrapper, { backgroundColor: dividerBg }]}>
                <AssetCard
                  item={item}
                  linkedEntriesLabel={t('assets.linkedEntryCount', { count: item.entries?.length ?? 0 })}
                  onPress={() =>
                    router.push({
                      pathname: '/(main)/asset-details/[id]',
                      params: { id: item.id },
                    })
                  }
                />
                {index < section.data.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: `${icon}10` }]} />
                )}
              </View>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadAssets(true)}
                tintColor={tint}
                colors={[tint]}
              />
            }
          />
        )}

        <MyFAB
          onPress={() =>
            router.push({
              pathname: '/(main)/addAsset',
            })
          }
          bottom={130}
          accessibilityLabel="Create asset"
        />
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  listContent: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 170,
  },
  header: {
    gap: 12,
    paddingBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginBottom: 2,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  sectionCount: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  rowWrapper: {
    borderRadius: 14,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginLeft: 62,
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
