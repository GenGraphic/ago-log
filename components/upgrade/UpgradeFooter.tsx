import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function UpgradeFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.links}>
        <TouchableOpacity onPress={() => Linking.openURL('https://ago-log.com/privacy-policy')}>
          <Text style={styles.link}>Privacy Policy</Text>
        </TouchableOpacity>
        <Text style={styles.dot}>·</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://ago-log.com/terms-of-service')}>
          <Text style={styles.link}>Terms of Service</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.copy}>© 2026 Agolog. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  link: {
    fontSize: 11,
    color: '#333',
    textDecorationLine: 'underline',
  },
  dot: {
    color: '#333',
    fontSize: 11,
  },
  copy: {
    fontSize: 10,
    color: '#2A2A2A',
    letterSpacing: 0.3,
  },
});
