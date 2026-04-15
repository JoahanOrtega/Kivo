import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/store/auth-store";

/**
 * Grupo público.
 * Si el usuario ya está autenticado, no debe volver a login/register.
 */
export default function AuthLayout() {
  const { isAuthenticated, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(protected)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}