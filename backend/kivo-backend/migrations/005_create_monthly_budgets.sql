-- =============================================================================
-- Migration 005: Crear tabla de presupuestos mensuales
-- =============================================================================

CREATE TABLE monthly_budgets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id     UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    year            SMALLINT NOT NULL CHECK (year >= 2020 AND year <= 2100),
    month           SMALLINT NOT NULL CHECK (month >= 1 AND month <= 12),
    budgeted_amount NUMERIC(12, 2) NOT NULL CHECK (budgeted_amount >= 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_budget_per_user_category_month
        UNIQUE (user_id, category_id, year, month)
);

CREATE INDEX idx_monthly_budgets_user_period
    ON monthly_budgets(user_id, year, month);