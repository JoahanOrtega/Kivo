-- =============================================================================
-- Migration 004: Crear tabla de transacciones
-- =============================================================================

CREATE TABLE transactions (
    id                  UUID PRIMARY KEY,
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id         UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    payment_method_id   UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
    transaction_date    DATE NOT NULL,
    type                VARCHAR(20) NOT NULL CHECK (
                            type IN ('income', 'expense', 'savings', 'debt', 'payment')
                        ),
    concept             VARCHAR(255),
    amount              NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    budgeted_amount     NUMERIC(12, 2) CHECK (budgeted_amount > 0),
    notes               TEXT,
    deleted_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_date
    ON transactions(user_id, transaction_date DESC);

CREATE INDEX idx_transactions_user_category
    ON transactions(user_id, category_id);

CREATE INDEX idx_transactions_updated_at
    ON transactions(user_id, updated_at DESC);

CREATE INDEX idx_transactions_active
    ON transactions(user_id, transaction_date DESC)
    WHERE deleted_at IS NULL;

COMMENT ON COLUMN transactions.id IS 'UUID generado en el cliente móvil para soporte offline-first.';
COMMENT ON COLUMN transactions.deleted_at IS 'Borrado lógico. NULL = activo.';