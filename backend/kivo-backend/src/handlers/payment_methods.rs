// =============================================================================
// handlers/payment_methods.rs — Endpoints de métodos de pago
//
// GET  /payment-methods — lista los métodos de pago del usuario
// POST /payment-methods — crear método de pago nuevo
// =============================================================================

use axum::{
    extract::State,
    routing::{get, post},
    Json, Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;
use crate::middleware::auth::AuthUser;

// ─── Modelo de respuesta ──────────────────────────────────────────────────────
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct PaymentMethodResponse {
    pub id: Uuid,
    pub user_id: Uuid,
    pub name: String,
    #[serde(rename = "type")]
    pub type_: String,
    pub last_four: Option<String>,
    pub color: String,
    pub icon: String,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

// ─── DTO: crear método de pago ────────────────────────────────────────────────
#[derive(Debug, Deserialize)]
pub struct CreatePaymentMethodDto {
    pub name: String,
    #[serde(rename = "type")]
    pub type_: String,
    pub last_four: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
}

// ─── Handler: GET /payment-methods ───────────────────────────────────────────
async fn list_payment_methods(
    auth: AuthUser,
    State(pool): State<PgPool>,
) -> Result<Json<Vec<PaymentMethodResponse>>, AppError> {
    let methods = sqlx::query_as!(
        PaymentMethodResponse,
        r#"
        SELECT
            id, user_id, name,
            type as type_,
            last_four, color, icon, is_active,
            created_at, updated_at
        FROM payment_methods
        WHERE user_id = $1 AND is_active = TRUE
        ORDER BY name ASC
        "#,
        auth.user_id
    )
    .fetch_all(&pool)
    .await?;

    Ok(Json(methods))
}

// ─── Handler: POST /payment-methods ──────────────────────────────────────────
async fn create_payment_method(
    auth: AuthUser,
    State(pool): State<PgPool>,
    Json(dto): Json<CreatePaymentMethodDto>,
) -> Result<Json<PaymentMethodResponse>, AppError> {
    if dto.name.trim().is_empty() {
        return Err(AppError::BadRequest("El nombre es requerido".to_string()));
    }

    let valid_types = ["cash", "debit_card", "credit_card", "transfer", "other"];
    if !valid_types.contains(&dto.type_.as_str()) {
        return Err(AppError::BadRequest("Tipo inválido".to_string()));
    }

    // Validar que last_four sea exactamente 4 dígitos si se proporciona
    if let Some(ref last_four) = dto.last_four {
        if last_four.len() != 4 || !last_four.chars().all(|c| c.is_numeric()) {
            return Err(AppError::BadRequest(
                "last_four debe ser exactamente 4 dígitos".to_string(),
            ));
        }
    }

    let method = sqlx::query_as!(
        PaymentMethodResponse,
        r#"
        INSERT INTO payment_methods (user_id, name, type, last_four, color, icon)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            id, user_id, name,
            type as type_,
            last_four, color, icon, is_active,
            created_at, updated_at
        "#,
        auth.user_id,
        dto.name.trim(),
        dto.type_,
        dto.last_four,
        dto.color.unwrap_or_else(|| "#6B7280".to_string()),
        dto.icon.unwrap_or_else(|| "credit-card".to_string()),
    )
    .fetch_one(&pool)
    .await?;

    Ok(Json(method))
}

// ─── Router ───────────────────────────────────────────────────────────────────
pub fn router() -> Router<PgPool> {
    Router::new().route(
        "/payment-methods",
        get(list_payment_methods).post(create_payment_method),
    )
}
