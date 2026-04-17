// =============================================================================
// middleware/auth.rs — Extractor de autenticación JWT
//
// Axum tiene un concepto llamado "extractors" — structs que implementan
// FromRequestParts y que se pueden usar como parámetros en los handlers.
//
// Al agregar `AuthUser` como parámetro de un handler, Axum automáticamente
// extrae y verifica el JWT antes de ejecutar el handler.
// Si el token es inválido o no existe, retorna 401 sin llegar al handler.
//
// Uso en un handler:
//   async fn mi_handler(
//       auth: AuthUser,        ← Axum verifica el JWT aquí
//       State(pool): State<PgPool>,
//   ) -> Result<Json<...>, AppError> {
//       let user_id = auth.user_id; // ID del usuario autenticado
//   }
// =============================================================================

use axum::{
    async_trait,
    extract::FromRequestParts,
    http::request::Parts,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use uuid::Uuid;

use crate::errors::AppError;
use crate::handlers::auth::Claims;

// ─── Datos del usuario autenticado ───────────────────────────────────────────
// Este struct se inyecta en los handlers que requieren autenticación.
// Contiene solo lo necesario — el ID y email del usuario del token.
#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: Uuid,
    pub email: String,
}

// ─── Implementación del extractor ────────────────────────────────────────────
// FromRequestParts le dice a Axum cómo construir AuthUser desde
// los headers del request.
#[async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // ── Extraer el header Authorization ──────────────────────────────────
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|value| value.to_str().ok())
            .ok_or_else(|| AppError::Unauthorized("Token no proporcionado".to_string()))?;

        // ── Verificar formato "Bearer <token>" ────────────────────────────────
        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or_else(|| {
                AppError::Unauthorized("Formato de token inválido. Usa: Bearer <token>".to_string())
            })?;

        // ── Obtener JWT_SECRET del entorno ────────────────────────────────────
        let jwt_secret = std::env::var("JWT_SECRET")
            .map_err(|_| AppError::InternalError("JWT_SECRET no configurado".to_string()))?;

        // ── Decodificar y verificar el token ──────────────────────────────────
        // Validation verifica la firma y la expiración automáticamente.
        // Si el token expiró o la firma no coincide, retorna error.
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(jwt_secret.as_bytes()),
            &Validation::default(),
        )
        .map_err(|e| {
            tracing::warn!("Token JWT inválido: {:?}", e);
            AppError::Unauthorized("Token inválido o expirado".to_string())
        })?;

        // ── Parsear el user_id como UUID ──────────────────────────────────────
        let user_id = Uuid::parse_str(&token_data.claims.sub)
            .map_err(|_| AppError::Unauthorized("Token malformado".to_string()))?;

        Ok(AuthUser {
            user_id,
            email: token_data.claims.email,
        })
    }
}