import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AnimatedBackground from '@/components/AnimatedBackground';
import FinancialBarChart from '@/components/FinancialBarChart';
import CallToActions from '@/components/home/CallToActions';
import CriticalAlerts from '@/components/home/CriticalAlerts';
import EntriesCounter from '@/components/home/EntriesCounter';
import HomeHeader from '@/components/home/HomeHeader';
import TimeLine from '@/components/home/TimeLine';
import { LimitBanner } from '@/components/upgrade/LimitBanner';
import globalStyles from '@/constants/GlobalStyles';
import useEntries from '@/hooks/useEntries';
import { useFreeLimitReached } from '@/hooks/useFreeLimitReached';
import { Entry } from '@/models/types';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const TAB_BAR_HEIGHT = 74;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const limitStatus = useFreeLimitReached();
  const [entries, setEntries] = React.useState<Entry[]>([]);
  const { queryEntries } = useEntries();

   const load = useCallback(async () => {
    const res = await queryEntries([]);
    if (res.success) setEntries(res.data);
    }, [queryEntries]);
  
    useFocusEffect(useCallback(() => { load(); }, [load]));



  return (
    <AnimatedBackground style={globalStyles.body}>
      <SafeAreaView style={globalStyles.safeView}>
        <ScrollView
          style={globalStyles.mainContainer}
          contentContainerStyle={{ gap: 12, paddingBottom: TAB_BAR_HEIGHT + insets.bottom }}
        >

          {limitStatus !== 'none' && <LimitBanner variant={limitStatus} />}
          <HomeHeader />

          <FinancialBarChart entries={entries} />

          <CallToActions />

          <EntriesCounter />

          <CriticalAlerts />

          <TimeLine />

        </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}
