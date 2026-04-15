import { getDatabase } from "@/database/db";

export type DashboardSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
};

/**
 * Calcula el rango ISO del mes seleccionado.
 * Se usa para consultar únicamente los movimientos del periodo.
 */
function getMonthRange(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 1);

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

/**
 * Obtiene el resumen local del dashboard para un mes específico.
 * Solo considera movimientos no eliminados lógicamente.
 */
export async function getDashboardSummary(params: {
  userId: string;
  year: number;
  month: number;
}): Promise<DashboardSummary> {
  const db = await getDatabase();
  const { start, end } = getMonthRange(params.year, params.month);

  const row = await db.getFirstAsync<{
    total_income: number | null;
    total_expense: number | null;
    transaction_count: number | null;
  }>(
    `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense,
        COUNT(*) AS transaction_count
      FROM transactions
      WHERE user_id = ?
        AND deleted_at IS NULL
        AND transaction_date >= ?
        AND transaction_date < ?
    `,
    [params.userId, start, end]
  );

  const totalIncome = Number(row?.total_income ?? 0);
  const totalExpense = Number(row?.total_expense ?? 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount: Number(row?.transaction_count ?? 0),
  };
}