import { Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";

import { AppCard } from "@/components/ui/app-card";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

// ─── Tipos ────────────────────────────────────────────────────────────────────
// Definimos la forma mínima que necesita cada opción del selector.
// Usamos una interfaz genérica para que sirva tanto para categorías
// como para cuentas — ambas tienen id y name.
interface CatalogOption {
    id: string;
    name: string;
}

interface CatalogSelectorProps {
    /** Título de la sección — "Categoría" o "Cuenta" */
    title: string;
    /** Descripción opcional debajo del título */
    description?: string;
    /** Lista de opciones a mostrar */
    options: CatalogOption[];
    /** ID de la opción actualmente seleccionada */
    selectedId: string;
    /** Callback cuando el usuario selecciona una opción */
    onChange: (id: string) => void;
    /** Mensaje de error de validación — viene de react-hook-form */
    error?: string;
}

// ─── Componente ───────────────────────────────────────────────────────────────
// Selector genérico reutilizable para cualquier catálogo.
// Reemplaza el JSX duplicado de categoría y cuenta en add-transaction.tsx
// y edit-transaction.tsx — resuelve el problema #2 del análisis.
export function CatalogSelector({
    title,
    description,
    options,
    selectedId,
    onChange,
    error,
}: CatalogSelectorProps) {
    const handleSelect = async (id: string) => {
        // Solo disparamos háptico si la selección realmente cambia
        if (id === selectedId) return;

        await Haptics.selectionAsync();
        onChange(id);
    };

    return (
        <AppCard style={{ marginBottom: spacing.lg }}>
            {/* ── Título ── */}
            <Text
                style={{
                    fontSize: typography.titleSection,
                    fontWeight: typography.weightBold,
                    color: colors.text,
                    marginBottom: description ? spacing.xs : spacing.md,
                }}
            >
                {title}
            </Text>

            {/* ── Descripción opcional ── */}
            {description ? (
                <Text
                    style={{
                        fontSize: typography.bodySm,
                        color: colors.textMuted,
                        marginBottom: spacing.md,
                    }}
                >
                    {description}
                </Text>
            ) : null}

            {/* ── Lista de opciones ── */}
            <View style={{ gap: spacing.sm }}>
                {options.map((option) => {
                    const isSelected = selectedId === option.id;

                    return (
                        <TouchableOpacity
                            key={option.id}
                            onPress={() => void handleSelect(option.id)}
                            activeOpacity={0.85}
                            style={{
                                paddingVertical: 15,
                                paddingHorizontal: 14,
                                borderRadius: 16,
                                borderWidth: 1,
                                borderColor: isSelected ? colors.primary : colors.border,
                                backgroundColor: isSelected
                                    ? colors.primarySoft
                                    : colors.white,
                            }}
                        >
                            <Text
                                style={{
                                    color: isSelected ? colors.primary : colors.text,
                                    fontWeight: typography.weightSemibold,
                                    fontSize: typography.bodyLg,
                                }}
                            >
                                {option.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ── Error de validación ── */}
            {error ? (
                <Text
                    style={{
                        marginTop: spacing.sm,
                        fontSize: typography.bodySm,
                        color: colors.danger,
                    }}
                >
                    {error}
                </Text>
            ) : null}
        </AppCard>
    );
}