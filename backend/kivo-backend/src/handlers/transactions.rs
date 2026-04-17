// =============================================================================
// handlers/transactions.rs — CRUD de transacciones
//
// GET    /transactions          — listar transacciones del mes
// POST   /transactions          — crear transacción
// PUT    /transactions/:id      — actualizar transacción
// DELETE /transactions/:id      — borrado lógico
// =============================================================================

use axum::{
    extract::{Path, Query, State},
    routing::{get, put, delete},
    Json, Router,
};
use bigdecimal::BigDecimal;
use chrono::Datelike;
use chrono::NaiveDate;
use sqlx::PgPool;
use std::str::FromStr;
use uuid::Uuid;

use crate::errors::AppError;
use crate::middleware::auth::AuthUser;
use crate::models::transaction::{
    CreateTransactionDto, TransactionFilters, TransactionResponse, UpdateTransactionDto,
};

// ─── Handler: GET /transactions ───────────────────────────────────────────────
// Lista las transacciones activas del usuario autenticado.
// Acepta filtros opcionales por año, mes y tipo.
async fn list_transactions(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Query(filters): Query<TransactionFilters>,
) -> Result<Json<Vec<TransactionResponse>>, AppError> {

    // Si no se pasa año/mes, usamos el mes actual
    let now = chrono::Utc::now().naive_utc().date();
    let year = filters.year.unwrap_or(now.year());
    let month = filters.month.unwrap_or(now.month() as i32);

    // Construimos el rango de fechas del mes
    let start_date = NaiveDate::from_ymd_opt(year, month as u32, 1)
        .ok_or_else(|| AppError::BadRequest("Fecha inválida".to_string()))?;

    let end_date = if month == 12 {
        NaiveDate::from_ymd_opt(year + 1, 1, 1)
    } else {
        NaiveDate::from_ymd_opt(year, (month + 1) as u32, 1)
    }
    .ok_or_else(|| AppError::BadRequest("Fecha inválida".to_string()))?;

    let rows = sqlx::query!(
        r#"
        SELECT
            id, user_id, category_id, payment_method_id,
            transaction_date, type as type_, concept,
            amount, budgeted_amount, notes,
            created_at, updated_at
        FROM transactions
        WHERE user_id = $1
            AND deleted_at IS NULL
            AND transaction_date >= $2
            AND transaction_date < $3
        ORDER BY transaction_date DESC, created_at DESC
        "#,
        auth.user_id,
        start_date,
        end_date
    )
    .fetch_all(&pool)
    .await?;

    let transactions = rows
        .into_iter()
        .map(|row| TransactionResponse {
            id: row.id,
            user_id: row.user_id,
            category_id: row.category_id,
            payment_method_id: row.payment_method_id,
            transaction_date: row.transaction_date,
            type_: row.type_,
            concept: row.concept,
            amount: row.amount.to_string().parse::<f64>().unwrap_or(0.0),
            budgeted_amount: row.budgeted_amount
                .map(|b| b.to_string().parse::<f64>().unwrap_or(0.0)),
            notes: row.notes,
            created_at: row.created_at,
            updated_at: row.updated_at,
        })
        .collect();

    Ok(Json(transactions))
}

// ─── Handler: POST /transactions ──────────────────────────────────────────────
// Crea una transacción nueva.
// El ID viene del cliente — fundamental para offline-first.
async fn create_transaction(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(dto): Json<CreateTransactionDto>,
) -> Result<Json<TransactionResponse>, AppError> {

    // Validaciones
    if dto.amount <= 0.0 {
        return Err(AppError::BadRequest("El monto debe ser mayor a 0".to_string()));
    }

    let valid_types = ["income", "expense", "savings", "debt", "payment"];
    if !valid_types.contains(&dto.type_.as_str()) {
        return Err(AppError::BadRequest("Tipo de transacción inválido".to_string()));
    }

    let amount = BigDecimal::from_str(&dto.amount.to_string())
        .map_err(|_| AppError::BadRequest("Monto inválido".to_string()))?;

    let budgeted_amount = dto.budgeted_amount
        .map(|b| BigDecimal::from_str(&b.to_string()))
        .transpose()
        .map_err(|_| AppError::BadRequest("Presupuesto inválido".to_string()))?;

    let row = sqlx::query!(
        r#"
        INSERT INTO transactions (
            id, user_id, category_id, payment_method_id,
            transaction_date, type, concept,
            amount, budgeted_amount, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING
            id, user_id, category_id, payment_method_id,
            transaction_date, type as type_, concept,
            amount, budgeted_amount, notes,
            created_at, updated_at
        "#,
        dto.id,
        auth.user_id,
        dto.category_id,
        dto.payment_method_id,
        dto.transaction_date,
        dto.type_,
        dto.concept,
        amount,
        budgeted_amount,
        dto.notes
    )
    .fetch_one(&pool)
    .await?;

    Ok(Json(TransactionResponse {
        id: row.id,
        user_id: row.user_id,
        category_id: row.category_id,
        payment_method_id: row.payment_method_id,
        transaction_date: row.transaction_date,
        type_: row.type_,
        concept: row.concept,
        amount: row.amount.to_string().parse::<f64>().unwrap_or(0.0),
        budgeted_amount: row.budgeted_amount
            .map(|b| b.to_string().parse::<f64>().unwrap_or(0.0)),
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }))
}

// ─── Handler: PUT /transactions/:id ──────────────────────────────────────────
// Actualiza una transacción existente del usuario autenticado.
async fn update_transaction(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(dto): Json<UpdateTransactionDto>,
) -> Result<Json<TransactionResponse>, AppError> {

    // Verificar que la transacción existe y pertenece al usuario
    let existing = sqlx::query!(
        "SELECT id FROM transactions WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL",
        id,
        auth.user_id
    )
    .fetch_optional(&pool)
    .await?;

    if existing.is_none() {
        return Err(AppError::NotFound("Transacción no encontrada".to_string()));
    }

    let amount = dto.amount
        .map(|a| BigDecimal::from_str(&a.to_string()))
        .transpose()
        .map_err(|_| AppError::BadRequest("Monto inválido".to_string()))?;

    let budgeted = dto.budgeted_amount
        .map(|b| BigDecimal::from_str(&b.to_string()))
        .transpose()
        .map_err(|_| AppError::BadRequest("Presupuesto inválido".to_string()))?;

    let row = sqlx::query!(
        r#"
        UPDATE transactions SET
            category_id         = COALESCE($1, category_id),
            payment_method_id   = COALESCE($2, payment_method_id),
            transaction_date    = COALESCE($3, transaction_date),
            type                = COALESCE($4, type),
            concept             = COALESCE($5, concept),
            amount              = COALESCE($6, amount),
            budgeted_amount     = COALESCE($7, budgeted_amount),
            notes               = COALESCE($8, notes)
        WHERE id = $9 AND user_id = $10
        RETURNING
            id, user_id, category_id, payment_method_id,
            transaction_date, type as type_, concept,
            amount, budgeted_amount, notes,
            created_at, updated_at
        "#,
        dto.category_id,
        dto.payment_method_id,
        dto.transaction_date,
        dto.type_,
        dto.concept,
        amount,
        budgeted,
        dto.notes,
        id,
        auth.user_id
    )
    .fetch_one(&pool)
    .await?;

    Ok(Json(TransactionResponse {
        id: row.id,
        user_id: row.user_id,
        category_id: row.category_id,
        payment_method_id: row.payment_method_id,
        transaction_date: row.transaction_date,
        type_: row.type_,
        concept: row.concept,
        amount: row.amount.to_string().parse::<f64>().unwrap_or(0.0),
        budgeted_amount: row.budgeted_amount
            .map(|b| b.to_string().parse::<f64>().unwrap_or(0.0)),
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
    }))
}

// ─── Handler: DELETE /transactions/:id ───────────────────────────────────────
// Borrado lógico — marca deleted_at en lugar de eliminar el registro.
// Los datos financieros nunca se eliminan físicamente.
async fn delete_transaction(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, AppError> {

    let result = sqlx::query!(
        r#"
        UPDATE transactions
        SET deleted_at = NOW()
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
        "#,
        id,
        auth.user_id
    )
    .execute(&pool)
    .await?;

    // Si no afectó ninguna fila, la transacción no existe o ya fue eliminada
    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Transacción no encontrada".to_string()));
    }

    Ok(Json(serde_json::json!({
        "message": "Transacción eliminada correctamente"
    })))
}

// ─── Router ───────────────────────────────────────────────────────────────────
pub fn router() -> Router<PgPool> {
    Router::new()
        .route("/transactions", get(list_transactions).post(create_transaction))
        .route("/transactions/:id", put(update_transaction).delete(delete_transaction))
}