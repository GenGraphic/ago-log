import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

type PhotoCaptureProps = {
  uri?: string | null;
  onRetake?: () => void;
};

/**
 * Empty state   → tappable card that opens the camera (smart screen).
 * Filled state  → shows the captured image with a "Retake" button.
 */
export default function PhotoCapture({ uri, onRetake }: PhotoCaptureProps) {
  const router = useRouter();
  const tint = useThemeColor({}, 'tint');
  const icon = useThemeColor({}, 'icon');
  const cardBg = useThemeColor({ light: '#141C2A', dark: '#141C2A' }, 'background');

  const handlePress = () => {
    router.push('/(main)/add-entry/smart');
  };

  if (uri) {
    return (
      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Image source={{ uri }} style={styles.preview} contentFit="cover" />
        {/* Retake overlay */}
        <TouchableOpacity
          style={[styles.retakeBtn, { backgroundColor: 'rgba(0,0,0,0.55)', borderColor: tint }]}
          onPress={onRetake ?? handlePress}
          activeOpacity={0.8}>
          <Feather name="camera" size={14} color={tint} />
          <ThemedText style={[styles.retakeLabel, { color: tint }]}>Retake</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, styles.empty, { backgroundColor: cardBg }]}
      onPress={handlePress}
      activeOpacity={0.8}>
      {/* Icon box */}
      <View style={[styles.iconBox, { backgroundColor: `${tint}14`, borderColor: `${tint}30`, borderWidth: 1 }]}>
        <Feather name="maximize" size={28} color={tint} />
      </View>

      <ThemedText style={styles.emptyTitle}>Add Photo (AI Scan)</ThemedText>
      <ThemedText style={[styles.emptySubtitle, { color: icon }]}>
        Extract intelligence from images automatically
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  // Empty state
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    gap: 12,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Filled state
  preview: {
    width: '100%',
    height: 200,
  },
  retakeBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  retakeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
