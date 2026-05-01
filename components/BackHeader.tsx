import { useThemeColor } from '@/hooks/useThemeColor'
import Feather from '@expo/vector-icons/Feather'
import { useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { ThemedText } from './ThemedText'

type BackHeaderProps = {
    rightIcon?: React.ComponentProps<typeof Feather>["name"];
    onRightPress?: () => void;
    rightAccessibilityLabel?: string;
    rightDisabled?: boolean;
};

const BackHeader = ({ rightIcon, onRightPress, rightAccessibilityLabel, rightDisabled }: BackHeaderProps) => {
    const router = useRouter();
    const tint = useThemeColor({}, "tint");
    const icon = useThemeColor({}, "icon");
    const text = useThemeColor({}, "text");

    return (
        <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Feather name="arrow-left" size={20} color={icon} />
            </TouchableOpacity>
            <View style={styles.logoRow}>
                <ThemedText style={[styles.logoText, { color: text }]}>
                AGO_LOG
                </ThemedText>
                <View style={[styles.logoDot, { backgroundColor: tint }]} />
            </View>
            {rightIcon && onRightPress ? (
                <TouchableOpacity
                    style={styles.rightBtn}
                    onPress={onRightPress}
                    disabled={rightDisabled}
                    accessibilityLabel={rightAccessibilityLabel}
                >
                    <Feather name={rightIcon} size={19} color={icon} />
                </TouchableOpacity>
            ) : (
                <View style={{ width: 40 }} />
            )}
        </View>
    )
}

export default BackHeader

const styles = StyleSheet.create({
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    rightBtn: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    logoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    logoText: {
        fontSize: 13,
        fontWeight: "700",
        letterSpacing: 2,
    },
    logoDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
})