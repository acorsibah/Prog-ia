-- ============================================================
-- Migração 001: Adiciona tabelas ingredientes, receitas e
-- receitas_ingredientes ao banco existente sem perda de dados.
-- ============================================================

-- Tabela de ingredientes com controle de estoque
CREATE TABLE IF NOT EXISTS ingredientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    quantidade REAL NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
    unidade_medida TEXT NOT NULL CHECK (unidade_medida IN ('kg', 'g', 'ml', 'litro', 'unidade')),
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- Tabela de receitas do restaurante
CREATE TABLE IF NOT EXISTS receitas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    modo_preparo TEXT NOT NULL,
    tempo_preparo INTEGER NOT NULL CHECK (tempo_preparo > 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- Tabela de relacionamento N:N entre receitas e ingredientes
CREATE TABLE IF NOT EXISTS receitas_ingredientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receita_id INTEGER NOT NULL,
    ingrediente_id INTEGER NOT NULL,
    quantidade_necessaria REAL NOT NULL CHECK (quantidade_necessaria > 0),
    unidade_medida TEXT NOT NULL,
    FOREIGN KEY (receita_id) REFERENCES receitas (id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (ingrediente_id) REFERENCES ingredientes (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    UNIQUE (receita_id, ingrediente_id)
);

-- Índices para buscas e filtros em ingredientes e receitas
CREATE INDEX IF NOT EXISTS idx_ingredientes_nome ON ingredientes (nome);
CREATE INDEX IF NOT EXISTS idx_receitas_nome ON receitas (nome);
CREATE INDEX IF NOT EXISTS idx_receitas_ingredientes_receita ON receitas_ingredientes (receita_id);
CREATE INDEX IF NOT EXISTS idx_receitas_ingredientes_ingrediente ON receitas_ingredientes (ingrediente_id);
