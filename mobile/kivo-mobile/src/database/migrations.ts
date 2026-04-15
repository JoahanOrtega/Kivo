import { getDatabase } from "@/database/db";

/**
 * Inicializa la base local y crea las tablas mínimas del MVP.
 * Este bloque debe ser idempotente para poder ejecutarse en cada arranque.
 */
export async function initializeDatabase(): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS transactions (
      local_id TEXT PRIMARY KEY NOT NULL,
      server_id TEXT,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      amount REAL NOT NULL CHECK (amount > 0),
      category_id TEXT NOT NULL,
      payment_method_id TEXT NOT NULL,
      concept TEXT,
      budget_amount REAL,
      note TEXT,
      transaction_date TEXT NOT NULL,
      sync_status TEXT NOT NULL CHECK (
        sync_status IN ('pending_create', 'pending_update', 'pending_delete', 'synced', 'failed')
      ),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_user_id
      ON transactions (user_id);

    CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date
      ON transactions (transaction_date);

    CREATE INDEX IF NOT EXISTS idx_transactions_sync_status
      ON transactions (sync_status);
  `);
}