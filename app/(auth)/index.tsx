import { useAppDispatch } from '@/store/hooks';
import Feather from '@expo/vector-icons/Feather';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import AnimatedBackground from '@/components/AnimatedBackground';
import Logo from '@/components/Logo';
import MyMainButton from '@/components/MyMainButton';
import MyTextInput from '@/components/MyTextInput';
import { ThemedText } from '@/components/ThemedText';
import globalStyles from '@/constants/GlobalStyles';
import useAuth from '@/hooks/useAuth';
import { setAuthState } from '@/store/slices/authSlice';
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
    const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [demoEmail, setDemoEmail] = useState(
    Constants?.expoConfig?.extra?.DEMO_EMAIL || process.env.DEMO_EMAIL || 'contact@gengraphic.ro'
  );
  const [pendingEmail, setPendingEmail] = useState('');
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    if (data.email.trim().toLowerCase() === demoEmail.trim().toLowerCase()) {
      setPendingEmail(data.email);
      setShowPasswordModal(true);
      return;
    }
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

  // Demo password login handler (replace with your real password login logic)
  const handleDemoLogin = async () => {
    setShowPasswordModal(false);
    setLoading(true);
    try {
      if (password === 'Password11!') {
        Toast.show({ type: 'success', text1: 'Demo login successful!' });
        // Set auth state and navigate to main app
        dispatch(setAuthState(true));
        setTimeout(() => {
          router.replace('/');
        }, 500);
      } else {
        Toast.show({ type: 'error', text1: 'Invalid password' });
      }
    } finally {
      setLoading(false);
      setPassword('');
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

        {/* Demo Password Modal */}
        <Modal
          visible={showPasswordModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, width: 300 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Demo Account Login</Text>
              <Text style={{ marginBottom: 12 }}>Enter password for {pendingEmail}</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 16 }}
                autoFocus
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                  <Text style={{ color: '#888', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDemoLogin}>
                  <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Legal */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            {t('auth.legalPrefix')}{' '}
            <Text style={styles.legalLink} onPress={() => Linking.openURL('https://ago-log.com/privacy-policy')}>{t('auth.privacyPolicy')}</Text>
            {' '}{t('auth.legalAnd')}{' '}
            <Text style={styles.legalLink} onPress={() => Linking.openURL('https://ago-log.com/terms-of-service')}>{t('auth.legalTerms')}</Text>.
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
