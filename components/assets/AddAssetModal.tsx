import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AddAssetModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddAssetModal({ visible, onClose }: AddAssetModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add New Asset</Text>
          {/* Add asset form fields here */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#23263A',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  title: {
    color: '#00F0FF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 24,
    backgroundColor: '#00F0FF',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  closeButtonText: {
    color: '#151718',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
