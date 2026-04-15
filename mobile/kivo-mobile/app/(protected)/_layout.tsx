import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/store/auth-store";

/**
 * Grupo privado.
 * Si no existe sesión válida, se redirige al usuario al flujo de autenticación.
 */
export default function ProtectedLayout() {
  const { isAuthenticated, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}