import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/store/auth-store";

/**
 * Grupo privado.
 * Si no existe sesión válida, el usuario debe volver al login.
 */
export default function ProtectedLayout() {
    const { isAuthenticated, isHydrated } = useAuthStore();

    if (!isHydrated) {
        return <Stack screenOptions={{ headerShown: false }} />;
    }

    if (!isAuthenticated) {
        return <Redirect href="/login" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}