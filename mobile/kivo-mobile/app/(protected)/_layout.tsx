import { Redirect, Tabs } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import { useAuthStore } from "@/store/auth-store";
import { ActionSheet } from "@/components/ui/action-sheet";
import { colors } from "@/theme/colors";

// ─── FAB como tab central ─────────────────────────────────────────────────────
// onPress recibe la función para abrir el sheet — no navega directamente.
function FABTabButton({ onPress }: { onPress: () => void }) {
    const handlePress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    return (
        <TouchableOpacity
            onPress={() => void handlePress()}
            activeOpacity={0.85}
            style={{
                width: 80,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <View
                style={{
                    top: -12,
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    backgroundColor: colors.primary,
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 8,
                }}
            >
                <Ionicons name="add" size={26} color={colors.white} />
            </View>
        </TouchableOpacity>
    );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function ProtectedLayout() {
    const { isAuthenticated, isHydrated } = useAuthStore();

    // ─── Estado del ActionSheet ───────────────────────────────────────────────
    // Controla si el sheet de selección de tipo está visible.
    const [sheetVisible, setSheetVisible] = useState(false);

    if (!isHydrated) return null;
    if (!isAuthenticated) return <Redirect href="/login" />;

    // ─── Handlers del ActionSheet ─────────────────────────────────────────────
    const handleSelectExpense = () => {
        setSheetVisible(false);
        // Pasamos el tipo como query param para que add-transaction
        // abra directamente en modo egreso sin que el usuario tenga
        // que seleccionarlo de nuevo — resuelve la Ley de Jakob.
        router.push("/add-transaction?type=expense");
    };

    const handleSelectIncome = () => {
        setSheetVisible(false);
        router.push("/add-transaction?type=income");
    };

    return (
        <>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: colors.primary,
                    tabBarInactiveTintColor: colors.textMuted,
                    tabBarStyle: {
                        backgroundColor: colors.surface,
                        borderTopColor: colors.border,
                        borderTopWidth: 1,
                        height: 65,
                        paddingBottom: 10,
                        paddingTop: 8,
                    },
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: "500",
                    },
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: "Inicio",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="home-outline" size={size} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="history"
                    options={{
                        title: "Historial",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="time-outline" size={size} color={color} />
                        ),
                    }}
                />

                {/* ── Tab central: FAB ──────────────────────────────────────────
                    Abre el ActionSheet en lugar de navegar directamente.
                    El usuario elige el tipo y luego se navega. */}
                <Tabs.Screen
                    name="add"
                    options={{
                        title: "",
                        tabBarButton: () => (
                            <FABTabButton onPress={() => setSheetVisible(true)} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="settings"
                    options={{
                        title: "Ajustes",
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons name="settings-outline" size={size} color={color} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="edit-transaction/[localId]"
                    options={{ href: null }}
                />
            </Tabs>

            {/* ── ActionSheet ───────────────────────────────────────────────────
                Vive fuera del Tabs para que aparezca sobre toda la UI
                incluyendo el tab bar. */}
            <ActionSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                onSelectExpense={handleSelectExpense}
                onSelectIncome={handleSelectIncome}
            />
        </>
    );
}