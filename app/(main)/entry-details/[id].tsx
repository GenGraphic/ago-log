import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function DocumentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Mock document data
  const document = {
    id,
    title: 'Car Insurance',
    type: 'Insurance',
    expiryDate: '2026-06-15',
    daysLeft: 75,
    status: 'safe',
    createdAt: '2025-01-15',
    notes: 'Premium: $500/year',
  };

  const handleEdit = () => {
    router.push(`/edit-entry/${id}`);
  };

  const handleDelete = () => {
    Alert.alert('Delete Document', 'Are you sure you want to delete this document?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => {
          router.back();
        },
        style: 'destructive',
      },
    ]);
  };

  const getStatusColor = (days: number) => {
    if (days <= 3) return '#FF3B30';
    if (days <= 7) return '#FFCC00';
    return '#34C759';
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title">Details</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Type Badge */}
        <View style={styles.badgeContainer}>
          <View style={styles.typeBadge}>
            <Feather name="file-text" size={16} color="#007AFF" />
            <ThemedText style={styles.typeBadgeText}>{document.type}</ThemedText>
          </View>
        </View>

        {/* Title */}
        <ThemedText type="title" style={styles.title}>
          {document.title}
        </ThemedText>

        {/* Status Card */}
        <View style={[styles.statusCard, { borderLeftColor: getStatusColor(document.daysLeft) }]}>
          <View style={styles.statusLeft}>
            <ThemedText style={styles.daysValue}>{document.daysLeft}</ThemedText>
            <ThemedText style={styles.daysLabel}>days left</ThemedText>
          </View>
          <View style={styles.statusRight}>
            <ThemedText style={styles.expiryLabel}>Expires on</ThemedText>
            <ThemedText type="defaultSemiBold">{document.expiryDate}</ThemedText>
          </View>
        </View>

        {/* Metadata Section */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Information
          </ThemedText>

          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Created</ThemedText>
            <ThemedText style={styles.infoValue}>{document.createdAt}</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Type</ThemedText>
            <ThemedText style={styles.infoValue}>{document.type}</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Status</ThemedText>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(document.daysLeft) },
              ]}>
              <ThemedText style={styles.statusBadgeText}>
                {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Notes Section */}
        {document.notes && (
          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Notes
            </ThemedText>
            <ThemedText style={styles.notes}>{document.notes}</ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleEdit}>
          <Feather name="edit-2" size={18} color="#007AFF" />
          <ThemedText style={styles.secondaryButtonText}>Edit</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dangerButton} onPress={handleDelete}>
          <Feather name="trash-2" size={18} color="#fff" />
          <ThemedText style={styles.dangerButtonText}>Delete</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  badgeContainer: {
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#E8F0FF',
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    marginBottom: 20,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderLeftWidth: 4,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 24,
  },
  statusLeft: {
    alignItems: 'flex-start',
  },
  daysValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  daysLabel: {
    fontSize: 12,
    color: '#999',
  },
  statusRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  expiryLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  notes: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  dangerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
  },
  dangerButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
