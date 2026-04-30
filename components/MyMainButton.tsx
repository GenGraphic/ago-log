import { useThemeColor } from '@/hooks/useThemeColor';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageSourcePropType, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface Props {
    title: string;
    isDisabled: boolean;
    icon?: ImageSourcePropType;
    action: () => void;
    customColor?: string;
};

const MyMainButton: React.FC<Props> = ({ title, isDisabled, action, icon, customColor }) => {
    const backgroundColor = useThemeColor({}, "tint");
    const backgroundColorLight = useThemeColor({}, "tintLight");
    return (
        <TouchableOpacity
            onPress={action}
            disabled={isDisabled}
            activeOpacity={0.85}
            style={{ flex: 1, width: '100%' }}
        >
                <LinearGradient
                    end={{ x: 0, y: 0 }}
                    start={{ x: 1, y: 0 }}
                    colors={[customColor ?? backgroundColor, backgroundColorLight]}
                    style={[styles.button, { opacity: isDisabled ? 0.5 : 1 }]}
                >
                    <Text style={styles.text}>{title}</Text>
                </LinearGradient>
        </TouchableOpacity>
    )
}

export default MyMainButton

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
        borderRadius: 8,
    },
    text: {
        color: "#00363A",
        fontWeight: "bold",
        fontSize: 16,
        letterSpacing: 2,
    },
})