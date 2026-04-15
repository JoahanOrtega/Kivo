import { getDatabase } from "@/database/db";
import type {
    SyncEntityType,
    SyncOperationType,
    SyncQueueItem,
} from "@/types/sync";

function generateQueueId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Agrega una operación a la cola local de sincronización.
 */
export async function enqueueSyncOperation(params: {
    entityType: SyncEntityType;
    entityLocalId: string;
    operationType: SyncOperationType;
    payload: unknown;
}): Promise<{ id: string }> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const id = generateQueueId();

    await db.runAsync(
        `
      INSERT INTO sync_queue (
        id,
        entity_type,
        entity_local_id,
        operation_type,
        payload_json,
        status,
        retry_count,
        last_error,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, 'pending', 0, NULL, ?, ?)
    `,
        [
            id,
            params.entityType,
            params.entityLocalId,
            params.operationType,
            JSON.stringify(params.payload),
            now,
            now,
        ]
    );

    return { id };
}

/**
 * Obtiene la cantidad de operaciones pendientes o fallidas aún no completadas.
 */
export async function getPendingSyncCount(): Promise<number> {
    const db = await getDatabase();

    const row = await db.getFirstAsync<{ count: number }>(
        `
      SELECT COUNT(*) as count
      FROM sync_queue
      WHERE status IN ('pending', 'failed', 'processing')
    `
    );

    return Number(row?.count ?? 0);
}

/**
 * Obtiene elementos pendientes para una futura sincronización real.
 */
export async function getPendingSyncQueueItems(): Promise<SyncQueueItem[]> {
    const db = await getDatabase();

    const rows = await db.getAllAsync<{
        id: string;
        entity_type: SyncEntityType;
        entity_local_id: string;
        operation_type: SyncOperationType;
        payload_json: string;
        status: "pending" | "processing" | "completed" | "failed";
        retry_count: number;
        last_error: string | null;
        created_at: string;
        updated_at: string;
    }>(
        `
      SELECT
        id,
        entity_type,
        entity_local_id,
        operation_type,
        payload_json,
        status,
        retry_count,
        last_error,
        created_at,
        updated_at
      FROM sync_queue
      WHERE status IN ('pending', 'failed')
      ORDER BY created_at ASC
    `
    );

    return rows.map((row) => ({
        id: row.id,
        entityType: row.entity_type,
        entityLocalId: row.entity_local_id,
        operationType: row.operation_type,
        payloadJson: row.payload_json,
        status: row.status,
        retryCount: row.retry_count,
        lastError: row.last_error,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}