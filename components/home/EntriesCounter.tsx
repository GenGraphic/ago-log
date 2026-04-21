import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { query } from '@/appwrite';
import { ThemedText } from '@/components/ThemedText';
import { StatusColors } from '@/constants/Colors';
import useEntries from '@/hooks/useEntries';
import { useThemeColor } from '@/hooks/useThemeColor';
import { EntryStatus } from '@/models/enums';

interface CounterItemProps {
  count: number;
  label: string;
  color: string;
}

function CounterItem({ count, label, color }: CounterItemProps) {
  return (
    <View style={styles.item}>
      <ThemedText style={[styles.count, { color }]}>
        {String(count).padStart(2, '00')}
      </ThemedText>
      <ThemedText style={styles.label}>{label}</ThemedText>
    </View>
  );
}

export default function EntriesCounter() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [expired, setExpired] = useState(0);
  const [archived, setArchived] = useState(0);
  const { queryEntries } = useEntries();
  const divider = useThemeColor({}, 'icon');

  const load = useCallback(async () => {
    const [activeRes, expiredRes, archivedRes] = await Promise.all([
      queryEntries([query.equal('status', EntryStatus.ACTIVE)]),
      queryEntries([query.equal('status', EntryStatus.EXPIRED)]),
      queryEntries([query.equal('status', EntryStatus.ARCHIVED)]),
    ]);
    if (activeRes.success)   setActive(activeRes.data.length);
    if (expiredRes.success)  setExpired(expiredRes.data.length);
    if (archivedRes.success) setArchived(archivedRes.data.length);
  }, [queryEntries]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.row}>
      <CounterItem count={active}   label={t('home.active')}   color={StatusColors.active}   />
      <View style={[styles.divider, { backgroundColor: divider }]} />
      <CounterItem count={expired}  label={t('home.expired')}  color={StatusColors.expired}  />
      <View style={[styles.divider, { backgroundColor: divider }]} />
      <CounterItem count={archived} label={t('home.archived')} color={StatusColors.archived} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingTop: 6,
  },
  count: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1,
    lineHeight: 40,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    opacity: 0.6,
  },
  divider: {
    width: 1,
    height: 40,
    opacity: 0.3,
  },
});