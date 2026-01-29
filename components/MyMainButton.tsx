import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ImageSourcePropType, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface Props {
    title: string;
    isDisabled: boolean;
    icon?: ImageSourcePropType;
    action: () => void
};

const MyMainButton: React.FC<Props> = ({ title, isDisabled, action, icon }) => {
    const backgroundColor = useThemeColor({}, "tint");

    return (
        <TouchableOpacity style={[styles.button, { backgroundColor, borderColor: backgroundColor }]} onPress={action} disabled={isDisabled}>
            <Text style={styles.text}>{title}</Text>
        </TouchableOpacity>
    )
}

export default MyMainButton

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 53,
        borderRadius: 8,
        borderWidth: 1
    },
    text: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16
    },
})