import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AnimatedBackground from '@/components/AnimatedBackground';
import { ThemedText } from '@/components/ThemedText';
import { LimitBanner } from '@/components/upgrade/LimitBanner';
import { StatusColors } from '@/constants/Colors';
import globalStyles from '@/constants/GlobalStyles';
import { useFreeLimitReached } from '@/hooks/useFreeLimitReached';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function PickMethod() {
  const router = useRouter();
  const limitStatus = useFreeLimitReached();
  const tint = useThemeColor({}, 'tint');
  const icon = useThemeColor({}, 'icon');
  const cardBg = useThemeColor({ light: '#FFFFFF', dark: '#1C2333' }, 'background');

  return (
    <AnimatedBackground style={globalStyles.body}>
      <SafeAreaView style={globalStyles.safeView}>
        <View style={[globalStyles.mainContainer, styles.mainContanier]}>

          {limitStatus !== 'none' && <LimitBanner variant={limitStatus} style={{ marginHorizontal: 0 }} />}

          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>ADD NEW LOG</ThemedText>
            <View style={styles.subtitleRow}>
              <View style={[styles.dot, { backgroundColor: tint }]} />
              <ThemedText style={[styles.subtitle, { color: icon }]}>HOW DO YOU WANT TO ADD IT?</ThemedText>
            </View>
          </View>

          {/* Options */}
          <View style={styles.options}>
            {/* AI Scan */}
            <TouchableOpacity
              style={[styles.card, { backgroundColor: cardBg, borderColor: tint, borderWidth: 1 }]}
              activeOpacity={0.8}
              onPress={() => router.push('/(main)/add-entry/smart')}>
              <View style={[styles.iconBox, { backgroundColor: `${tint}18` }]}>
                <Feather name="camera" size={26} color={tint} />
              </View>
              <ThemedText style={styles.cardTitle}>Scan with AI</ThemedText>
              <ThemedText style={[styles.cardSub, { color: icon }]}>TAKE A PHOTO, AI FILLS IT</ThemedText>
            </TouchableOpacity>

            {/* Manual */}
            <TouchableOpacity
              style={[styles.card, { backgroundColor: cardBg }]}
              activeOpacity={0.8}
              onPress={() => router.push('/(main)/add-entry/manual')}>
              <View style={[styles.iconBox, { backgroundColor: `${icon}22` }]}>
                <Feather name="align-left" size={26} color={icon} />
              </View>
              <ThemedText style={styles.cardTitle}>Manual Entry</ThemedText>
              <ThemedText style={[styles.cardSub, { color: icon }]}>FILL DETAILS MANUALLY</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Security badges */}
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Feather name="shield" size={14} color={icon} />
              <ThemedText style={[styles.badgeText, { color: icon }]}>SECURITY</ThemedText>
            </View>
            <View style={styles.badge}>
              <Feather name="star" size={14} color={StatusColors.archived} />
              <ThemedText style={[styles.badgeText, { color: icon }]}>SENTENCE</ThemedText>
            </View>
            <View style={styles.badge}>
              <Feather name="refresh-cw" size={14} color={icon} />
              <ThemedText style={[styles.badgeText, { color: icon }]}>SYNC</ThemedText>
            </View>
          </View>

        </View>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  mainContanier: {
    justifyContent: 'space-between',
    marginBottom: 50,
  },
  header: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 3,
    textAlign: 'center',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  options: {
    gap: 16,
  },
  card: {
    borderRadius: 20,
    paddingVertical: 36,
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  cardSub: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  badges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  badge: {
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    opacity: 0.6,
  },
});