import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";

import { AppCard } from "@/components/ui/app-card";
import { SyncStatusBadge } from "@/components/ui/sync-status-badge";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface TransactionItemData {
    localId: string;
    type: "income" | "expense";
    amount: number;
    concept: string | null;
    transactionDate: string;
    categoryName: string;
    accountName: string;
    syncStatus: string;
}

interface TransactionItemProps {
    item: TransactionItemData;
}

// ─── Helper: formatear fecha ──────────────────────────────────────────────────
// Resuelve el problema #2 del análisis de history.tsx.
//
// El problema original:
//   new Date("2026-01-15").toLocaleString()
//   → JavaScript interpreta "2026-01-15" como UTC medianoche
//   → En México (UTC-6) se muestra como "14/01/2026 18:00" — un día antes
//
// La solución:
//   Parseamos manualmente los componentes de la fecha para evitar
//   cualquier conversión de timezone. Le decimos explícitamente al
//   constructor de Date que use hora local con el formato extendido.
function formatTransactionDate(dateString: string): string {
    // Separamos "2026-01-15" en [2026, 1, 15]
    const [year, month, day] = dateString.split("-").map(Number);

    // new Date(year, monthIndex, day) usa timezone LOCAL — no UTC.
    // monthIndex es 0-based por eso restamos 1 al mes.
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

// ─── Componente ───────────────────────────────────────────────────────────────
// Cada tarjeta es tappable — lleva a la pantalla de edición.
// Separar esto en su propio componente hace que el map en history.tsx
// sea una sola línea limpia en lugar de 60 líneas de JSX anidado.
export function TransactionItem({ item }: TransactionItemProps) {
    const isIncome = item.type === "income";

    const handlePress = async () => {
        // Háptico al seleccionar una transacción para editar
        await Haptics.selectionAsync();
        router.push(`/edit-transaction/${item.localId}`);
    };

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => void handlePress()}
        >
            <AppCard>
                {/* ── Fila superior: concepto + badge de tipo ── */}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: spacing.sm,
                    }}
                >
                    <View style={{ flex: 1, paddingRight: spacing.md }}>
                        {/* Concepto — fallback a "Sin concepto" si está vacío */}
                        <Text
                            style={{
                                fontSize: typography.bodyLg,
                                fontWeight: typography.weightBold,
                                color: colors.text,
                                marginBottom: spacing.xs,
                            }}
                        >
                            {item.concept ?? "Sin concepto"}
                        </Text>

                        {/* Categoría y cuenta separadas por punto medio */}
                        <Text
                            style={{
                                fontSize: typography.bodySm,
                                color: colors.textMuted,
                                marginBottom: spacing.sm,
                            }}
                        >
                            {item.categoryName} · {item.accountName}
                        </Text>

                        {/* Badge de estado de sincronización */}
                        <SyncStatusBadge status={item.syncStatus} />
                    </View>

                    {/* Badge de tipo — verde para ingresos, rojo para egresos */}
                    <View
                        style={{
                            backgroundColor: isIncome
                                ? colors.successSoft
                                : colors.dangerSoft,
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 999,
                        }}
                    >
                        <Text
                            style={{
                                color: isIncome ? colors.success : colors.danger,
                                fontWeight: typography.weightSemibold,
                                fontSize: typography.bodySm,
                            }}
                        >
                            {isIncome ? "Ingreso" : "Egreso"}
                        </Text>
                    </View>
                </View>

                {/* ── Monto ── */}
                <Text
                    style={{
                        fontSize: typography.titleSection,
                        fontWeight: typography.weightBold,
                        // Verde para ingresos, rojo para egresos
                        color: isIncome ? colors.success : colors.danger,
                        marginBottom: spacing.sm,
                    }}
                >
                    ${item.amount.toFixed(2)}
                </Text>

                {/* ── Fecha formateada sin bug de timezone ── */}
                <Text
                    style={{
                        fontSize: typography.bodySm,
                        color: colors.textMuted,
                    }}
                >
                    {formatTransactionDate(item.transactionDate)}
                </Text>
            </AppCard>
        </TouchableOpacity>
    );
}