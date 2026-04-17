import { router } from "expo-router";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { BRAND } from "@/constants/brand";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

// ─── Tipos ────────────────────────────────────────────────────────────────────
// Definimos la forma de cada opción de configuración.
// Igual que en QuickActions, usamos datos en lugar de JSX repetido.
interface SettingsOption {
    /** Texto visible del botón */
    label: string;
    /** Descripción corta de lo que hace */
    description: string;
    /** Si es true, se muestra en rojo — indica acción destructiva */
    isDestructive?: boolean;
    /** Función que se ejecuta al presionar */
    onPress: () => void;
}

// ─── Subcomponente: fila de opción ────────────────────────────────────────────
// Renderiza una sola opción con su label, descripción y estilo.
function SettingsRow({ option }: { option: SettingsOption }) {
    const handlePress = async () => {
        // Háptico ligero al tocar cualquier opción de configuración
        await Haptics.selectionAsync();
        option.onPress();
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            style={{
                paddingVertical: spacing.lg,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
            }}
        >
            <Text
                style={{
                    fontSize: typography.bodyLg,
                    fontWeight: typography.weightSemibold,
                    // Rojo para acciones destructivas, texto normal para el resto
                    color: option.isDestructive ? colors.danger : colors.text,
                    marginBottom: spacing.xs,
                }}
            >
                {option.label}
            </Text>

            <Text
                style={{
                    fontSize: typography.bodySm,
                    color: colors.textMuted,
                    lineHeight: 18,
                }}
            >
                {option.description}
            </Text>
        </TouchableOpacity>
    );
}

// ─── Subcomponente: sección ───────────────────────────────────────────────────
// Agrupa opciones relacionadas bajo un título de sección.
// Permite organizar visualmente las opciones a medida que la app crece.
function SettingsSection({
    title,
    options,
}: {
    title: string;
    options: SettingsOption[];
}) {
    return (
        <View style={{ marginBottom: spacing["2xl"] }}>
            {/* Título de sección en mayúsculas pequeñas — convención de iOS/Android */}
            <Text
                style={{
                    fontSize: typography.bodySm,
                    fontWeight: typography.weightSemibold,
                    color: colors.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    marginBottom: spacing.sm,
                }}
            >
                {title}
            </Text>

            {/* Fondo blanco con borde alrededor del grupo de opciones */}
            <View
                style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingHorizontal: spacing.lg,
                    // Quitamos el borde inferior del último item para evitar
                    // que se superponga con el borde del contenedor
                    overflow: "hidden",
                }}
            >
                {options.map((option) => (
                    <SettingsRow key={option.label} option={option} />
                ))}
            </View>
        </View>
    );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function SettingsScreen() {
    const logout = useAuthStore((state) => state.logout);

    // ─── Acción: cerrar sesión ────────────────────────────────────────────────
    // Mostramos un Alert de confirmación antes de cerrar sesión —
    // es una acción que el usuario no debería hacer por accidente.
    const handleLogout = () => {
        Alert.alert(
            "Cerrar sesión",
            "¿Estás seguro que deseas cerrar sesión?",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Cerrar sesión",
                    style: "destructive",
                    onPress: async () => {
                        await Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Warning
                        );
                        await logout();
                        router.replace("/login");
                    },
                },
            ]
        );
    };

    // ─── Opciones de configuración ────────────────────────────────────────────
    // Organizadas en secciones. A medida que la app crece, se agregan
    // opciones aquí sin tocar el JSX del render.
    const accountOptions: SettingsOption[] = [
        {
            label: "Cerrar sesión",
            description: "Salir de tu cuenta en este dispositivo",
            isDestructive: true,
            onPress: handleLogout,
        },
    ];

    const aboutOptions: SettingsOption[] = [
        {
            label: BRAND.appName,
            description: `${BRAND.tagline} — Versión 1.0.0`,
            onPress: () => { },
        },
    ];

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: colors.background,
            }}
        >
            <View
                style={{
                    flex: 1,
                    padding: spacing.lg,
                }}
            >
                {/* ── Header ── */}
                <View style={{ marginBottom: spacing["2xl"] }}>
                    <Text
                        style={{
                            fontSize: typography.titlePage,
                            fontWeight: typography.weightBold,
                            color: colors.text,
                            marginBottom: spacing.xs,
                        }}
                    >
                        Configuración
                    </Text>

                    <Text
                        style={{
                            fontSize: typography.bodyMd,
                            color: colors.textMuted,
                        }}
                    >
                        Ajustes y preferencias de {BRAND.appName}
                    </Text>
                </View>

                {/* ── Sección: cuenta ── */}
                <SettingsSection
                    title="Cuenta"
                    options={accountOptions}
                />

                {/* ── Sección: acerca de ── */}
                <SettingsSection
                    title="Acerca de"
                    options={aboutOptions}
                />
            </View>
        </SafeAreaView>
    );
}