import { query } from "@/appwrite";
import EntryComponent from "@/components/EntryComponent";
import { ThemedText } from "@/components/ThemedText";
import { StatusColors } from "@/constants/Colors";
import useEntries from "@/hooks/useEntries";
import { useThemeColor } from "@/hooks/useThemeColor";
import { EntryStatus } from "@/models/enums";
import { Entry } from "@/models/types";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

const ALERT_DAYS = 7;

const CriticalAlerts = () => {
    const [entries, setEntries] = useState<Entry[]>([]);
    const { queryEntries } = useEntries();
    const [loading, setLoading] = useState(false);
    const icon = useThemeColor({}, "icon");

    const getEntries = useCallback(async () => {
        try {
            setLoading(true);

            const soonDate = new Date();
            soonDate.setDate(soonDate.getDate() + ALERT_DAYS);

            const expiredResult = await queryEntries([
                query.equal("status", EntryStatus.EXPIRED),
                query.orderDesc("expiryDate"),
                query.limit(10),
            ]);

            const soonResult = await queryEntries([
                query.equal("status", EntryStatus.ACTIVE),
                query.lessThanEqual("expiryDate", soonDate.toISOString()),
                query.orderAsc("expiryDate"),
                query.limit(10),
            ]);

            const combined: Entry[] = [];
            if (expiredResult.success) combined.push(...expiredResult.data);
            if (soonResult.success) combined.push(...soonResult.data);

            const seen = new Set<string>();
            const unique = combined.filter((e) => {
                if (seen.has(e.id)) return false;
                seen.add(e.id);
                return true;
            });

            unique.sort((a, b) => {
                if (!a.expiryDate) return 1;
                if (!b.expiryDate) return -1;
                return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
            });

            setEntries(unique);
        } finally {
            setLoading(false);
        }
    }, [queryEntries]);

    useEffect(() => {
        getEntries();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.title}>Critical Alerts</ThemedText>
                <ThemedText style={[styles.action, { color: StatusColors.expired }]}>
                    IMMEDIATE ACTION
                </ThemedText>
            </View>

            {loading ? (
                <ActivityIndicator color={StatusColors.active} style={{ marginTop: 16 }} />
            ) : entries.length === 0 ? (
                <ThemedText style={[styles.empty, { color: icon }]}>
                    No critical entries right now.
                </ThemedText>
            ) : (
                <FlatList
                    data={entries}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <EntryComponent item={item} />}
                    scrollEnabled={false}
                />
            )}
        </View>
    );
};

export default CriticalAlerts;

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
    },
    action: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1.5,
    },
    empty: {
        fontSize: 13,
        opacity: 0.6,
        textAlign: "center",
        marginTop: 16,
    },
});
