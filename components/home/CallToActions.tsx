import Feather from '@expo/vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function CallToActions() {
  const { t } = useTranslation();
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const tintLight = useThemeColor({}, 'tintLight');
  const cardBg = useThemeColor({ light: '#1C2B2B', dark: '#1C2333' }, 'background');

  return (
    <View style={styles.row}>
      {/* ADD LOG — dark card, icon top-left, label bottom-left */}
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBg }]}
        activeOpacity={0.8}
        onPress={() => router.push('/(main)/add-entry/manual')}>
        <View style={[styles.iconBox, { borderColor: tint, borderWidth: 1 }]}>
          <Feather name="plus" size={20} color={tint} />
        </View>
        <ThemedText style={[styles.label, { color: tint }]}>{t('home.addLog')}</ThemedText>
      </TouchableOpacity>

      {/* AI SCAN — gradient card, icon top-left, label bottom-left */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => router.push('/(main)/add-entry/smart')}>
        <LinearGradient
          colors={[tint, tintLight]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.iconBox, { backgroundColor: 'rgba(0,0,0,0.15)' }]}>
          <Feather name="maximize" size={20} color="#0A1A1A" />
        </View>
        <ThemedText style={[styles.label, { color: '#0A1A1A' }]}>{t('home.aiScan')}</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    minHeight: 130,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});