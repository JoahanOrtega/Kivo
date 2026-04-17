import { Redirect, Tabs } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";

import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme/colors";

// ─── Subcomponente: FAB central ───────────────────────────────────────────────
// El FAB (Floating Action Button) es el botón "+" en el centro del tab bar.
// Es la acción principal de la app — agregar un movimiento.
// Vive aquí porque es parte de la navegación, no de una pantalla específica.
function AddTransactionFAB() {
    const insets = useSafeAreaInsets();

    const handlePress = async () => {
        // Feedback háptico al presionar el FAB — resuelve problema #8
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/add-transaction");
    };

    return (
        // Posicionamos el FAB encima del tab bar con un margen negativo
        // que lo hace sobresalir visualmente del borde superior.
        <View
            style={{
                position: "absolute",
                bottom: insets.bottom + 10,
                alignSelf: "center",
            }}
        >
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.85}
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: colors.primary,
                    justifyContent: "center",
                    alignItems: "center",
                    // Sombra para dar sensación de elevación sobre el tab bar
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                }}
            >
                <Ionicons name="add" size={28} color={colors.white} />
            </TouchableOpacity>
        </View>
    );
}

// ─── Layout principal ─────────────────────────────────────────────────────────
export default function ProtectedLayout() {
    const { isAuthenticated, isHydrated } = useAuthStore();

    // Mientras la sesión no está hidratada no renderizamos nada —
    // evita un flash de la pantalla de login antes de saber si hay sesión.
    if (!isHydrated) {
        return null;
    }

    // Si no está autenticado redirigimos al login.
    if (!isAuthenticated) {
        return <Redirect href="/login" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                // Color del ícono cuando el tab está activo
                tabBarActiveTintColor: colors.primary,
                // Color del ícono cuando el tab está inactivo
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    // Altura extra para que el FAB tenga espacio
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "500",
                },
            }}
            // El FAB se renderiza como un componente flotante sobre el tab bar
            tabBar={(props) => (
                <>
                    {/* Tab bar nativo de Expo Router */}
                    <View style={{ position: "relative" }}>
                        {/* Renderizamos el tab bar default usando su componente interno */}
                        {props.state.routes.map((route, index) => {
                            const isFocused = props.state.index === index;
                            return null; // Expo maneja el render internamente
                        })}
                    </View>
                    <AddTransactionFAB />
                </>
            )}
        >
            {/* ── Tab: Inicio ── */}
            <Tabs.Screen
                name="home"
                options={{
                    title: "Inicio",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* ── Tab fantasma: espacio para el FAB ── */}
            {/* Este tab nunca se muestra — solo reserva el espacio central
                para que el FAB quede visualmente centrado en el tab bar */}
            <Tabs.Screen
                name="add-transaction"
                options={{
                    title: "",
                    tabBarButton: () => <View style={{ width: 56 }} />,
                }}
            />

            {/* ── Tab: Configuración ── */}
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Configuración",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" size={size} color={color} />
                    ),
                }}
            />

            {/* ── Pantallas que no aparecen en el tab bar ── */}
            {/* history y edit-transaction son pantallas secundarias —
                se navega a ellas pero no tienen tab propio */}
            <Tabs.Screen
                name="history"
                options={{
                    href: null, // null = no aparece en el tab bar
                }}
            />

            <Tabs.Screen
                name="sync-inspector"
                options={{
                    href: null,
                }}
            />

            <Tabs.Screen
                name="edit-transaction/[localId]"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}