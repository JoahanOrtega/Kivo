import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { FormScreenContainer } from "@/components/layout/form-screen-container";
import { getTransactionHistory } from "@/features/transactions/transactions.service";
import { useAuthStore } from "@/store/auth-store";
import { colors } from "@/theme/colors";

/**
 * Pantalla placeholder del historial de movimientos.
 */
export default function HistoryScreen() {
    const session = useAuthStore((state) => state.session);
    const [items, setItems] = useState<
        Array<{
            localId: string;
            type: "income" | "expense";
            amount: number;
            concept: string | null;
            transactionDate: string;
            categoryName: string;
            paymentMethodName: string;
        }>
    >([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadHistory = useCallback(async () => {
        if (!session?.user.id) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const history = await getTransactionHistory(session.user.id);
            setItems(history);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user.id]);

    useFocusEffect(
        useCallback(() => {
            void loadHistory();
        }, [loadHistory])
    );

    return (
        <FormScreenContainer>
            <View style={{ flex: 1, paddingVertical: 12 }}>
                <Text
                    style={{
                        fontSize: 28,
                        fontWeight: "700",
                        color: colors.text,
                        marginBottom: 8,
                    }}
                >
                    Historial
                </Text>

                <Text
                    style={{
                        fontSize: 16,
                        lineHeight: 24,
                        color: colors.textMuted,
                        marginBottom: 24,
                    }}
                >
                    Movimientos guardados localmente.
                </Text>

                {isLoading ? (
                    <ActivityIndicator size="large" color={colors.primary} />
                ) : items.length === 0 ? (
                    <View
                        style={{
                            backgroundColor: colors.surface,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 16,
                            padding: 16,
                        }}
                    >
                        <Text style={{ color: colors.text, fontSize: 16 }}>
                            Aún no hay movimientos registrados.
                        </Text>
                    </View>
                ) : (
                    <View style={{ gap: 12 }}>
                        {items.map((item) => (
                            <View
                                key={item.localId}
                                style={{
                                    backgroundColor: colors.surface,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    borderRadius: 16,
                                    padding: 16,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontWeight: "700",
                                        color: colors.text,
                                        marginBottom: 6,
                                    }}
                                >
                                    {item.concept || "Sin concepto"} — ${item.amount.toFixed(2)}
                                </Text>

                                <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                                    {item.type === "income" ? "Ingreso" : "Egreso"} ·{" "}
                                    {item.categoryName}
                                </Text>

                                <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                                    {item.paymentMethodName}
                                </Text>

                                <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                                    {new Date(item.transactionDate).toLocaleString()}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </FormScreenContainer>
    );
}