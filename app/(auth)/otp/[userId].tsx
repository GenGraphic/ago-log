import AnimatedBackground from "@/components/AnimatedBackground";
import Loading from "@/components/Loading";
import { ThemedText } from "@/components/ThemedText";
import globalStyles from "@/constants/GlobalStyles";
import useAuth from "@/hooks/useAuth";
import { useThemeColor } from "@/hooks/useThemeColor";
import useUser from "@/hooks/useUser";
import { UserStatus } from "@/models/enums";
import { User_DB } from "@/models/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import Toast from "react-native-toast-message";

const Otp = () => {
  const navi = useRouter();
  const { userId, userEmail } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const { validateOtp, sendOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { getUser, createUser } = useUser();
  const otpCellBg = useThemeColor(
    { light: "#FFFFFF", dark: "#1C2333" },
    "background",
  );

  const handleValidate = useCallback(
    async (otpCode: string) => {
      if (!otpCode || otpCode.length !== 6 || !userId) {
        console.log(
          "Validation blocked - userId:",
          userId,
          "otpCode length:",
          otpCode.length,
        );
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await validateOtp(userId as string, otpCode);
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

        //check if user doc exists
        const userResult = await getUser(result.data);
        if (!userResult.success) {
          const newUser: User_DB = {
            email: userEmail as string,
            status: UserStatus.ACTIVE,
            avatar: "",
            name: "",
            phone: "",
          };

          const createUserResult = await createUser(newUser, userId as string);
          if (!createUserResult.success) {
            Toast.show({
              type: "error",
              text1: "Error!",
              text2: createUserResult.message,
            });
            return;
          }
        }

        navi.push("/(main)/(tabs)");
      } finally {
        setLoading(false);
      }
    },
    [userId, validateOtp, navi],
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

      const result = await sendOtp(userEmail as string);
      if (!result.success) {
        Toast.show({ type: "error", text1: "Error!", text2: result.message });
        return;
      }

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
              <ThemedText type="title" style={styles.title}>
                Enter OTP Code
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Check your email for the verification code
              </ThemedText>

              <OtpInput
                numberOfDigits={6}
                onTextChange={(text) => setOtp(text)}
                theme={{
                  containerStyle: styles.otpContainer,
                  pinCodeContainerStyle: [
                    styles.otpCell,
                    { backgroundColor: otpCellBg },
                  ],
                  pinCodeTextStyle: styles.otpText,
                  focusStickStyle: styles.otpCursor,
                  focusedPinCodeContainerStyle: styles.otpCellFocused,
                }}
              />

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
  title: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24,
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
  otpContainer: {
    marginVertical: 8,
  },
  otpCell: {
    borderWidth: 1.5,
    borderColor: "#2A3550",
    borderRadius: 12,
  },
  otpCellFocused: {
    borderColor: "#00F0FF",
  },
  otpText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  otpCursor: {
    backgroundColor: "#00F0FF",
  },
});
