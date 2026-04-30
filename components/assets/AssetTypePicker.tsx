import Feather from '@expo/vector-icons/Feather';
import React, { useState } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { FlatList, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AssetType } from '@/models/enums';
import { useTranslation } from 'react-i18next';

const ASSET_TYPES = [
  { label: 'Vehicle', value: AssetType.VEHICLE },
  { label: 'Home', value: AssetType.HOME },
  { label: 'Land', value: AssetType.LAND },
  { label: 'Personal', value: AssetType.PERSONAL },
  { label: 'Business', value: AssetType.BUSINESS },
  { label: 'Other', value: AssetType.OTHER },
];

export interface AssetTypePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  rules: any;
}

export default function AssetTypePicker<T extends FieldValues>({ control, name, rules }: AssetTypePickerProps<T>) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const tint = useThemeColor({}, 'tint');
  const icon = useThemeColor({}, 'icon');
  const cardBg = useThemeColor({ light: '#E8E9EA', dark: '#141C2A' }, 'background');
  const modalBg = useThemeColor({ light: '#F6F6F6', dark: '#0D1420' }, 'background');

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <>
          <View style={styles.container}>
            <ThemedText style={[styles.label, { color: icon }]}>{t('assets.form.type', 'ASSET TYPE')}</ThemedText>
            <TouchableOpacity
              style={[
                styles.picker,
                { backgroundColor: cardBg, borderColor: value ? `${tint}50` : `${icon}30` },
              ]}
              onPress={() => setOpen(true)}
              activeOpacity={0.8}>
              <ThemedText style={[styles.label, { color: icon }]}>
                {value
                ? t(`assets.type.${value}`)
                : t('assets.form.type', 'ASSET TYPE')}
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
                <ThemedText style={styles.modalTitle}>{t('assets.form.selectType', 'SELECT TYPE')}</ThemedText>
                <TouchableOpacity onPress={() => setOpen(false)}>
                  <Feather name="x" size={20} color={icon} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={ASSET_TYPES}
                keyExtractor={item => item.value}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                  const active = value === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.option,
                        { borderColor: active ? `${tint}50` : `${icon}15` },
                        active && { backgroundColor: `${tint}10` },
                      ]}
                      onPress={() => { onChange(item.value); setOpen(false); }}
                      activeOpacity={0.7}>
                      <ThemedText style={[styles.optionText, active && { color: tint }]}>
                        {t(`assets.type.${item.value}`, item.label)}
                      </ThemedText>
                      {active && <Feather name="check" size={14} color={tint} />}
                    </TouchableOpacity>
                  );
                }}
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
