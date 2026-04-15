import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { FormScreenContainer } from "@/components/layout/form-screen-container";
import { AppButton } from "@/components/ui/app-button";
import { AppCard } from "@/components/ui/app-card";
import { useToast } from "@/components/ui/toast-provider";
import { getAllSyncQueueItems, getPendingSyncCount } from "@/features/sync/sync-queue.service";
import { mockSyncExecutor, processSyncQueue } from "@/features/sync/sync.service";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { typography } from "@/theme/typography";
import type { SyncQueueItem } from "@/types/sync";

export default function SyncInspectorScreen() {
    const { showToast } = useToast();

    const [items, setItems] = useState<SyncQueueItem[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const loadQueue = useCallback(async () => {
        try {
            setIsLoading(true);

            const [allItems, pending] = await Promise.all([
                getAllSyncQueueItems(),
                getPendingSyncCount(),
            ]);

            setItems(allItems);
            setPendingCount(pending);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            void loadQueue();
        }, [loadQueue])
    );

    const handleProcessQueue = async () => {
        try {
            setIsProcessing(true);

            const result = await processSyncQueue(mockSyncExecutor);

            await loadQueue();

            showToast(
                `Sync procesado: ${result.completed} completado(s), ${result.failed} fallido(s)`,
                result.failed > 0 ? "error" : "success"
            );
        } catch (error) {
            console.error(error);
            showToast("No se pudo procesar la cola de sincronización", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusColor = (status: SyncQueueItem["status"]) => {
        if (status === "completed") return colors.success;
        if (status === "failed") return colors.danger;
        if (status === "processing") return colors.warning;
        return colors.primary;
    };

    const getStatusBackground = (status: SyncQueueItem["status"]) => {
        if (status === "completed") return colors.successSoft;
        if (status === "failed") return colors.dangerSoft;
        if (status === "processing") return colors.warningSoft;
        return colors.primarySoft;
    };

    return (
        <FormScreenContainer>
            <View style={{ flex: 1, paddingVertical: spacing.lg }}>
                <View style={{ marginBottom: spacing["2xl"] }}>
                    <Text
                        style={{
                            fontSize: typography.titlePage,
                            fontWeight: typography.weightBold,
                            color: colors.text,
                            marginBottom: spacing.sm,
                        }}
                    >
                        Sync inspector
                    </Text>

                    <Text
                        style={{
                            fontSize: typography.bodyLg,
                            lineHeight: 24,
                            color: colors.textMuted,
                        }}
                    >
                        Revisa la cola local de sincronización y procesa los pendientes manualmente.
                    </Text>
                </View>

                <AppCard style={{ marginBottom: spacing.lg }}>
                    <Text
                        style={{
                            fontSize: typography.bodyMd,
                            color: colors.textMuted,
                            marginBottom: spacing.sm,
                        }}
                    >
                        Pendientes actuales
                    </Text>

                    <Text
                        style={{
                            fontSize: 32,
                            fontWeight: typography.weightBold,
                            color: colors.text,
                            marginBottom: spacing.md,
                        }}
                    >
                        {pendingCount}
                    </Text>

                    <AppButton
                        label={isProcessing ? "Procesando..." : "Procesar sync"}
                        onPress={handleProcessQueue}
                        disabled={isProcessing}
                    />
                </AppCard>

                {isLoading ? (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : items.length === 0 ? (
                    <AppCard>
                        <Text
                            style={{
                                color: colors.text,
                                fontSize: typography.bodyLg,
                                fontWeight: typography.weightSemibold,
                                marginBottom: spacing.xs,
                            }}
                        >
                            No hay items en la cola
                        </Text>

                        <Text
                            style={{
                                color: colors.textMuted,
                                fontSize: typography.bodyMd,
                                lineHeight: 22,
                            }}
                        >
                            Cuando crees, edites o elimines movimientos, aquí verás las operaciones pendientes.
                        </Text>
                    </AppCard>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={{ gap: spacing.md, paddingBottom: spacing["3xl"] }}>
                            {items.map((item) => (
                                <AppCard key={item.id}>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            marginBottom: spacing.sm,
                                        }}
                                    >
                                        <View style={{ flex: 1, paddingRight: spacing.md }}>
                                            <Text
                                                style={{
                                                    fontSize: typography.bodyLg,
                                                    fontWeight: typography.weightBold,
                                                    color: colors.text,
                                                    marginBottom: spacing.xs,
                                                }}
                                            >
                                                {item.operationType.toUpperCase()} · {item.entityType}
                                            </Text>

                                            <Text
                                                style={{
                                                    fontSize: typography.bodySm,
                                                    color: colors.textMuted,
                                                    marginBottom: spacing.xs,
                                                }}
                                            >
                                                Local ID: {item.entityLocalId}
                                            </Text>

                                            <Text
                                                style={{
                                                    fontSize: typography.bodySm,
                                                    color: colors.textMuted,
                                                }}
                                            >
                                                Retries: {item.retryCount}
                                            </Text>
                                        </View>

                                        <View
                                            style={{
                                                backgroundColor: getStatusBackground(item.status),
                                                paddingHorizontal: 12,
                                                paddingVertical: 8,
                                                borderRadius: 999,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: getStatusColor(item.status),
                                                    fontSize: typography.bodySm,
                                                    fontWeight: typography.weightSemibold,
                                                }}
                                            >
                                                {item.status}
                                            </Text>
                                        </View>
                                    </View>

                                    {item.lastError ? (
                                        <View
                                            style={{
                                                marginBottom: spacing.sm,
                                                backgroundColor: colors.dangerSoft,
                                                borderRadius: 12,
                                                padding: 10,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: colors.danger,
                                                    fontSize: typography.bodySm,
                                                    lineHeight: 20,
                                                }}
                                            >
                                                Error: {item.lastError}
                                            </Text>
                                        </View>
                                    ) : null}

                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        style={{
                                            backgroundColor: colors.surfaceMuted,
                                            borderRadius: 12,
                                            padding: 12,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: colors.textMuted,
                                                fontSize: typography.caption,
                                                lineHeight: 18,
                                            }}
                                            numberOfLines={6}
                                        >
                                            {item.payloadJson}
                                        </Text>
                                    </TouchableOpacity>
                                </AppCard>
                            ))}
                        </View>
                    </ScrollView>
                )}
            </View>
        </FormScreenContainer>
    );
}