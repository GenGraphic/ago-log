import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { EntryType } from '@/models/enums';

type Group = { label: string; types: EntryType[] };

const GROUPS: Group[] = [
  { label: 'DOCUMENTS',      types: [EntryType.PASSPORT, EntryType.DRIVING_LICENSE, EntryType.ID_CARD, EntryType.VISA] },
  { label: 'INSURANCE',      types: [EntryType.CAR_INSURANCE, EntryType.HEALTH_INSURANCE, EntryType.HOME_INSURANCE, EntryType.TRAVEL_INSURANCE] },
  { label: 'VEHICLE',        types: [EntryType.CAR_INSPECTION, EntryType.CAR_MAINTENANCE, EntryType.VEHICLE_REGISTRATION, EntryType.VIGNETTE] },
  { label: 'MEDICAL',        types: [EntryType.VACCINATION, EntryType.PRESCRIPTION, EntryType.MEDICAL_CHECKUP] },
  { label: 'FINANCE & LEGAL',types: [EntryType.SUBSCRIPTION, EntryType.CONTRACT, EntryType.WARRANTY, EntryType.PROPERTY_LEASE] },
  { label: 'PERSONAL',       types: [EntryType.BIRTHDAY, EntryType.ANNIVERSARY] },
  { label: 'SECURE',         types: [EntryType.CREDENTIAL] },
  { label: 'OTHER',          types: [EntryType.REMINDER] },
];


export interface EntryTypePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export const formatEntryType = (type: EntryType) => type.replace(/_/g, ' ');

export default function EntryTypePicker<T extends FieldValues>({ control, name }: EntryTypePickerProps<T>) {
  const [open, setOpen] = useState(false);

  const tint = useThemeColor({}, 'tint');
  const icon = useThemeColor({}, 'icon');
  const text = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: '#E8E9EA', dark: '#141C2A' }, 'background');
  const modalBg = useThemeColor({ light: '#F6F6F6', dark: '#0D1420' }, 'background');

  return (

    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <>
          <View style={styles.container}>
            <ThemedText style={[styles.label, { color: icon }]}>ENTRY TYPE</ThemedText>
            <TouchableOpacity
              style={[
                styles.picker,
                { backgroundColor: cardBg, borderColor: value ? `${tint}50` : `${icon}30` },
              ]}
              onPress={() => setOpen(true)}
              activeOpacity={0.8}>
              <ThemedText style={[styles.pickerText, { color: value ? text : `${icon}60` }]}> 
                {value ? formatEntryType(value) : 'Select Type...'}
              </ThemedText>
              <Feather
                name={value ? 'check' : 'chevron-down'}
                size={16}
                color={value ? tint : icon}
              />
            </TouchableOpacity>
          </View>

          <Modal
            visible={open}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={() => setOpen(false)}>
            <SafeAreaView style={[styles.modal, { backgroundColor: modalBg }]}>
              <View style={[styles.modalHeader, { borderBottomColor: `${icon}15` }]}>
                <ThemedText style={styles.modalTitle}>SELECT TYPE</ThemedText>
                <TouchableOpacity onPress={() => setOpen(false)}>
                  <Feather name="x" size={20} color={icon} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={GROUPS}
                keyExtractor={g => g.label}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
                renderItem={({ item: group }) => (
                  <View style={styles.group}>
                    <ThemedText style={[styles.groupLabel, { color: `${icon}55` }]}>
                      {group.label}
                    </ThemedText>
                    {group.types.map(type => {
                      const active = value === type;
                      return (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.option,
                            { borderColor: active ? `${tint}50` : `${icon}15` },
                            active && { backgroundColor: `${tint}10` },
                          ]}
                          onPress={() => { onChange(type); setOpen(false); }}
                          activeOpacity={0.7}>
                          <ThemedText style={[styles.optionText, active && { color: tint }]}>
                            {formatEntryType(type)}
                          </ThemedText>
                          {active && <Feather name="check" size={14} color={tint} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              />
            </SafeAreaView>
          </Modal>
        </>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pickerText: {
    fontSize: 14,
  },
  // Modal
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  list: {
    padding: 16,
    gap: 24,
  },
  group: {
    gap: 8,
  },
  groupLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
  },
});
