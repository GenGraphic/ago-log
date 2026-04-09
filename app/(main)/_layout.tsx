import useUser from "@/hooks/useUser";
import { useAppSelector } from "@/store/hooks";
import { Redirect, Stack } from "expo-router";
import { useEffect } from "react";

const MainLayout = () => {
    const { isAuth } = useAppSelector((state) => state.auth);
    const { getUser } = useUser();

    useEffect(() => {
        if(isAuth){
            getUser();
        }
    }, [isAuth])

    if (!isAuth) return <Redirect href="/(auth)" />;


    return (
        <Stack initialRouteName="(tabs)">
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="entry-details" options={{ headerShown: false }} />
            <Stack.Screen name="edit-entry" options={{ headerShown: false }} />
            <Stack.Screen name="add-entry" options={{ headerShown: false }} />
        </Stack>
    )
}

export default MainLayout;