import Loading from '@/components/Loading';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import globalStyles from '@/constants/GlobalStyles';
import useAuth from '@/hooks/useAuth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { OtpInput } from "react-native-otp-entry";

const Otp = () => {
    const navi = useRouter();
    const { userId, userEmail } = useLocalSearchParams();
    const [otp, setOtp] = useState("");
    const { validateOtp, sendOtp } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(otp.length === 6) {
            handleValidate();
        }
    }, [otp])

    const handleValidate = async() => {
        try {
            setLoading(true);

            const result = await validateOtp(userId as string, otp);
            if(!result.success) {
                Alert.alert("Error!", result.message);

                setOtp("");

                return;
            };

            navi.push("/(main)");
        }finally {
            setLoading(false);
        }
    };

    const resendOtp = async() => {
        try {
            setLoading(true);

            const result = await sendOtp(userEmail as string);
            if(!result.success) {
                Alert.alert("Error!", result.message);
                return;
            };

            Alert.alert("Email send!", "We have sent you the email one more time. Check Spam too.")
        }finally {
            setLoading(false)
        }
    };

    return (
        <ThemedView style={globalStyles.body}>
            <SafeAreaView style={globalStyles.safeView}>
                <View style={globalStyles.mainContainer}>
                    {loading ? (
                        <Loading />
                    ):(
                        <View style={styles.form}>
                            <OtpInput
                                numberOfDigits={6}
                                onTextChange={(text) => setOtp(text)}
                            />
                            <ThemedText>We have sent you an email with your one time password.</ThemedText>

                            <TouchableOpacity style={{ alignSelf: 'center' }} onPress={resendOtp}>
                                <ThemedText type='link'>Resend Code</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </ThemedView>
    )
}

export default Otp

const styles = StyleSheet.create({
    form: {
        flex: 1,
        justifyContent: 'center',
        gap: 20
    },
})