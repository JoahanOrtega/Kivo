-- =============================================================================
-- Migration 003: Crear tabla de métodos de pago
-- =============================================================================

CREATE TABLE payment_methods (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    type            VARCHAR(30) NOT NULL CHECK (
                        type IN ('cash', 'debit_card', 'credit_card', 'transfer', 'other')
                    ),
    last_four       CHAR(4),
    color           CHAR(7) NOT NULL DEFAULT '#6B7280',
    icon            VARCHAR(50) NOT NULL DEFAULT 'credit-card',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_payment_method_name_per_user UNIQUE (user_id, name)
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);