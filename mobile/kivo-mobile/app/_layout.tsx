import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { initializeDatabase } from "@/database/migrations";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme/colors";

/**
 * Layout raíz de la aplicación.
 * Antes de renderizar rutas, inicializa:
 * - base local SQLite
 * - sesión persistida en Secure Store
 */
export default function RootLayout() {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const bootstrapApp = async () => {
      try {
        await initializeDatabase();
        await hydrateSession();
      } finally {
        setIsAppReady(true);
      }
    };

    void bootstrapApp();
  }, [hydrateSession]);

  if (!isAppReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}