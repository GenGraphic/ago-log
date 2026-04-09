import Feather from '@expo/vector-icons/Feather';
import { File } from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ENTRIES_IMAGES_BUCKET_ID } from '@/appwrite';
import EntryTypePicker from '@/components/add-new-entry/EntryTypePicker';
import FormDateInput from '@/components/add-new-entry/FormDateInput';
import FormTextInput from '@/components/add-new-entry/FormTextInput';
import NotifyChips from '@/components/add-new-entry/NotifyChips';
import PhotoCapture from '@/components/add-new-entry/PhotoCapture';
import MyMainButton from '@/components/MyMainButton';
import { ThemedText } from '@/components/ThemedText';
import { FREE_LOG_LIMIT } from '@/constants/plans';
import useAI from '@/hooks/useAI';
import useEntries from '@/hooks/useEntries';
import useStorage from '@/hooks/useStorage';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ENTRY_CONFIG, EntryFieldConfig } from '@/models/entryConfig';
import { EntryStatus, EntryType, UserPlan } from '@/models/enums';
import { Entry_DB } from '@/models/types';
import { useAppSelector } from '@/store/hooks';
import Toast from 'react-native-toast-message';

type EntryFormData = {
  entryType?: EntryType;
  title: string;
  notes?: string;
  expiryDate?: string;
  notifyDays: number[];
  issuer?: string;
  identifier?: string;
  secret?: string;
  username?: string;
  url?: string;
  lastServiceDate?: string;
  intervalDays?: string;
  lastMileage?: string;
  mileageInterval?: string;
};

function hasTypeSpecificFields(config: EntryFieldConfig): boolean {
  return (
    config.showIssuer ||
    config.showIdentifier ||
    config.showSecret ||
    config.showUsername ||
    config.showUrl ||
    config.showLastServiceDate ||
    config.showIntervalDays ||
    config.showLastMileage ||
    config.showMileageInterval
  );
}

export default function ManualInputScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri?: string }>();
  const router = useRouter();

  const tint = useThemeColor({}, 'tint');
  const icon = useThemeColor({}, 'icon');
  const text = useThemeColor({}, 'text');
  const { createEntry, countEntries } = useEntries();
  const { uploadImage } = useStorage();
  const { extractEntryFromImage } = useAI();
  const userId = useAppSelector(state => state.user.id);
  const userPlan = useAppSelector(state => state.user.plan);
  const [submitting, setSubmitting] = React.useState(false);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [entryCount, setEntryCount] = React.useState<number | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  const isFree = userPlan === UserPlan.FREE;
  const atLimit = isFree && entryCount !== null && entryCount >= FREE_LOG_LIMIT;

  // Load entry count once on mount for FREE users
  React.useEffect(() => {
    if (!isFree) return;
    countEntries().then(res => {
      if (res.success) setEntryCount(res.data);
    });
  }, [isFree]);

  const { control, watch, handleSubmit, setValue } = useForm<EntryFormData>({
    defaultValues: { notifyDays: [] },
  });

  React.useEffect(() => {
    if (!photoUri) return;
    if (atLimit) return; // don't waste AI call if already at limit
    const runAIPrefill = async () => {
      setAiLoading(true);
      try {
        const file = new File(photoUri);
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        bytes.forEach(b => { binary += String.fromCharCode(b); });
        const base64 = btoa(binary);
        const result = await extractEntryFromImage(base64);
        if (!result.success) {
          Toast.show({ type: 'error', text1: 'AI extraction failed', text2: result.message });
          return;
        }
        const prefill = result.data;
        if (prefill.title)           setValue('title', prefill.title);
        if (prefill.entryType)       setValue('entryType', prefill.entryType);
        if (prefill.notes)           setValue('notes', prefill.notes);
        if (prefill.expiryDate)      setValue('expiryDate', prefill.expiryDate);
        if (prefill.issuer)          setValue('issuer', prefill.issuer);
        if (prefill.identifier)      setValue('identifier', prefill.identifier);
        if (prefill.username)        setValue('username', prefill.username);
        if (prefill.url)             setValue('url', prefill.url);
        if (prefill.lastServiceDate) setValue('lastServiceDate', prefill.lastServiceDate);
        if (prefill.lastMileage)     setValue('lastMileage', String(prefill.lastMileage));
        if (prefill.mileageInterval) setValue('mileageInterval', String(prefill.mileageInterval));
      } catch (err: any) {
        Toast.show({ type: 'error', text1: 'AI error', text2: err.message });
      } finally {
        setAiLoading(false);
      }
    };
    runAIPrefill();
  }, [photoUri]);

  const entryType = watch('entryType');
  const watchedTitle = watch('title');
  const config = entryType ? ENTRY_CONFIG[entryType] : null;
  const showTypeFields = config ? hasTypeSpecificFields(config) : false;

  const onSubmit = async (data: EntryFormData) => {
    if (!data.entryType) {
      Toast.show({ type: 'error', text1: 'Entry type required', text2: 'Please select a type before saving.' });
      return;
    }

    // Free plan hard cap
    if (atLimit) {
      setShowUpgradeModal(true);
      return;
    }

    setSubmitting(true);
    try {
      // Upload photo if one was taken
      let imageId: string | undefined;
      if (photoUri) {
        const imageUpload = await uploadImage(ENTRIES_IMAGES_BUCKET_ID, photoUri);
        if(!imageUpload.success){
          Toast.show({
            type: 'error',
            text1: "Error!",
            text2: imageUpload.message,
          });
          return;
        };

        imageId = imageUpload.data;
      }

      const notifyDaysBefore = data.notifyDays.length > 0 ? Math.min(...data.notifyDays) : undefined;

      const isPast = data.expiryDate
        ? new Date(data.expiryDate).getTime() < Date.now()
        : false;

      const newEntry: Entry_DB = {
        userId,
        title: data.title,
        entryType: data.entryType,
        status: isPast ? EntryStatus.EXPIRED : EntryStatus.ACTIVE,
        notes: data.notes || undefined,
        expiryDate: data.expiryDate || undefined,
        notifyDaysBefore,
        issuer: data.issuer || undefined,
        identifier: data.identifier || undefined,
        secret: data.secret || undefined,
        username: data.username || undefined,
        url: data.url || undefined,
        lastServiceDate: data.lastServiceDate || undefined,
        intervalDays: data.intervalDays ? parseInt(data.intervalDays, 10) : undefined,
        lastMileage: data.lastMileage ? parseInt(data.lastMileage, 10) : undefined,
        mileageInterval: data.mileageInterval ? parseInt(data.mileageInterval, 10) : undefined,
        imageId,
      };

      const result = await createEntry(newEntry);

      if (!result.success) {
        Toast.show({ type: 'error', text1: 'Failed to save', text2: result.message });
        return;
      }

      Toast.show({ type: 'success', text1: 'Entry sealed', text2: `${data.title} has been added to your vault.` });

      // Warn on 4th entry (1 free slot left)
      if (isFree && entryCount !== null && entryCount + 1 === FREE_LOG_LIMIT - 1) {
        Toast.show({ type: 'info', text1: 'Almost at your limit', text2: 'You have 1 free log remaining. Upgrade for unlimited.', visibilityTime: 5000 });
      }

      router.replace('/(main)/(tabs)');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Unexpected error', text2: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#0B1120' }]}>

      {/* ── AI loading overlay ── */}
      {aiLoading && (
        <View style={styles.aiOverlay}>
          <ActivityIndicator size="large" color={tint} />
          <ThemedText style={[styles.aiOverlayText, { color: text }]}>AI IS THINKING...</ThemedText>
        </View>
      )}

      {/* ── Free limit upgrade modal ── */}
      <Modal visible={showUpgradeModal} transparent animationType="fade" onRequestClose={() => setShowUpgradeModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: '#111827' }]}>
            <View style={[styles.modalIconRow]}>
              <Feather name="lock" size={28} color={tint} />
            </View>
            <ThemedText style={[styles.modalTitle, { color: text }]}>FREE LIMIT REACHED</ThemedText>
            <ThemedText style={[styles.modalBody, { color: `${icon}CC` }]}>
              You've used all {FREE_LOG_LIMIT} free logs. Upgrade to PRO for unlimited entries, AI scans, and notifications.
            </ThemedText>
            <TouchableOpacity
              style={[styles.modalUpgradeBtn, { backgroundColor: tint }]}
              onPress={() => { setShowUpgradeModal(false); router.push('/(main)/upgrade'); }}>
              <ThemedText style={styles.modalUpgradeBtnText}>UPGRADE TO PRO</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalDismiss} onPress={() => setShowUpgradeModal(false)}>
              <ThemedText style={[styles.modalDismissText, { color: `${icon}80` }]}>DISMISS</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={icon} />
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <ThemedText style={[styles.logoText, { color: text }]}>AGO_LOG</ThemedText>
          <View style={[styles.logoDot, { backgroundColor: tint }]} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Title area ── */}
      <View style={styles.titleArea}>
        <ThemedText style={[styles.sectionLabel, { color: `${icon}80` }]}>
          VAULT ACQUISITION
        </ThemedText>
        <ThemedText style={[styles.pageTitle, { color: text }]}>
          {watchedTitle?.trim() || 'Manual Entry'}
        </ThemedText>
        {entryType && (
          <ThemedText style={[styles.entrySubtitle, { color: `${icon}70` }]}>
            SECURE ENTRY · {entryType.replace(/_/g, ' ').toUpperCase()}
          </ThemedText>
        )}
      </View>

      {/* ── Form ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          <PhotoCapture uri={photoUri} />

          <EntryTypePicker control={control} name="entryType" />

          <FormTextInput
            control={control}
            name="title"
            label="TITLE"
            placeholder="e.g. Nexus Corp Agreement"
            rules={{ required: 'Title is required' }}
          />

          {config?.showExpiryDate && (
            <FormDateInput
              control={control}
              name="expiryDate"
              label={config.expiryLabel.toUpperCase()}
            />
          )}

          {config?.showNotifyDaysBefore && (
            <NotifyChips control={control} name="notifyDays" />
          )}

          {/* ── Type-specific fields ── */}
          {showTypeFields && config && (
            <>
              <View style={styles.sectionDivider}>
                <View style={[styles.dividerLine, { backgroundColor: `${tint}25` }]} />
                <ThemedText style={[styles.dividerLabel, { color: `${tint}90` }]}>
                  {entryType?.replace(/_/g, ' ').toUpperCase()} FIELDS
                </ThemedText>
                <View style={[styles.dividerLine, { backgroundColor: `${tint}25` }]} />
              </View>

              {config.showIssuer && (
                <FormTextInput control={control} name="issuer" label="ISSUER" placeholder="Organisation or company" />
              )}
              {config.showIdentifier && (
                <FormTextInput control={control} name="identifier" label="IDENTIFIER" placeholder="Policy number, ID, reference" sensitive />
              )}
              {config.showSecret && (
                <FormTextInput control={control} name="secret" label="SECRET" placeholder="Password or secret key" sensitive secureTextEntry />
              )}
              {config.showUsername && (
                <FormTextInput control={control} name="username" label="USERNAME" placeholder="Username or email" />
              )}
              {config.showUrl && (
                <FormTextInput control={control} name="url" label="URL" placeholder="https://..." keyboardType="url" autoCapitalize="none" />
              )}
              {config.showLastServiceDate && (
                <FormDateInput control={control} name="lastServiceDate" label="LAST SERVICE DATE" />
              )}
              {config.showIntervalDays && (
                <FormTextInput control={control} name="intervalDays" label="SERVICE INTERVAL (DAYS)" placeholder="e.g. 365" keyboardType="number-pad" />
              )}
              {config.showLastMileage && (
                <FormTextInput control={control} name="lastMileage" label="LAST MILEAGE" placeholder="e.g. 45000" keyboardType="number-pad" />
              )}
              {config.showMileageInterval && (
                <FormTextInput control={control} name="mileageInterval" label="MILEAGE INTERVAL" placeholder="e.g. 10000" keyboardType="number-pad" />
              )}
            </>
          )}

          <FormTextInput
            control={control}
            name="notes"
            label="NOTES"
            placeholder={
              config
                ? 'Additional information...'
                : 'Specific intelligence fields will materialise once an Entry Type is defined.'
            }
            multiline
          />

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <MyMainButton
          title={submitting ? 'SEALING...' : 'SEAL ENTRY'}
          isDisabled={submitting}
          action={handleSubmit(onSubmit)}
        />
        <TouchableOpacity style={styles.voidBtn} onPress={() => router.back()}>
          <ThemedText style={[styles.voidText, { color: `${icon}80` }]}>VOID ENTRY</ThemedText>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  aiOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 99,
    backgroundColor: 'rgba(11,17,32,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  aiOverlayText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  // Upgrade modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  modalIconRow: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,240,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  modalUpgradeBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  modalUpgradeBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#0B1120',
  },
  modalDismiss: {
    paddingVertical: 8,
  },
  modalDismissText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  logoText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  // Title area
  titleArea: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 2,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  entrySubtitle: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  // Section divider
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 12,
  },
  voidBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  voidText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
