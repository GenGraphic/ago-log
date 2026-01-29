import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Image, ImageSourcePropType, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';

interface Props {
    title: string;
    isDisabled: boolean;
    icon?: ImageSourcePropType;
    action: () => void
};

const MySecundaryButton: React.FC<Props> = ({ title, isDisabled, action, icon }) => {
    const textColor = useThemeColor({}, "text");

    return (
        <TouchableOpacity style={[styles.button]} onPress={action} disabled={isDisabled}>
            {icon &&
                <Image
                    source={icon}
                    style={{ width: 16, height: 16, objectFit: 'contain', tintColor: textColor}}
                />
            }
            <ThemedText style={styles.text}>{title}</ThemedText>
        </TouchableOpacity>
    )
}

export default MySecundaryButton

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
        height: 53,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#999999"
    },
    text: {
        paddingBottom: Platform.OS === "android" ? 5 : 0,
    },
})