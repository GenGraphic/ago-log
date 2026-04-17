import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { Control, Controller } from "react-hook-form";
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from "react-native";
import { ThemedText } from "./ThemedText";

interface Props extends TextInputProps {
  name: string;
  control: Control<any>;
  rules?: object;
  label?: string;
  errorMessage?: string;
}

const MyTextInput: React.FC<Props> = ({
  name,
  control,
  rules,
  label,
  errorMessage,
  ...textInputProps
}) => {
  const placeholderColor = "#999999";
  const inputBg = useThemeColor(
    { light: "#F5F5F5", dark: "#1C2333" },
    "background",
  );
  const inputColor = useThemeColor(
    { light: "#11181C", dark: "#FFFFFF" },
    "text",
  );

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText type="default" style={{ opacity: 0.7 }}>
          {label}
        </ThemedText>
      )}
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBg, color: inputColor },
                error && styles.errorInput,
              ]}
              placeholderTextColor={placeholderColor}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              {...textInputProps}
            />
            {error && (
              <Text style={styles.errorText}>
                {error.message || errorMessage}
              </Text>
            )}
          </>
        )}
      />
    </View>
  );
};

export default MyTextInput;

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorInput: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 4,
  },
});
