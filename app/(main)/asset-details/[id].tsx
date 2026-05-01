import AnimatedBackground from '@/components/AnimatedBackground';
import BackHeader from '@/components/BackHeader';
import Loading from '@/components/Loading';
import MyMainButton from '@/components/MyMainButton';
import { ThemedText } from '@/components/ThemedText';
import globalStyles from '@/constants/GlobalStyles';
import useAssets from '@/hooks/useAssets';
import useEntries from '@/hooks/useEntries';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Asset } from '@/models/assets';
import { AssetType } from '@/models/enums';
import { Entry } from '@/models/types';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '-';
  if (typeof value === 'number') return value.toLocaleString();
  return String(value);
}

function getFieldValue(asset: Asset, key: keyof Asset): unknown {
  if (key === 'notes') {
    return asset.notes ?? asset.description;
  }

  if (key === 'businessName') {
    return asset.businessName ?? asset.name;
  }

  return asset[key];
}

function extractEntryIds(entries: Asset['entries'] | undefined): string[] {
  if (!Array.isArray(entries)) return [];

  const ids: string[] = [];
  entries.forEach((item) => {
    if (typeof item === 'string') {
      ids.push(item);
      return;
    }
    if (item?.id) {
      ids.push(item.id);
    }
  });

  return Array.from(new Set(ids));
}

const TYPE_FIELDS: Record<AssetType, Array<{ label: string; key: keyof Asset }>> = {
  [AssetType.VEHICLE]: [
    { label: 'assets.details.brand', key: 'brand' },
    { label: 'assets.details.model', key: 'model' },
    { label: 'assets.details.year', key: 'year' },
    { label: 'assets.details.vin', key: 'vin' },
    { label: 'assets.details.registrationNumber', key: 'registrationNumber' },
  ],
  [AssetType.HOME]: [
    { label: 'assets.details.address', key: 'address' },
    { label: 'assets.details.rooms', key: 'rooms' },
    { label: 'assets.details.surface', key: 'surface' },
    { label: 'assets.details.priceEvaluation', key: 'priceEvaluation' },
    { label: 'assets.details.constructionYear', key: 'constructionYear' },
  ],
  [AssetType.LAND]: [
    { label: 'assets.details.address', key: 'address' },
    { label: 'assets.details.surface', key: 'surface' },
    { label: 'assets.details.priceEvaluation', key: 'priceEvaluation' },
  ],
  [AssetType.BUSINESS]: [
    { label: 'assets.details.businessName', key: 'businessName' },
    { label: 'assets.details.registrationNumber', key: 'registrationNumber' },
    { label: 'assets.details.address', key: 'address' },
    { label: 'assets.details.activityType', key: 'activityType' },
    { label: 'assets.details.foundedYear', key: 'foundedYear' },
  ],
  [AssetType.PERSONAL]: [{ label: 'assets.details.notes', key: 'notes' }],
  [AssetType.OTHER]: [{ label: 'assets.details.notes', key: 'notes' }],
};

export default function AssetDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const icon = useThemeColor({}, 'icon');
  const danger = useThemeColor({ light: '#B42318', dark: '#F04438' }, 'tint');
  const cardBg = useThemeColor({ light: '#F1F2F4', dark: '#141C2A' }, 'background');
  const modalBg = useThemeColor({ light: '#FFFFFF', dark: '#111827' }, 'background');
  const insets = useSafeAreaInsets();

  const { getAsset, deleteAsset, updateAsset } = useAssets();
  const { listEntries } = useEntries();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [savingLinks, setSavingLinks] = useState(false);
  const [availableEntries, setAvailableEntries] = useState<Entry[]>([]);
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);

  const loadAsset = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const assetResult = await getAsset(id);

    if (!assetResult.success) {
      Toast.show({
        type: 'error',
        text1: t('assets.details.loadErrorTitle'),
        text2: assetResult.message || t('assets.details.loadErrorDesc'),
      });
      setAsset(null);
      setLoading(false);
      return;
    }

    setAsset(assetResult.data);
    setSelectedEntryIds(extractEntryIds(assetResult.data.entries));

    setLoading(false);
  }, [getAsset, id, t]);

  const openLinkModal = useCallback(async () => {
    setLinkModalOpen(true);
    setEntriesLoading(true);
    const entriesResult = await listEntries();

    if (entriesResult.success) {
      setAvailableEntries(entriesResult.data);
    } else {
      Toast.show({
        type: 'error',
        text1: t('assets.details.loadEntriesErrorTitle', 'Could not load entries'),
        text2: entriesResult.message || t('assets.details.loadEntriesErrorDesc', 'Please try again.'),
      });
    }

    setEntriesLoading(false);
  }, [listEntries, t]);

  const toggleEntrySelection = useCallback((entryId: string) => {
    setSelectedEntryIds((prev) =>
      prev.includes(entryId) ? prev.filter((idValue) => idValue !== entryId) : [...prev, entryId],
    );
  }, []);

  const saveLinkedEntries = useCallback(async () => {
    if (!id) return;

    setSavingLinks(true);
    const result = await updateAsset({ entries: selectedEntryIds }, id);
    setSavingLinks(false);

    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: t('assets.details.saveEntriesErrorTitle', 'Could not save linked entries'),
        text2: result.message || t('assets.details.saveEntriesErrorDesc', 'Please try again.'),
      });
      return;
    }

    setLinkModalOpen(false);
    loadAsset();
    Toast.show({
      type: 'success',
      text1: t('assets.details.saveEntriesSuccess', 'Linked entries updated'),
    });
  }, [id, selectedEntryIds, updateAsset, t, loadAsset]);

  useFocusEffect(
    useCallback(() => {
      loadAsset();
    }, [loadAsset]),
  );

  const detailFields = useMemo(() => {
    if (!asset) return [];
    return TYPE_FIELDS[asset.type] || [];
  }, [asset]);

  const onDelete = () => {
    if (!id) return;

    Alert.alert(
      t('assets.details.deleteTitle'),
      t('assets.details.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const result = await deleteAsset(id);
              if (!result.success) {
                Toast.show({
                  type: 'error',
                  text1: t('assets.details.deleteErrorTitle'),
                  text2: result.message || t('assets.details.deleteErrorDesc'),
                });
                return;
              }

              Toast.show({
                type: 'success',
                text1: t('assets.details.deleteSuccess'),
              });
              router.replace('/(main)/(tabs)/assets');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.safeView}>
        <Loading />
      </SafeAreaView>
    );
  }

  if (!asset) {
    return (
      <SafeAreaView style={globalStyles.safeView}>
        <BackHeader />
        <View style={styles.emptyWrap}>
          <ThemedText style={[styles.emptyText, { color: icon }]}>
            {t('assets.details.notFound')}
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <AnimatedBackground style={globalStyles.body}>
        <SafeAreaView style={globalStyles.safeView}>
            <View style={globalStyles.mainContainer}>
                <BackHeader
                    rightIcon="edit-2"
                    onRightPress={() =>
                    router.push({
                        pathname: '/(main)/editAsset/[id]',
                        params: { id: asset.id },
                    })
                    }
                    rightAccessibilityLabel={t('assets.details.edit', 'Edit Asset')}
                />
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={[styles.heroCard, { backgroundColor: cardBg }]}> 
                    <ThemedText style={[styles.typeLabel, { color: `${icon}99` }]}>
                        {asset.type.toUpperCase()}
                    </ThemedText>
                    <ThemedText style={[styles.assetName, { color: text }]}>
                        {asset.name}
                    </ThemedText>
                    <ThemedText style={[styles.assetDescription, { color: icon }]}>
                        {asset.description || t('assets.details.noDescription')}
                    </ThemedText>
                    <ThemedText style={[styles.assetLinkedCount, { color: `${icon}B0` }]}>
                        {t('assets.linkedEntryCount', { count: asset.entries?.length ?? 0 })}
                    </ThemedText>
                    </View>

                    <View style={[styles.detailsCard, { backgroundColor: cardBg }]}> 
                    <ThemedText style={[styles.sectionTitle, { color: text }]}>
                        {t('assets.details.detailsTitle')}
                    </ThemedText>

                    {detailFields.map((field) => (
                        <View key={String(field.key)} style={styles.row}>
                        <ThemedText style={[styles.label, { color: `${icon}C0` }]}>
                            {t(field.label)}
                        </ThemedText>
                        <ThemedText style={[styles.value, { color: text }]}>
                            {formatValue(getFieldValue(asset, field.key))}
                        </ThemedText>
                        </View>
                    ))}

                    <View style={styles.row}>
                        <ThemedText style={[styles.label, { color: `${icon}C0` }]}>
                        {t('assets.details.createdAt')}
                        </ThemedText>
                        <ThemedText style={[styles.value, { color: text }]}>
                        {new Date(asset.createdAt as unknown as string).toLocaleDateString()}
                        </ThemedText>
                    </View>

                    <TouchableOpacity
                        onPress={onDelete}
                        disabled={deleting || savingLinks}
                        style={styles.deleteInlineButton}
                        activeOpacity={0.8}
                    >
                        <Feather name="trash-2" size={13} color={`${danger}CC`} />
                        <ThemedText style={[styles.deleteInlineText, { color: `${danger}CC` }]}>
                        {t('assets.details.delete')}
                        </ThemedText>
                    </TouchableOpacity>
                    </View>
                </ScrollView>

                <MyMainButton
                    title={t('assets.details.addEntries', 'Add Entries')}
                    isDisabled={deleting || savingLinks}
                    action={openLinkModal}
                    customColor={tint}
                />

                <Modal
                    visible={linkModalOpen}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setLinkModalOpen(false)}
                >
                    <View style={styles.modalBackdrop}>
                  <View style={[styles.modalCard, { backgroundColor: modalBg, paddingBottom: Math.max(insets.bottom, 12) }]}> 
                        <View style={[styles.modalHeader, { borderBottomColor: `${icon}20` }]}> 
                        <ThemedText style={[styles.modalTitle, { color: text }]}>
                            {t('assets.details.selectEntriesTitle', 'Select Entries')}
                        </ThemedText>
                        <TouchableOpacity onPress={() => setLinkModalOpen(false)} style={styles.modalCloseBtn}>
                            <Feather name="x" size={18} color={icon} />
                        </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalList}>
                        {entriesLoading ? (
                            <ThemedText style={[styles.modalEmptyText, { color: `${icon}80` }]}>
                            {t('assets.details.loadingEntries', 'Loading entries...')}
                            </ThemedText>
                        ) : availableEntries.length === 0 ? (
                            <ThemedText style={[styles.modalEmptyText, { color: `${icon}80` }]}>
                            {t('assets.details.noEntriesAvailable', 'No entries available')}
                            </ThemedText>
                        ) : (
                            availableEntries.map((entry) => {
                            const checked = selectedEntryIds.includes(entry.id);

                            return (
                                <TouchableOpacity
                                key={entry.id}
                                style={[styles.entryRow, { borderColor: checked ? `${tint}55` : `${icon}20` }]}
                                onPress={() => toggleEntrySelection(entry.id)}
                                activeOpacity={0.8}
                                >
                                <View style={styles.entryTextWrap}>
                                    <ThemedText style={[styles.entryTitle, { color: text }]} numberOfLines={1}>
                                    {entry.title}
                                    </ThemedText>
                                    <ThemedText style={[styles.entrySubtitle, { color: `${icon}75` }]} numberOfLines={1}>
                                    {entry.entryType.replace(/_/g, ' ').toUpperCase()}
                                    </ThemedText>
                                </View>
                                <Feather
                                    name={checked ? 'check-square' : 'square'}
                                    size={18}
                                    color={checked ? tint : `${icon}80`}
                                />
                                </TouchableOpacity>
                            );
                            })
                        )}
                        </ScrollView>

                        <MyMainButton
                        title={t('assets.details.saveEntries', 'Save Entries')}
                        isDisabled={savingLinks || entriesLoading}
                        action={saveLinkedEntries}
                        customColor={tint}
                        />
                    </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    gap: 14,
  },
  heroCard: {
    borderRadius: 14,
    padding: 16,
  },
  typeLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  assetName: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 6,
  },
  assetDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  assetLinkedCount: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  detailsCard: {
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  deleteInlineButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  deleteInlineText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  bottomActionBar: {
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
    height: '85%',
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    flex: 1,
  },
  modalList: {
    gap: 8,
    paddingBottom: 14,
  },
  modalEmptyText: {
    textAlign: 'center',
    paddingVertical: 18,
    fontSize: 13,
    fontWeight: '600',
  },
  entryRow: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  entryTextWrap: {
    flex: 1,
    gap: 2,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  entrySubtitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
