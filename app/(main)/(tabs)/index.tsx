import React from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedBackground from '@/components/AnimatedBackground';
import CallToActions from '@/components/home/CallToActions';
import CriticalAlerts from '@/components/home/CriticalAlerts';
import EntriesCounter from '@/components/home/EntriesCounter';
import HomeHeader from '@/components/home/HomeHeader';
import TimeLine from '@/components/home/TimeLine';
import globalStyles from '@/constants/GlobalStyles';
import { SafeAreaView } from 'react-native-safe-area-context';

const TAB_BAR_HEIGHT = 74;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <AnimatedBackground style={globalStyles.body}>
      <SafeAreaView style={globalStyles.safeView}>
        <ScrollView
          style={globalStyles.mainContainer}
          contentContainerStyle={{ gap: 20, paddingBottom: TAB_BAR_HEIGHT + insets.bottom }}
        >

          <HomeHeader />

          <CallToActions />

          <EntriesCounter />

          <CriticalAlerts />

          <TimeLine />

        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}
