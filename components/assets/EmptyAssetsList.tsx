import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import MyMainButton from '../MyMainButton';


const EmptyAssetsList = () => {
  const navi = useRouter();
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📦</Text>
      <ThemedText style={styles.title}>{t('assets.emptyTitle')}</ThemedText>
      <ThemedText style={styles.subtitle}>{t('assets.emptySubtitle')}</ThemedText>
      <MyMainButton 
        action={() => navi.push("/(main)/addAsset")}
        isDisabled={false}
        title={t('assets.addNew')}
      />
    </View>
  );
}

export default EmptyAssetsList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    opacity: 0.7,
    gap: 12
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#00F0FF',
  },
  subtitle: {
    fontSize: 14,
    color: '#7B8CFF',
    textAlign: 'center',
    maxWidth: 260,
  },
});
