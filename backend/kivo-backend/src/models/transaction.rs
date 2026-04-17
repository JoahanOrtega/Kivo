// =============================================================================
// models/transaction.rs — Modelo de transacción
// =============================================================================

use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use bigdecimal::BigDecimal;

// ─── Modelo de BD ─────────────────────────────────────────────────────────────
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Transaction {
    pub id: Uuid,
    pub user_id: Uuid,
    pub category_id: Uuid,
    pub payment_method_id: Option<Uuid>,
    pub transaction_date: NaiveDate,
    pub type_: String,
    pub concept: Option<String>,
    pub amount: BigDecimal,
    pub budgeted_amount: Option<BigDecimal>,
    pub notes: Option<String>,
    pub deleted_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ─── DTO: crear transacción ───────────────────────────────────────────────────
#[derive(Debug, Deserialize)]
pub struct CreateTransactionDto {
    /// UUID generado en el cliente móvil
    pub id: Uuid,
    pub category_id: Uuid,
    pub payment_method_id: Option<Uuid>,
    pub transaction_date: NaiveDate,
    pub type_: String,
    pub concept: Option<String>,
    pub amount: f64,
    pub budgeted_amount: Option<f64>,
    pub notes: Option<String>,
}

// ─── DTO: actualizar transacción ──────────────────────────────────────────────
#[derive(Debug, Deserialize)]
pub struct UpdateTransactionDto {
    pub category_id: Option<Uuid>,
    pub payment_method_id: Option<Uuid>,
    pub transaction_date: Option<NaiveDate>,
    pub type_: Option<String>,
    pub concept: Option<String>,
    pub amount: Option<f64>,
    pub budgeted_amount: Option<f64>,
    pub notes: Option<String>,
}

// ─── Filtros para listar transacciones ───────────────────────────────────────
#[derive(Debug, Deserialize)]
pub struct TransactionFilters {
    pub year: Option<i32>,
    pub month: Option<i32>,
    pub type_: Option<String>,
    pub category_id: Option<Uuid>,
}

// ─── Respuesta pública de transacción ────────────────────────────────────────
// Convierte BigDecimal a f64 para serializar a JSON correctamente.
#[derive(Debug, Serialize)]
pub struct TransactionResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub category_id: Uuid,
    pub payment_method_id: Option<Uuid>,
    pub transaction_date: NaiveDate,
    #[serde(rename = "type")]
    pub type_: String,
    pub concept: Option<String>,
    pub amount: f64,
    pub budgeted_amount: Option<f64>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}