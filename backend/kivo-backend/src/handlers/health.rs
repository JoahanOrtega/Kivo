// =============================================================================
// handlers/health.rs — Endpoint de health check
//
// GET /health
// Retorna el estado del servidor. Útil para verificar que el servidor
// está corriendo y para monitoreo en producción.
// =============================================================================

use axum::{routing::get, Json, Router};
use serde::Serialize;
use sqlx::PgPool;

/// Respuesta del endpoint de health check.
#[derive(Serialize)]
pub struct HealthResponse {
    status: &'static str,
    version: &'static str,
}

/// Handler del endpoint GET /health.
/// Retorna 200 OK con información básica del servidor.
async fn health_handler() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        version: env!("CARGO_PKG_VERSION"),
    })
}

/// Retorna el sub-router con las rutas de health.
/// Se llama desde main.rs al construir el router principal.
pub fn router() -> Router<PgPool> {
    Router::new().route("/health", get(health_handler))
}
