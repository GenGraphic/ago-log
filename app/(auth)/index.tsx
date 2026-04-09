import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import MyMainButton from '@/components/MyMainButton';
import MyTextInput from '@/components/MyTextInput';
import { ThemedText } from '@/components/ThemedText';
import globalStyles from '@/constants/GlobalStyles';
import useAuth from '@/hooks/useAuth';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const { sendOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      setLoading(true);
      
      const result = await sendOtp(data.email);

      if (!result.success) {
        Toast.show({
           type: 'error', 
           text1: 'Error', 
           text2: result.message 
          });
        return;
      };

      router.push({
        pathname: "/otp/[userId]",
        params: {
          userId: String(result.data),
          userEmail: data.email
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground style={globalStyles.body}>
      <SafeAreaView style={globalStyles.safeView}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Logo />
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <ThemedText type="title" style={styles.welcomeTitle}>Welcome back</ThemedText>
          <ThemedText type="default" style={styles.subtitle}>Sign in to manage your vault</ThemedText>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Email Input */}
          <MyTextInput
            name="email"
            control={control}
            label="EMAIL ADDRESS"
            placeholder="name@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email',
              },
            }}
          />
        </View>

        {/* Login Button */}
        <MyMainButton
          title={loading ? 'SIGNING IN...' : 'LOGIN'}
          isDisabled={loading}
          action={handleSubmit(onSubmit)}
        />

        {/* Legal */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            By registering you agree to our{' '}
            <Text style={styles.legalLink} onPress={() => Linking.openURL('https://ago-log.com/privacy')}>Privacy Policy</Text>
            {' '}and{' '}
            <Text style={styles.legalLink} onPress={() => Linking.openURL('https://ago-log.com/terms')}>Legal Terms</Text>.
          </Text>
        </View>

        {/* Security Badges */}
        <View style={styles.badgesSection}>
          <View style={styles.badge}>
            <Feather name="lock" size={16} color="#999" />
            <ThemedText style={styles.badgeText}>AES-256</ThemedText>
          </View>
          <View style={styles.badge}>
            <Feather name="shield" size={16} color="#999" />
            <ThemedText style={styles.badgeText}>ISO 27001</ThemedText>
          </View>
          <View style={styles.badge}>
            <Feather name="check-circle" size={16} color="#999" />
            <ThemedText style={styles.badgeText}>2FA READY</ThemedText>
          </View>
        </View>

        {/* Copyright */}
        <ThemedText style={styles.copyright}>© 2024 AGO-LOG SENTIENT LEDGER. ALL RIGHTS RESERVED.</ThemedText>
      </ScrollView>
      </SafeAreaView>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  formSection: {
    marginBottom: 24,
    gap: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.7,
    marginBottom: 8,
  },
  passwordSection: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 40,
    padding: 8,
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  signupText: {
    fontSize: 14,
    opacity: 0.7,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  badgesSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '500',
  },
  copyright: {
    fontSize: 11,
    opacity: 0.5,
    textAlign: 'center',
  },
  legalSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  legalText: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: '#4F8EF7',
    fontWeight: '600',
  },
});
