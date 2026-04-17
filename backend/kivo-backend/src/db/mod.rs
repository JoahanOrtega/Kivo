// =============================================================================
// db/mod.rs — Configuración del pool de conexiones PostgreSQL
//
// El pool permite reutilizar conexiones en lugar de abrir una nueva
// por cada request — crítico para el rendimiento en producción.
// =============================================================================

use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;

/// Crea y retorna el pool de conexiones a PostgreSQL.
///
/// # Parámetros
/// - `database_url`: URL de conexión en formato postgresql://user:pass@host/db
///
/// # Panics
/// Falla si no puede conectarse a la base de datos al iniciar.
/// Es intencional — si no hay BD, el servidor no debe arrancar.
pub async fn create_pool(database_url: &str) -> PgPool {
    PgPoolOptions::new()
        // Máximo de conexiones simultáneas al pool.
        // Para desarrollo 5 es suficiente; en producción se ajusta.
        .max_connections(5)
        .connect(database_url)
        .await
        .expect("No se pudo conectar a PostgreSQL. Verifica DATABASE_URL en .env")
}