export type SyncEntityType = "transaction";
export type SyncOperationType = "create" | "update" | "delete";
export type SyncQueueStatus = "pending" | "processing" | "completed" | "failed";

export type SyncQueueItem = {
    id: string;
    entityType: SyncEntityType;
    entityLocalId: string;
    operationType: SyncOperationType;
    payloadJson: string;
    status: SyncQueueStatus;
    retryCount: number;
    lastError: string | null;
    createdAt: string;
    updatedAt: string;
};