import { Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";

import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import { AppCard } from "@/components/ui/app-card";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type TransactionType = "income" | "expense";

interface TypeSelectorProps {
    value: TransactionType;
    onChange: (type: TransactionType) => void;
}

// ─── Configuración de opciones ────────────────────────────────────────────────
// Definimos las opciones como datos para evitar duplicar JSX.
// Cada opción tiene su label, valor, y colores para estado activo/inactivo.
const TYPE_OPTIONS: {
    label: string;
    value: TransactionType;
    activeColor: string;
    activeBg: string;
}[] = [
        {
            label: "Egreso",
            value: "expense",
            activeColor: colors.danger,
            activeBg: colors.dangerSoft,
        },
        {
            label: "Ingreso",
            value: "income",
            activeColor: colors.success,
            activeBg: colors.successSoft,
        },
    ];

// ─── Componente ───────────────────────────────────────────────────────────────
// Selector de tipo de movimiento — egreso o ingreso.
// Resuelve el problema #5 agregando háptico al cambiar el tipo.
export function TypeSelector({ value, onChange }: TypeSelectorProps) {
    const handleSelect = async (type: TransactionType) => {
        // Solo disparamos háptico si el tipo realmente cambia —
        // no tiene sentido vibrar si el usuario toca el que ya está activo.
        if (type === value) return;

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onChange(type);
    };

    return (
        <AppCard style={{ marginBottom: spacing.lg }}>
            <Text
                style={{
                    fontSize: typography.titleSection,
                    fontWeight: typography.weightBold,
                    color: colors.text,
                    marginBottom: spacing.md,
                }}
            >
                Tipo de movimiento
            </Text>

            <View style={{ flexDirection: "row", gap: spacing.md }}>
                {TYPE_OPTIONS.map((option) => {
                    const isSelected = value === option.value;

                    return (
                        <TouchableOpacity
                            key={option.value}
                            onPress={() => void handleSelect(option.value)}
                            activeOpacity={0.85}
                            style={{
                                flex: 1,
                                paddingVertical: 16,
                                borderRadius: 16,
                                borderWidth: 1,
                                // Borde y fondo cambian según si está seleccionado
                                borderColor: isSelected ? option.activeColor : colors.border,
                                backgroundColor: isSelected ? option.activeBg : colors.white,
                            }}
                        >
                            <Text
                                style={{
                                    textAlign: "center",
                                    color: isSelected ? option.activeColor : colors.text,
                                    fontWeight: typography.weightSemibold,
                                    fontSize: typography.bodyLg,
                                }}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </AppCard>
    );
}