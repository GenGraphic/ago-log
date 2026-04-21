import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
           text1: t('common.error'), 
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
          <ThemedText type="title" style={styles.welcomeTitle}>{t('auth.welcomeBack')}</ThemedText>
          <ThemedText type="default" style={styles.subtitle}>{t('auth.subtitle')}</ThemedText>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Email Input */}
          <MyTextInput
            name="email"
            control={control}
            label={t('auth.emailLabel')}
            placeholder={t('auth.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            rules={{
              required: t('auth.emailRequired'),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t('auth.emailInvalid'),
              },
            }}
          />
        </View>

        {/* Login Button */}
        <MyMainButton
          title={loading ? t('auth.signingIn') : t('auth.login')}
          isDisabled={loading}
          action={handleSubmit(onSubmit)}
        />

        {/* Legal */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            {t('auth.legalPrefix')}{' '}
            <Text style={styles.legalLink} onPress={() => Linking.openURL('https://ago-log.com/privacy')}>{t('auth.privacyPolicy')}</Text>
            {' '}{t('auth.legalAnd')}{' '}
            <Text style={styles.legalLink} onPress={() => Linking.openURL('https://ago-log.com/terms')}>{t('auth.legalTerms')}</Text>.
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
        <ThemedText style={styles.copyright}>{t('auth.copyright')}</ThemedText>
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
    paddingTop: 8,
  },
  welcomeTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    lineHeight: 52,
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
