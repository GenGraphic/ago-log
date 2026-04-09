import React from 'react';
import { View } from 'react-native';

import { RowDivider, SectionLabel, SettingRow, sharedStyles } from './shared';

export function DataSection() {
  return (
    <>
      <SectionLabel title="DATA MANAGEMENT" />
      <View style={sharedStyles.card}>
        <SettingRow label="Export ledger account" onPress={() => {}} />
        <RowDivider />
        <SettingRow
          label="Delete account"
          onPress={() => {}}
          danger
          rightIcon="trash-2"
        />
      </View>
    </>
  );
}
