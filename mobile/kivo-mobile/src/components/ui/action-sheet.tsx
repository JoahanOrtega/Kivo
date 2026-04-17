import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ActionSheetProps {
    /** Controla si el sheet está visible */
    visible: boolean;
    /** Callback al cerrar — tocar el backdrop o cancelar */
    onClose: () => void;
    /** Callback al elegir egreso */
    onSelectExpense: () => void;
    /** Callback al elegir ingreso */
    onSelectIncome: () => void;
}

// ─── Subcomponente: botón de acción ──────────────────────────────────────────
// Cada opción del sheet tiene ícono, label y color propio.
function ActionButton({
    label,
    sublabel,
    iconName,
    color,
    backgroundColor,
    onPress,
}: {
    label: string;
    sublabel: string;
    iconName: "arrow-down-circle" | "arrow-up-circle";
    color: string;
    backgroundColor: string;
    onPress: () => void;
}) {
    const handlePress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    return (
        <TouchableOpacity
            onPress={() => void handlePress()}
            activeOpacity={0.85}
            style={{
                flex: 1,
                backgroundColor,
                borderRadius: 16,
                padding: spacing.lg,
                alignItems: "center",
                gap: spacing.sm,
            }}
        >
            {/* Ícono grande — comunicación visual inmediata */}
            <Ionicons name={iconName} size={32} color={color} />

            <Text
                style={{
                    fontSize: typography.bodyLg,
                    fontWeight: typography.weightBold,
                    color,
                }}
            >
                {label}
            </Text>

            <Text
                style={{
                    fontSize: typography.bodySm,
                    color,
                    opacity: 0.7,
                    textAlign: "center",
                }}
            >
                {sublabel}
            </Text>
        </TouchableOpacity>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
// Bottom sheet modal con dos opciones claras.
// Resuelve la Ley de Jakob — el usuario sabe exactamente qué
// va a crear antes de comprometerse con una acción.
export function ActionSheet({
    visible,
    onClose,
    onSelectExpense,
    onSelectIncome,
}: ActionSheetProps) {
    const insets = useSafeAreaInsets();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            {/* ── Backdrop — toque cierra el sheet ── */}
            <TouchableOpacity
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.4)",
                }}
                activeOpacity={1}
                onPress={onClose}
            />

            {/* ── Sheet ── */}
            <View
                style={{
                    backgroundColor: colors.surface,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    padding: spacing.lg,
                    paddingBottom: insets.bottom + spacing.lg,
                }}
            >
                {/* Indicador visual de sheet — patrón estándar iOS */}
                <View
                    style={{
                        width: 36,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: colors.border,
                        alignSelf: "center",
                        marginBottom: spacing.lg,
                    }}
                />

                {/* Título */}
                <Text
                    style={{
                        fontSize: typography.titleSection,
                        fontWeight: typography.weightBold,
                        color: colors.text,
                        marginBottom: spacing.lg,
                        textAlign: "center",
                    }}
                >
                    ¿Qué quieres registrar?
                </Text>

                {/* Botones lado a lado */}
                <View
                    style={{
                        flexDirection: "row",
                        gap: spacing.md,
                        marginBottom: spacing.md,
                    }}
                >
                    <ActionButton
                        label="Egreso"
                        sublabel="Dinero que salió"
                        iconName="arrow-down-circle"
                        color={colors.danger}
                        backgroundColor={colors.dangerSoft}
                        onPress={onSelectExpense}
                    />

                    <ActionButton
                        label="Ingreso"
                        sublabel="Dinero que entró"
                        iconName="arrow-up-circle"
                        color={colors.success}
                        backgroundColor={colors.successSoft}
                        onPress={onSelectIncome}
                    />
                </View>

                {/* Botón cancelar */}
                <TouchableOpacity
                    onPress={onClose}
                    activeOpacity={0.7}
                    style={{
                        paddingVertical: spacing.md,
                        alignItems: "center",
                    }}
                >
                    <Text
                        style={{
                            fontSize: typography.bodyMd,
                            color: colors.textMuted,
                            fontWeight: typography.weightSemibold,
                        }}
                    >
                        Cancelar
                    </Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}