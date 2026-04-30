import AnimatedBackground from '@/components/AnimatedBackground';
import Loading from '@/components/Loading';
import { ThemedText } from '@/components/ThemedText';
import { useFocusEffect } from 'expo-router';

import AssetCard from '@/components/assets/AssetCard';
import EmptyAssetsList from '@/components/assets/EmptyAssetsList';
import globalStyles from '@/constants/GlobalStyles';
import useAssets from '@/hooks/useAssets';
import { Asset } from '@/models/assets';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

export default function AssetsScreen() {
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { t } = useTranslation();
  const { listAssets } = useAssets();

  const loadAssets = async () => {
    try {
      setLoading(true);

      const result = await listAssets();
      if(!result.success) {
        Toast.show({
          type: 'error',
          text1: t('assets.loadError'),
          text2: result.message || t('assets.loadErrorDesc'),
        });
        return;
      };

      setAssets(result.data);

    }finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      loadAssets();
    }, [])
  );


  return (
    <AnimatedBackground>
      <SafeAreaView style={globalStyles.safeView}>
        {loading ? (
          <Loading />
        ):(
          <View style={{ flex: 1, position: 'relative' }}>
            <View style={styles.header}>
              <ThemedText style={styles.headerTitle}>{t('assets.title')}</ThemedText>
            </View>
            <FlatList 
              data={assets}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.scrollContent}
              renderItem={({ item }) => (
                <AssetCard item={item} />
              )}
              ListEmptyComponent={() => <EmptyAssetsList />}
            />
          </View>
        )}
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  scrollContentEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
