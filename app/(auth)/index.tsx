import Loading from '@/components/Loading';
import MyMainButton from '@/components/MyMainButton';
import MyTextInput from '@/components/MyTextInput';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import globalStyles from '@/constants/GlobalStyles';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Image, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

const Login = () => {
    const navi = useRouter();
    const { control, getValues, handleSubmit } = useForm({
        defaultValues: {
            email: "",
        }
    });
    const { sendOtp } = useAuth();
    const [loading, setLoading] = useState(false);


    const handleSignIn = async() => {
        try {
            setLoading(true);

            const { email } = getValues();

            const result = await sendOtp(email);
            if(!result.success) {
                Alert.alert("Error!", result.message);
                return;
            };

            navi.push({ pathname: "/(auth)/otp/[userId]", params: { userId: result.data, userEmail: email } });
        }finally {
            setLoading(false)
        }
    };

    return (
        <ThemedView style={globalStyles.body}>
            <SafeAreaView style={globalStyles.safeView}>
                {loading ? (
                    <Loading />
                ):(
                    <View style={[globalStyles.mainContainer, styles.mainContainer]}>
                        <ThemedText type='title'>Sign In</ThemedText>

                        <View style={styles.form}>
                            <MyTextInput
                                control={control}
                                name='email'
                                placeholder='ex: john_smith@gengraphic.ro'
                                label='Email'
                            />
                        </View>

                        <View style={styles.actionsCont}>
                            <MyMainButton
                                title='Sign in'
                                action={handleSubmit(handleSignIn)}
                                isDisabled={false}
                            />

                            <View style={{ alignItems: 'center', gap: 10 }}>
                                <ThemedText>Or sign in with: </ThemedText>
                                <View style={globalStyles.row_gap_20}>
                                    <TouchableOpacity>
                                        <Image
                                            source={require("@/assets/icons/google.png")}
                                            style={{ width: 30, height: 30 }}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity>
                                        <Image
                                            source={require("@/assets/icons/apple-logo.png")}
                                            style={{ width: 35, height: 35 }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </ThemedView>
    )
}

export default Login

const styles = StyleSheet.create({
    mainContainer: {
        justifyContent: 'space-between'
    },
    form: {
        gap: 20,
        flex: 1,
        justifyContent: 'center'
    },
    actionsCont: {
        flex: 1,
        justifyContent: 'space-between'
    },
})