import AnimatedBackground from '@/components/AnimatedBackground';
import { ThemedText } from '@/components/ThemedText';

import globalStyles from '@/constants/GlobalStyles';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function AssetsScreen() {
  // Lock screen for production bug: feature coming soon
  return (
    <AnimatedBackground>
      <SafeAreaView style={globalStyles.safeView}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <ThemedText style={{ fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 16 }}>Coming Soon</ThemedText>
          <ThemedText style={{ fontSize: 18, color: '#fff', textAlign: 'center', paddingHorizontal: 24 }}>
            The Assets feature will be available in a future update.
          </ThemedText>
        </View>
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
