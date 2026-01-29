import useAuthState from "@/store/useAuthState";
import { Redirect, Stack } from "expo-router";

const AuthLayout = () => {
    const { isAuth } = useAuthState();

    if (isAuth) return <Redirect href="/(main)" />;

    return(
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="otp/[userId]" />
        </Stack>
    )
};

export default AuthLayout;