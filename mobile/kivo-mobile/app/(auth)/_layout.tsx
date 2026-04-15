import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/store/auth-store";

/**
 * Grupo público.
 * Si ya existe sesión válida, el usuario debe ir al home privado.
 */
export default function AuthLayout() {
    const { isAuthenticated, isHydrated } = useAuthStore();

    if (!isHydrated) {
        return <Stack screenOptions={{ headerShown: false }} />;
    }

    if (isAuthenticated) {
        return <Redirect href="/home" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}