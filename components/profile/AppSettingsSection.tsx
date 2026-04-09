import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { RowDivider, SectionLabel, SettingRow, sharedStyles } from './shared';

export function AppSettingsSection() {
  const [milesEnabled, setMilesEnabled] = useState(true);

  return (
    <>
      <SectionLabel title="APP SETTINGS" />
      <View style={sharedStyles.card}>
        <SettingRow label="Interface Language" value="English" onPress={() => {}} />
        <RowDivider />
        <SettingRow label="System Theme" value="DARK VOID" onPress={() => {}} />
        <RowDivider />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unitsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555',
    letterSpacing: 0.8,
    width: 36,
  },
});
