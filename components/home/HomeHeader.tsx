
import { ThemedText } from '@/components/ThemedText';
import { useNotifications } from '@/hooks/useNotifications';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAppSelector } from '@/store/hooks';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeHeader() {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.user);
  const displayName =
    user.name?.trim() || user.email?.split('@')[0]?.trim() || 'Guest';
  const tint = useThemeColor({}, 'tint');
  const router = useRouter();
  const { unreadCount } = useNotifications();

  return (
    <View style={styles.container}>
      {/* Header row with notifications */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: tint }]} />
          <ThemedText style={[styles.statusText, { color: tint }]}>{t('home.systemOnline')}</ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.push('/(main)/(tabs)/notifications')} style={{ padding: 4 }}>
          <Feather name="bell" size={24} color={tint} />
          {unreadCount > 0 && (
            <View style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#FF6060', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
              <ThemedText style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{unreadCount > 9 ? '9+' : unreadCount}</ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Welcome heading */}
      <ThemedText style={styles.welcomeText}>
        {t('home.welcomeBack', { name: displayName })}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 44,
  },
  card: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 4,
    marginTop: 4,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});