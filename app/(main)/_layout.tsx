import useAuthState from "@/store/useAuthState";
import { Redirect, Stack } from "expo-router";

const MainLayout = () => {
    const { isAuth } = useAuthState();

    if (!isAuth) return <Redirect href="/(main)" />;


    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
        </Stack>
    )
}

export default MainLayout;