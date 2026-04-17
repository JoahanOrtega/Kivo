import { Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";

import { AppCard } from "@/components/ui/app-card";
import { AppInput } from "@/components/ui/app-input";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import type { Account, Category } from "@/types/catalogs";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type FilterType = "all" | "income" | "expense";

interface HistoryFiltersProps {
    searchText: string;
    typeFilter: FilterType;
    categoryFilter: string;
    accountFilter: string;
    categories: Category[];
    accounts: Account[];
    onSearchChange: (text: string) => void;
    onTypeChange: (type: FilterType) => void;
    onCategoryChange: (id: string) => void;
    onAccountChange: (id: string) => void;
    onClearFilters: () => void;
}

// ─── Helpers de estilo ────────────────────────────────────────────────────────
// Definimos las funciones de estilo FUERA del componente para que no se
// recreen en cada render. Al estar fuera, JavaScript las crea una sola
// vez cuando el módulo se carga — no en cada ciclo de renderizado.
function getChipStyle(isSelected: boolean) {
    return {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: isSelected ? colors.primary : colors.border,
        backgroundColor: isSelected ? colors.primarySoft : colors.white,
    };
}

function getChipTextStyle(isSelected: boolean) {
    return {
        color: isSelected ? colors.primary : colors.text,
        fontWeight: typography.weightSemibold as "500",
        fontSize: typography.bodySm,
    };
}

// ─── Subcomponente: grupo de chips ────────────────────────────────────────────
// Renderiza un grupo de chips de filtro bajo un título.
// Reutilizable para tipo, categoría y cuenta.
function FilterChipGroup<T extends string>({
    title,
    options,
    selectedValue,
    onSelect,
}: {
    title: string;
    options: { label: string; value: T }[];
    selectedValue: T;
    onSelect: (value: T) => void;
}) {
    const handleSelect = async (value: T) => {
        // Háptico ligero al cambiar un filtro — resuelve problema #5
        await Haptics.selectionAsync();
        onSelect(value);
    };

    return (
        <View style={{ marginBottom: spacing.lg }}>
            <Text
                style={{
                    fontSize: typography.bodySm,
                    color: colors.textMuted,
                    marginBottom: spacing.sm,
                }}
            >
                {title}
            </Text>

            <View
                style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: spacing.sm,
                }}
            >
                {options.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => void handleSelect(option.value)}
                        style={getChipStyle(selectedValue === option.value)}
                    >
                        <Text style={getChipTextStyle(selectedValue === option.value)}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function HistoryFilters({
    searchText,
    typeFilter,
    categoryFilter,
    accountFilter,
    categories,
    accounts,
    onSearchChange,
    onTypeChange,
    onCategoryChange,
    onAccountChange,
    onClearFilters,
}: HistoryFiltersProps) {
    // Construimos las opciones de tipo como datos — no JSX repetido
    const typeOptions: { label: string; value: FilterType }[] = [
        { label: "Todos", value: "all" },
        { label: "Ingresos", value: "income" },
        { label: "Egresos", value: "expense" },
    ];

    // Construimos las opciones de categoría agregando "Todas" al inicio
    const categoryOptions = [
        { label: "Todas", value: "" },
        ...categories.map((c) => ({ label: c.name, value: c.id })),
    ];

    // Construimos las opciones de cuenta agregando "Todas" al inicio
    const accountOptions = [
        { label: "Todas", value: "" },
        ...accounts.map((a) => ({ label: a.name, value: a.id })),
    ];

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
                Filtros
            </Text>

            {/* ── Búsqueda de texto ── */}
            <AppInput
                label="Buscar"
                value={searchText}
                onChangeText={onSearchChange}
                placeholder="Ej. DiDi, Apple bill, BBVA"
                autoCapitalize="none"
                autoCorrect={false}
            />

            {/* Botón limpiar búsqueda — solo visible cuando hay texto */}
            {searchText.trim().length > 0 && (
                <TouchableOpacity
                    onPress={() => onSearchChange("")}
                    activeOpacity={0.85}
                    style={{
                        alignSelf: "flex-start",
                        marginTop: -4,
                        marginBottom: spacing.md,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: colors.surfaceMuted,
                        borderWidth: 1,
                        borderColor: colors.border,
                    }}
                >
                    <Text
                        style={{
                            color: colors.textMuted,
                            fontSize: typography.bodySm,
                            fontWeight: typography.weightSemibold,
                        }}
                    >
                        Limpiar búsqueda
                    </Text>
                </TouchableOpacity>
            )}

            {/* ── Chips de tipo ── */}
            <FilterChipGroup
                title="Tipo"
                options={typeOptions}
                selectedValue={typeFilter}
                onSelect={onTypeChange}
            />

            {/* ── Chips de categoría ── */}
            <FilterChipGroup
                title="Categoría"
                options={categoryOptions}
                selectedValue={categoryFilter}
                onSelect={onCategoryChange}
            />

            {/* ── Chips de cuenta ── */}
            <FilterChipGroup
                title="Cuenta"
                options={accountOptions}
                selectedValue={accountFilter}
                onSelect={onAccountChange}
            />

            {/* ── Botón limpiar todos los filtros ── */}
            <TouchableOpacity
                onPress={onClearFilters}
                activeOpacity={0.85}
                style={{
                    alignSelf: "flex-start",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: colors.surfaceMuted,
                    borderWidth: 1,
                    borderColor: colors.border,
                }}
            >
                <Text
                    style={{
                        color: colors.textMuted,
                        fontSize: typography.bodySm,
                        fontWeight: typography.weightSemibold,
                    }}
                >
                    Limpiar filtros
                </Text>
            </TouchableOpacity>
        </AppCard>
    );
}