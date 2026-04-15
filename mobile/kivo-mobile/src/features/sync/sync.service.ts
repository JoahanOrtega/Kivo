import {
    getPendingSyncQueueItems,
    markSyncQueueItemCompleted,
    markSyncQueueItemFailed,
    markSyncQueueItemProcessing,
} from "@/features/sync/sync-queue.service";
import type { SyncQueueItem } from "@/types/sync";

export type SyncExecutor = (item: SyncQueueItem) => Promise<void>;

export async function processSyncQueue(
    executor: SyncExecutor
): Promise<{
    processed: number;
    completed: number;
    failed: number;
}> {
    const items = await getPendingSyncQueueItems();

    let processed = 0;
    let completed = 0;
    let failed = 0;

    for (const item of items) {
        processed += 1;

        try {
            await markSyncQueueItemProcessing(item.id);
            await executor(item);
            await markSyncQueueItemCompleted(item.id);
            completed += 1;
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Unknown sync error";

            await markSyncQueueItemFailed(item.id, message);
            failed += 1;
        }
    }

    return {
        processed,
        completed,
        failed,
    };
}

/**
 * Ejecutor temporal local.
 * Simula una sincronización exitosa para validar el flujo end-to-end.
 */
export async function mockSyncExecutor(_item: SyncQueueItem): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
}