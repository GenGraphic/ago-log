import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';

const Loading = () => {
    const tintColor = useThemeColor({}, "tint");

    return (
        <ThemedView style={styles.body}>
            <ActivityIndicator
                size={'large'}
                color={tintColor}
            />
        </ThemedView>
    )
}

export default Loading

const styles = StyleSheet.create({
    body: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})