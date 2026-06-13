import AnimatedBackground from "@/components/AnimatedBackground";
import AuthOtpInput from "@/components/auth/AuthOtpInput";
import AuthTitleBlock from "@/components/auth/AuthTitleBlock";
import Loading from "@/components/Loading";
import { ThemedText } from "@/components/ThemedText";
import globalStyles from "@/constants/GlobalStyles";
import useAuth from "@/hooks/useAuth";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const Otp = () => {
  const navi = useRouter();
  const { userId, userEmail } = useLocalSearchParams();

  const getParamValue = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return String(value[0] ?? "");
    return String(value ?? "");
  };

  const [activeUserId, setActiveUserId] = useState<string>(
    getParamValue(userId),
  );
  const [otp, setOtp] = useState("");
  const { validateOtp, sendOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setActiveUserId(getParamValue(userId));
  }, [userId]);

  const handleValidate = useCallback(
    async (otpCode: string) => {
      if (!otpCode || otpCode.length !== 6 || !activeUserId) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await validateOtp(activeUserId, otpCode);
        if (!result.success) {
          setError(result.message);
          Toast.show({
            type: "error",
            text1: "Invalid OTP",
            text2: result.message,
          });
          setOtp("");
          return;
        }
      } finally {
        setLoading(false);
      }
    },
    [activeUserId, validateOtp, navi],
  );

  useEffect(() => {
    if (otp.length === 6) {
      handleValidate(otp);
    }
  }, [otp, handleValidate]);

  const resendOtp = async () => {
    try {
      setLoading(true);
      setError("");

      const email = getParamValue(userEmail);
      if (!email) {
        Toast.show({ type: "error", text1: "Error!", text2: "Email is missing." });
        return;
      }

      const result = await sendOtp(email);
      if (!result.success) {
        Toast.show({ type: "error", text1: "Error!", text2: result.message });
        return;
      }

      setActiveUserId(String(result.data));

      Toast.show({
        type: "success",
        text1: "Email sent!",
        text2: "We have sent you the email one more time. Check Spam too.",
      });
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground style={globalStyles.body}>
      <SafeAreaView style={globalStyles.safeView}>
        <View style={globalStyles.mainContainer}>
          {loading ? (
            <Loading />
          ) : (
            <View style={styles.form}>
              <AuthTitleBlock
                title="Enter OTP Code"
                subtitle="Check your email for the verification code"
              />

              <AuthOtpInput autoFocus onTextChange={setOtp} />

              {error && (
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              )}

              <ThemedText style={styles.helpText}>
                We have sent you an email with your one time password.
              </ThemedText>

              <TouchableOpacity
                style={{ alignSelf: "center" }}
                onPress={resendOtp}
                disabled={loading}
              >
                <ThemedText type="link">Resend Code</ThemedText>
              </TouchableOpacity>

              <ThemedText style={styles.debugText}>
                Code sent to: {userEmail}
              </ThemedText>
            </View>
          )}
        </View>
      </SafeAreaView>
    </AnimatedBackground>
  );
};

export default Otp;

const styles = StyleSheet.create({
  form: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
  },
  helpText: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    fontSize: 14,
    marginTop: 8,
  },
  debugText: {
    textAlign: "center",
    fontSize: 12,
    opacity: 0.5,
    marginTop: 16,
  },
});
