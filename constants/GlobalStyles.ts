import { StyleSheet } from "react-native";

const globalStyles = StyleSheet.create({
    body: {
        flex: 1,
    },
    safeView: {
        flex: 1,
        paddingTop: 50
    },
    mainContainer: {
        flex: 1,
        paddingHorizontal: 10,
        paddingBottom: 30,
    },

    row_gap_10: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    row_gap_20: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20
    }
});

export default globalStyles;
