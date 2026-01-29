import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { ThemedText } from './ThemedText';

interface Props extends TextInputProps {
    name: string;
    control: Control<any>;
    rules?: object;
    label?: string;
    errorMessage?: string;
}

const MyTextInput: React.FC<Props> = ({ name, control, rules, label, errorMessage, ...textInputProps }) => {
    const textColor = useThemeColor({}, "text");

    return (
        <View style={styles.container}>
            {label && <ThemedText type='default' style={{ opacity: 0.7 }}>{label}</ThemedText>}
            <Controller
                control={control}
                name={name}
                rules={rules}
                render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <>
                        <TextInput
                            style={[styles.input, error && styles.errorInput, {color: textColor}]}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            {...textInputProps}
                        />
                        {error && <Text style={styles.errorText}>{error.message || errorMessage}</Text>}
                    </>
                )}
            />
        </View>
    )
}

export default MyTextInput

const styles = StyleSheet.create({
    container: {
        gap: 10
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
        color: '#333',
    },
    input: {
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#EDEDED",
        height: 48,
        paddingHorizontal: 20,
        backgroundColor: "#FFFFFF"
    },
    errorInput: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
    },
})