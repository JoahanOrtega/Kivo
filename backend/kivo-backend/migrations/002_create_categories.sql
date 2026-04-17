-- =============================================================================
-- Migration 002: Crear tabla de categorías
-- =============================================================================

CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'savings', 'debt', 'payment')),
    color           CHAR(7) NOT NULL DEFAULT '#6B7280',
    icon            VARCHAR(50) NOT NULL DEFAULT 'tag',
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_category_name_per_user UNIQUE (user_id, name, type)
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);

-- Categorías predeterminadas del sistema (user_id = NULL)
INSERT INTO categories (user_id, name, type, color, icon, sort_order) VALUES
    (NULL, 'Expenses',      'expense',  '#EF4444', 'shopping-bag',  1),
    (NULL, 'Services',      'expense',  '#F59E0B', 'zap',           2),
    (NULL, 'Transport',     'expense',  '#3B82F6', 'car',           3),
    (NULL, 'Food',          'expense',  '#10B981', 'utensils',      4),
    (NULL, 'Health',        'expense',  '#8B5CF6', 'heart',         5),
    (NULL, 'Education',     'expense',  '#06B6D4', 'book',          6),
    (NULL, 'Salary',        'income',   '#22C55E', 'briefcase',     1),
    (NULL, 'Freelance',     'income',   '#84CC16', 'code',          2),
    (NULL, 'Extra income',  'income',   '#A3E635', 'plus-circle',   3),
    (NULL, 'Savings',       'savings',  '#14B8A6', 'piggy-bank',    1),
    (NULL, 'Investment',    'savings',  '#0EA5E9', 'trending-up',   2),
    (NULL, 'Debt',          'debt',     '#F97316', 'credit-card',   1),
    (NULL, 'Card payment',  'payment',  '#EC4899', 'credit-card',   1);