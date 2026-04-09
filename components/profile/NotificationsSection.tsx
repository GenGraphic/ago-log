import React, { useState } from 'react';
import { Switch, Text, View } from 'react-native';

import { RowDivider, SectionLabel, SettingRow, sharedStyles } from './shared';

export function NotificationsSection() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  return (
    <>
      <SectionLabel title="NOTIFICATIONS" />
      <View style={sharedStyles.card}>
        <SettingRow label="Default reminder" value="7 days" onPress={() => {}} />
        <RowDivider />
        <View style={sharedStyles.row}>
          <Text style={sharedStyles.rowLabel}>Push notifications</Text>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: '#222', true: 'rgba(0,240,255,0.35)' }}
            thumbColor={pushEnabled ? '#00F0FF' : '#555'}
          />
        </View>
        <RowDivider />
        <View style={sharedStyles.row}>
          <Text style={sharedStyles.rowLabel}>Email notifications</Text>
          <Switch
            value={emailEnabled}
            onValueChange={setEmailEnabled}
            trackColor={{ false: '#222', true: 'rgba(0,240,255,0.35)' }}
            thumbColor={emailEnabled ? '#00F0FF' : '#555'}
          />
        </View>
      </View>
    </>
  );
}
