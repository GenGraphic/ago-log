import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function EditDocumentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [title, setTitle] = useState('Car Insurance');
  const [type, setType] = useState('Insurance');
  const [expiryDate, setExpiryDate] = useState('2026-06-15');
  const [notes, setNotes] = useState('Premium: $500/year');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const types = ['Insurance', 'Document', 'Legal', 'Medical', 'Property', 'Other'];

  const handleSave = () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter a title' });
      return;
    }
    Toast.show({ type: 'success', text1: 'Success', text2: 'Document updated successfully' });
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title">Edit Document</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Field */}
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Title</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Document title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#999"
          />
        </View>

        {/* Type Field */}
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Type</ThemedText>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowTypeDropdown(!showTypeDropdown)}>
            <ThemedText>{type}</ThemedText>
            <Feather name={showTypeDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="#999" />
          </TouchableOpacity>

          {showTypeDropdown && (
            <View style={styles.dropdown}>
              {types.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.dropdownItem, type === t && styles.dropdownItemSelected]}
                  onPress={() => {
                    setType(t);
                    setShowTypeDropdown(false);
                  }}>
                  <ThemedText style={[styles.dropdownItemText, type === t && { color: '#007AFF' }]}>
                    {t}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Expiry Date Field */}
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Expiry Date</ThemedText>
          <TouchableOpacity style={styles.dateInput}>
            <Feather name="calendar" size={20} color="#007AFF" />
            <ThemedText style={styles.dateInputText}>{expiryDate}</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Notes Field */}
        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>Notes (Optional)</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any additional notes"
            value={notes}
            onChangeText={setNotes}
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Notification Preferences */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notify me before</ThemedText>
          <View style={styles.checkboxGroup}>
            {[30, 7, 1].map((days) => (
              <TouchableOpacity key={days} style={styles.checkbox}>
                <View style={styles.checkboxBox}>
                  <Feather name="check" size={16} color="#fff" />
                </View>
                <ThemedText style={styles.checkboxLabel}>{days} day{days > 1 ? 's' : ''} before</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    color: '#000',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdown: {
    marginTop: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemSelected: {
    backgroundColor: '#E8F0FF',
  },
  dropdownItemText: {
    fontSize: 14,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateInputText: {
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  checkboxGroup: {
    gap: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
