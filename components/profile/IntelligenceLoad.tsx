import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { query } from '@/appwrite';
import { FREE_LOG_LIMIT } from '@/constants/plans';
import useEntries from '@/hooks/useEntries';
import { EntryStatus, UserPlan } from '@/models/enums';
import { useAppSelector } from '@/store/hooks';

export function IntelligenceLoad() {
  const plan = useAppSelector((s) => s.user.plan);
  const isPro = plan === UserPlan.PRO;
  const { queryEntries } = useEntries();

  const [active, setActive] = useState(0);
  const [expired, setExpired] = useState(0);

  useEffect(() => {
    async function load() {
      const [activeRes, expiredRes] = await Promise.all([
        queryEntries([query.equal('status', EntryStatus.ACTIVE)]),
        queryEntries([query.equal('status', EntryStatus.EXPIRED)]),
      ]);
      if (activeRes.success && activeRes.data) setActive(activeRes.data.length);
      if (expiredRes.success && expiredRes.data) setExpired(expiredRes.data.length);
    }
    load();
  }, [queryEntries]);

  const total = active + expired;
  const limit = isPro ? '∞' : String(FREE_LOG_LIMIT);

  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{String(active).padStart(2, '0')}</Text>
        <Text style={styles.statKey}>ACTIVE</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statCard}>
        <Text style={[styles.statValue, { color: '#FF6060' }]}>{String(expired).padStart(2, '0')}</Text>
        <Text style={styles.statKey}>EXPIRED</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statCard}>
        <Text style={styles.statValue}>
          {String(total).padStart(2, '0')}
          <Text style={styles.limitSuffix}> / {limit}</Text>
        </Text>
        <Text style={styles.statKey}>TOTAL</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#141414',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1E1E1E',
    marginVertical: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ECEDEE',
  },
  limitSuffix: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  statKey: {
    fontSize: 9,
    fontWeight: '700',
    color: '#444',
    letterSpacing: 1,
  },
});

