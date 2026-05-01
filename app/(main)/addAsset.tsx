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
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Path, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const FIELD_CONFIG = {
  [AssetType.VEHICLE]: [
    { name: "brand", label: "Brand", inputType: "text" },
    { name: "model", label: "Model", inputType: "text" },
    { name: "year", label: "Year", inputType: "numeric" },
    { name: "vin", label: "VIN", inputType: "text" },
    { name: "registrationNumber", label: "Registration Number", inputType: "text" },
  ],
  [AssetType.HOME]: [
    { name: "address", label: "Address", inputType: "text" },
    { name: "rooms", label: "Rooms", inputType: "numeric" },
    { name: "priceEvaluation", label: "Price Evaluation", inputType: "numeric" },
    { name: "constructionYear", label: "Construction Year", inputType: "numeric" },
    { name: "surface", label: "Surface (sqm)", inputType: "numeric" },
  ],
  [AssetType.LAND]: [
    { name: "address", label: "Address", inputType: "text" },
    { name: "surface", label: "Surface (sqm)", inputType: "numeric" },
    { name: "priceEvaluation", label: "Price Evaluation", inputType: "numeric" },
  ],
  [AssetType.BUSINESS]: [
    { name: "businessName", label: "Business Name", inputType: "text" },
    { name: "registrationNumber", label: "Registration Number", inputType: "text" },
    { name: "address", label: "Address", inputType: "text" },
    { name: "activityType", label: "Activity Type", inputType: "text" },
    { name: "foundedYear", label: "Founded Year", inputType: "numeric" },
  ],
  [AssetType.PERSONAL]: [
    { name: "notes", label: "Description", inputType: "text" },
  ],
  [AssetType.OTHER]: [
    { name: "notes", label: "Description", inputType: "text" },
  ],
};

export default function AddAsset() {
  const user = useAppSelector(state => state.user);
  const navi = useRouter();
  const { t } = useTranslation();
  const { control, handleSubmit, getValues, watch, formState: { errors, isSubmitting } } = useForm<Asset_DB>({
    defaultValues: {
      userId: user?.id || '',
      name: '',
      type: AssetType.VEHICLE,
      description: '',
    }
  });
  const type = watch("type");
  const [loading, setLoading] = useState(false);
  const { createAsset } = useAssets();


  const onSubmit = async () => {
   try {
    if (Object.keys(errors).length > 0) {
      Toast.show({
        type: 'error',
        text1: t('assets.form.validationError'),
      });
      return;
    }

    setLoading(true);

    const values = getValues();

    const assetData: Asset_DB = {
      ...values
    };

    const result = await createAsset(assetData);
    if(!result.success) {
      Toast.show({
        type: 'error',
        text1: t('assets.form.saveError', 'Error saving asset'),
      });
      return
    };

    Toast.show({
      type: 'success',
      text1: t('assets.form.saveSuccess', 'Asset saved successfully'),
    });

    navi.back();
   }finally {
      setLoading(false);
   }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <AnimatedBackground style={globalStyles.body}>
        {loading ? (
          <Loading />
        ):(
          <SafeAreaView style={globalStyles.safeView}>
            <BackHeader />
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
              <AssetTypePicker 
                control={control}
                name="type"
                rules={{ required: "Type is required" }}
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
              
              {type && FIELD_CONFIG[type]?.map(field => (
                <FormTextInput
                  key={field.name}
                  control={control}
                  name={field.name as Path<Asset_DB>}
                  label={field.label}
                  inputMode={field.inputType === "numeric" ? "numeric" : "text"}
                />
              ))}

              <MyMainButton
                title={t('assets.form.save', 'Save Asset')}
                isDisabled={loading}
                action={handleSubmit(onSubmit)}
              />
            </ScrollView>
          </SafeAreaView>
      )}
      </AnimatedBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
});