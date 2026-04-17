import { ActivityIndicator, Text, View } from "react-native";

import { AppCard } from "@/components/ui/app-card";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import {
    TransactionItem,
    type TransactionItemData,
} from "@/components/history/transaction-item";

// ─── Props ────────────────────────────────────────────────────────────────────
interface TransactionListProps {
    items: TransactionItemData[];
    isLoading: boolean;
    hasError: boolean;
    onRetry: () => void;
}

// ─── Subcomponente: estado de carga ──────────────────────────────────────────
function LoadingState() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: spacing["4xl"],
            }}
        >
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
}

// ─── Subcomponente: estado vacío ──────────────────────────────────────────────
// Se muestra cuando no hay transacciones con los filtros actuales.
// El mensaje guía al usuario sobre qué puede hacer para ver resultados.
function EmptyState() {
    return (
        <AppCard>
            <Text
                style={{
                    color: colors.text,
                    fontSize: typography.bodyLg,
                    fontWeight: typography.weightSemibold,
                    marginBottom: spacing.xs,
                }}
            >
                No encontramos movimientos
            </Text>

            <Text
                style={{
                    color: colors.textMuted,
                    fontSize: typography.bodyMd,
                    lineHeight: 22,
                }}
            >
                Prueba cambiando el mes o ajustando los filtros para
                ver más resultados.
            </Text>
        </AppCard>
    );
}

// ─── Subcomponente: estado de error ──────────────────────────────────────────
// Resuelve el problema #4 — sin este componente el usuario veía
// la pantalla vacía sin saber si fue un error o simplemente no hay datos.
function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <AppCard>
            <Text
                style={{
                    color: colors.text,
                    fontSize: typography.bodyLg,
                    fontWeight: typography.weightSemibold,
                    marginBottom: spacing.xs,
                }}
            >
                No se pudo cargar el historial
            </Text>

            <Text
                style={{
                    color: colors.textMuted,
                    fontSize: typography.bodyMd,
                    lineHeight: 22,
                    marginBottom: spacing.lg,
                }}
            >
                Revisa tu conexión e intenta de nuevo.
            </Text>

            <Text
                onPress={onRetry}
                style={{
                    color: colors.primary,
                    fontSize: typography.bodyMd,
                    fontWeight: typography.weightSemibold,
                }}
            >
                Reintentar
            </Text>
        </AppCard>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────
// Decide cuál de los tres estados renderizar.
// La lógica de decisión está centralizada aquí — history.tsx
// no necesita saber nada sobre estos estados.
export function TransactionList({
    items,
    isLoading,
    hasError,
    onRetry,
}: TransactionListProps) {
    // Estado de carga — tiene prioridad sobre todo lo demás
    if (isLoading) {
        return <LoadingState />;
    }

    // Estado de error — segundo en prioridad
    if (hasError) {
        return <ErrorState onRetry={onRetry} />;
    }

    // Estado vacío — no hay items con los filtros actuales
    if (items.length === 0) {
        return <EmptyState />;
    }

    // Estado con datos — lista de transacciones
    return (
        <View style={{ gap: spacing.md }}>
            {items.map((item) => (
                // Cada item es un componente independiente —
                // el map queda en una sola línea limpia
                <TransactionItem key={item.localId} item={item} />
            ))}
        </View>
    );
}