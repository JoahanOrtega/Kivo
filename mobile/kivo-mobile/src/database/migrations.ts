import { getDatabase } from "@/database/db";

/**
 * Inicializa la base local y crea las tablas mínimas del MVP.
 * Este bloque es idempotente y puede ejecutarse en cada arranque.
 */
export async function initializeDatabase(): Promise<void> {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      is_default INTEGER NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payment_methods (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT,
      is_default INTEGER NOT NULL DEFAULT 1,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

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

  await seedBaseCatalogs();
}

/**
 * Inserta catálogos mínimos solo si aún no existen.
 */
async function seedBaseCatalogs(): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const existingCategories = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM categories`
  );

  if ((existingCategories?.count ?? 0) === 0) {
    await db.runAsync(
      `
        INSERT INTO categories (id, name, type, is_default, is_active, created_at, updated_at)
        VALUES
          (?, ?, ?, 1, 1, ?, ?),
          (?, ?, ?, 1, 1, ?, ?),
          (?, ?, ?, 1, 1, ?, ?),
          (?, ?, ?, 1, 1, ?, ?),
          (?, ?, ?, 1, 1, ?, ?),
          (?, ?, ?, 1, 1, ?, ?)
      `,
      [
        "cat-expense-general",
        "Gastos",
        "expense",
        now,
        now,

        "cat-expense-services",
        "Servicios",
        "expense",
        now,
        now,

        "cat-expense-debts",
        "Deudas",
        "expense",
        now,
        now,

        "cat-expense-savings",
        "Ahorro",
        "expense",
        now,
        now,

        "cat-income-salary",
        "Ingreso",
        "income",
        now,
        now,

        "cat-income-other",
        "Otros ingresos",
        "income",
        now,
        now,
      ]
    );
  }

  const existingPaymentMethods = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM payment_methods`
  );

  if ((existingPaymentMethods?.count ?? 0) === 0) {
    await db.runAsync(
      `
        INSERT INTO payment_methods (id, name, type, is_default, is_active, created_at, updated_at)
        VALUES
          (?, ?, ?, 1, 1, ?, ?),
          (?, ?, ?, 1, 1, ?, ?),
          (?, ?, ?, 1, 1, ?, ?),
          (?, ?, ?, 1, 1, ?, ?),
          (?, ?, ?, 1, 1, ?, ?)
      `,
      [
        "pm-cash",
        "Efectivo",
        "cash",
        now,
        now,

        "pm-bbva-credit",
        "TDC BBVA",
        "credit_card",
        now,
        now,

        "pm-didi-credit",
        "TDC DiDi",
        "credit_card",
        now,
        now,

        "pm-debit",
        "Débito",
        "debit_card",
        now,
        now,

        "pm-transfer",
        "Transferencia",
        "bank_transfer",
        now,
        now,
      ]
    );
  }
}