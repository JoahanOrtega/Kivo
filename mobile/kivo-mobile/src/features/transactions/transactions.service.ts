import { getDatabase } from "@/database/db";

export type CreateTransactionInput = {
  userId: string;
  type: "income" | "expense";
  amount: number;
  categoryId: string;
  paymentMethodId: string;
  transactionDate: string;
  concept?: string | null;
  budgetAmount?: number | null;
  note?: string | null;
};

/**
 * Genera un id local simple para el MVP.
 * Más adelante puedes cambiarlo por crypto.randomUUID() si tu entorno lo soporta establemente.
 */
function generateLocalId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Inserta un movimiento local en SQLite con estado pending_create.
 */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<{ localId: string }> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const localId = generateLocalId();

  await db.runAsync(
    `
      INSERT INTO transactions (
        local_id,
        server_id,
        user_id,
        type,
        amount,
        category_id,
        payment_method_id,
        concept,
        budget_amount,
        note,
        transaction_date,
        sync_status,
        created_at,
        updated_at,
        deleted_at
      )
      VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_create', ?, ?, NULL)
    `,
    [
      localId,
      input.userId,
      input.type,
      input.amount,
      input.categoryId,
      input.paymentMethodId,
      input.concept ?? null,
      input.budgetAmount ?? null,
      input.note ?? null,
      input.transactionDate,
      now,
      now,
    ]
  );

  return { localId };
}

/**
 * Obtiene historial visible del usuario ordenado por fecha descendente.
 */
export async function getTransactionHistory(userId: string): Promise<
  Array<{
    localId: string;
    type: "income" | "expense";
    amount: number;
    concept: string | null;
    transactionDate: string;
    categoryName: string;
    paymentMethodName: string;
  }>
> {
  const db = await getDatabase();

  return db.getAllAsync(
    `
      SELECT
        t.local_id as localId,
        t.type as type,
        t.amount as amount,
        t.concept as concept,
        t.transaction_date as transactionDate,
        c.name as categoryName,
        pm.name as paymentMethodName
      FROM transactions t
      INNER JOIN categories c ON c.id = t.category_id
      INNER JOIN payment_methods pm ON pm.id = t.payment_method_id
      WHERE t.user_id = ?
        AND t.deleted_at IS NULL
      ORDER BY t.transaction_date DESC, t.created_at DESC
    `,
    [userId]
  );
}