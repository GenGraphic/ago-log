import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LimitStatus } from '@/hooks/useFreeLimitReached';

const VARIANT_COLORS = {
  warning: '#FFA500',
  danger: '#FF6060',
};

const VARIANT_MESSAGES = {
  warning: "You're approaching your 5 log limit",
  danger: "You've reached the 5 log limit",
};

interface Props {
  variant?: Exclude<LimitStatus, 'none'>;
  showUpgradeLink?: boolean;
  style?: object;
}

export function LimitBanner({
  variant = 'danger',
  showUpgradeLink = true,
  style,
}: Props) {
  const router = useRouter();
  const color = VARIANT_COLORS[variant];
  const message = VARIANT_MESSAGES[variant];

  return (
    <View style={[styles.banner, { backgroundColor: `${color}1A`, borderColor: `${color}40` }, style]}>
      <Feather name="alert-triangle" size={13} color={color} />
      <Text style={[styles.text, { color }]}>{message}</Text>
      {showUpgradeLink && (
        <TouchableOpacity onPress={() => router.push('/(main)/upgrade')} style={styles.link}>
          <Text style={styles.linkText}>Upgrade now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  link: {
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 12,
    color: '#4F8EF7',
    fontWeight: '700',
  },
});
