import React from "react";
import { StyleSheet } from "react-native";
import { OtpInput } from "react-native-otp-entry";

import { useThemeColor } from "@/hooks/useThemeColor";

type AuthOtpInputProps = {
  onTextChange: (text: string) => void;
  autoFocus?: boolean;
  inputKey?: string;
};

const AuthOtpInput = ({
  onTextChange,
  autoFocus = false,
  inputKey,
}: AuthOtpInputProps) => {
  const otpCellBg = useThemeColor(
    { light: "#FFFFFF", dark: "#1C2333" },
    "background",
  );
  const otpTextColor = useThemeColor(
    { light: "#11181C", dark: "#FFFFFF" },
    "text",
  );

  return (
    <OtpInput
      key={inputKey}
      numberOfDigits={6}
      autoFocus={autoFocus}
      onTextChange={onTextChange}
      theme={{
        containerStyle: styles.otpContainer,
        pinCodeContainerStyle: {
          ...styles.otpCell,
          backgroundColor: otpCellBg,
        },
        pinCodeTextStyle: {
          ...styles.otpText,
          color: otpTextColor,
        },
        focusStickStyle: styles.otpCursor,
        focusedPinCodeContainerStyle: styles.otpCellFocused,
      }}
    />
  );
};

export default AuthOtpInput;

const styles = StyleSheet.create({
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
    fontSize: 22,
    fontWeight: "bold",
  },
  otpCursor: {
    backgroundColor: "#00F0FF",
  },
});
