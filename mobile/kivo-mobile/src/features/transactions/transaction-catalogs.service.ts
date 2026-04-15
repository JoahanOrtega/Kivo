import { getDatabase } from "@/database/db";
import type { Category, CategoryType, PaymentMethod } from "@/types/catalogs";

/**
 * Obtiene categorías activas por tipo de movimiento.
 */
export async function getCategoriesByType(
  type: CategoryType
): Promise<Category[]> {
  const db = await getDatabase();

  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    type: CategoryType;
    is_default: number;
    is_active: number;
  }>(
    `
      SELECT id, name, type, is_default, is_active
      FROM categories
      WHERE type = ?
        AND is_active = 1
      ORDER BY name ASC
    `,
    [type]
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    isDefault: Boolean(row.is_default),
    isActive: Boolean(row.is_active),
  }));
}

/**
 * Obtiene métodos de pago activos.
 */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const db = await getDatabase();

  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    type: string | null;
    is_default: number;
    is_active: number;
  }>(
    `
      SELECT id, name, type, is_default, is_active
      FROM payment_methods
      WHERE is_active = 1
      ORDER BY name ASC
    `
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    isDefault: Boolean(row.is_default),
    isActive: Boolean(row.is_active),
  }));
}