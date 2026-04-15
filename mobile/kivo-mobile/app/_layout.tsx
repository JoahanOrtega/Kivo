import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ToastProvider } from "@/components/ui/toast-provider";
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
    const [bootError, setBootError] = useState<string | null>(null);

    useEffect(() => {
        const bootstrapApp = async () => {
            try {
                await initializeDatabase();
                await hydrateSession();
            } catch (error) {
                console.error("Bootstrap error:", error);
                setBootError("Ocurrió un error al iniciar la app.");
            } finally {
                setIsAppReady(true);
            }
        };

        void bootstrapApp();
    }, [hydrateSession]);

    return (
        <SafeAreaProvider>
            <ToastProvider>
                {!isAppReady ? (
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
                ) : bootError ? (
                    <View
                        style={{
                            flex: 1,
                            backgroundColor: colors.background,
                            justifyContent: "center",
                            alignItems: "center",
                            padding: 24,
                        }}
                    >
                        <Text style={{ color: colors.text, fontSize: 16, textAlign: "center" }}>
                            {bootError}
                        </Text>
                    </View>
                ) : (
                    <>
                        <StatusBar style="dark" />
                        <Stack screenOptions={{ headerShown: false }} />
                    </>
                )}
            </ToastProvider>
        </SafeAreaProvider>
    );
}