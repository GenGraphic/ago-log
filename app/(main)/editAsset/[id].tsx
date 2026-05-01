import FormTextInput from '@/components/add-new-entry/FormTextInput';
import AnimatedBackground from '@/components/AnimatedBackground';
import AssetTypePicker from '@/components/assets/AssetTypePicker';
import BackHeader from '@/components/BackHeader';
import Loading from '@/components/Loading';
import MyMainButton from '@/components/MyMainButton';
import globalStyles from '@/constants/GlobalStyles';
import useAssets from '@/hooks/useAssets';
import { Asset_DB } from '@/models/assets';
import { AssetType } from '@/models/enums';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Path, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const FIELD_CONFIG = {
  [AssetType.VEHICLE]: [
    { name: 'brand', label: 'assets.details.brand', inputType: 'text' },
    { name: 'model', label: 'assets.details.model', inputType: 'text' },
    { name: 'year', label: 'assets.details.year', inputType: 'numeric' },
    { name: 'vin', label: 'assets.details.vin', inputType: 'text' },
    { name: 'registrationNumber', label: 'assets.details.registrationNumber', inputType: 'text' },
  ],
  [AssetType.HOME]: [
    { name: 'address', label: 'assets.details.address', inputType: 'text' },
    { name: 'rooms', label: 'assets.details.rooms', inputType: 'numeric' },
    { name: 'priceEvaluation', label: 'assets.details.priceEvaluation', inputType: 'numeric' },
    { name: 'constructionYear', label: 'assets.details.constructionYear', inputType: 'numeric' },
    { name: 'surface', label: 'assets.details.surface', inputType: 'numeric' },
  ],
  [AssetType.LAND]: [
    { name: 'address', label: 'assets.details.address', inputType: 'text' },
    { name: 'surface', label: 'assets.details.surface', inputType: 'numeric' },
    { name: 'priceEvaluation', label: 'assets.details.priceEvaluation', inputType: 'numeric' },
  ],
  [AssetType.BUSINESS]: [
    { name: 'businessName', label: 'assets.details.businessName', inputType: 'text' },
    { name: 'registrationNumber', label: 'assets.details.registrationNumber', inputType: 'text' },
    { name: 'address', label: 'assets.details.address', inputType: 'text' },
    { name: 'activityType', label: 'assets.details.activityType', inputType: 'text' },
    { name: 'foundedYear', label: 'assets.details.foundedYear', inputType: 'numeric' },
  ],
  [AssetType.PERSONAL]: [
    { name: 'notes', label: 'assets.details.notes', inputType: 'text' },
  ],
  [AssetType.OTHER]: [
    { name: 'notes', label: 'assets.details.notes', inputType: 'text' },
  ],
};

export default function EditAssetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { getAsset, updateAsset } = useAssets();
  const [loading, setLoading] = useState(true);

  const { control, watch, getValues, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Asset_DB>({
    defaultValues: {
      userId: '',
      name: '',
      type: AssetType.VEHICLE,
      description: '',
    },
  });

  const type = watch('type');

  const loadAsset = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    const result = await getAsset(id);
    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: t('assets.details.loadErrorTitle'),
        text2: result.message || t('assets.details.loadErrorDesc'),
      });
      setLoading(false);
      return;
    }

    reset({
      userId: result.data.userId,
      name: result.data.name,
      type: result.data.type,
      description: result.data.description || '',
      brand: result.data.brand,
      model: result.data.model,
      year: result.data.year,
      vin: result.data.vin,
      registrationNumber: result.data.registrationNumber,
      address: result.data.address,
      rooms: result.data.rooms,
      surface: result.data.surface,
      priceEvaluation: result.data.priceEvaluation,
      constructionYear: result.data.constructionYear,
      businessName: result.data.businessName || result.data.name,
      activityType: result.data.activityType,
      foundedYear: result.data.foundedYear,
      notes: result.data.notes || result.data.description,
    });
    setLoading(false);
  }, [getAsset, id, reset, t]);

  useEffect(() => {
    loadAsset();
  }, [loadAsset]);

  const onSubmit = async () => {
    if (!id) return;

    if (Object.keys(errors).length > 0) {
      Toast.show({
        type: 'error',
        text1: t('assets.form.validationError'),
      });
      return;
    }

    const values = getValues();
    const result = await updateAsset({ ...values }, id);

    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: t('assets.form.updateError', 'Error updating asset'),
        text2: result.message,
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: t('assets.form.updateSuccess', 'Asset updated successfully'),
    });
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.safeView}>
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AnimatedBackground style={globalStyles.body}>
        <SafeAreaView style={globalStyles.safeView}>
          <BackHeader />
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <AssetTypePicker
              control={control}
              name="type"
              rules={{ required: 'Type is required' }}
            />

            <FormTextInput
              control={control}
              name="name"
              label={t('assets.form.name', 'Asset Name')}
              placeholder={t('assets.form.namePlaceholder', 'e.g. My Car')}
              rules={{ required: t('assets.form.nameRequired', 'Asset name is required') }}
            />

            <FormTextInput
              control={control}
              name="description"
              label={t('assets.form.description', 'Description')}
              placeholder={t('assets.form.descriptionPlaceholder', 'Optional')}
              multiline
            />

            {type && FIELD_CONFIG[type]?.map((field) => (
              <FormTextInput
                key={field.name}
                control={control}
                name={field.name as Path<Asset_DB>}
                label={t(field.label)}
                inputMode={field.inputType === 'numeric' ? 'numeric' : 'text'}
              />
            ))}

            <MyMainButton
              title={t('assets.form.update', 'Update Asset')}
              isDisabled={isSubmitting}
              action={handleSubmit(onSubmit)}
            />
          </ScrollView>
        </SafeAreaView>
      </AnimatedBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
});