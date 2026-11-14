-- ============================================================
-- GastroFlow - Schema do Banco de Dados Relacional (SQLite)
-- Banco de dados: restaurante.sqlite
-- ============================================================

-- Ativa o suporte a integridade referencial de chaves estrangeiras
PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- Tabela: cardapio
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cardapio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    preco REAL NOT NULL CHECK (preco >= 0),
    disponivel INTEGER NOT NULL DEFAULT 1 CHECK (disponivel IN (0, 1))
);

-- ------------------------------------------------------------
-- Tabela: mesas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mesas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero INTEGER NOT NULL UNIQUE CHECK (numero > 0),
    capacidade INTEGER NOT NULL CHECK (capacidade > 0),
    status TEXT NOT NULL DEFAULT 'LIVRE' CHECK (status IN ('LIVRE', 'OCUPADA', 'RESERVADA'))
);

-- ------------------------------------------------------------
-- Tabela: pedidos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mesa_id INTEGER NOT NULL,
    data_hora TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    status TEXT NOT NULL DEFAULT 'RECEBIDO' CHECK (status IN ('RECEBIDO', 'PREPARANDO', 'PRONTO', 'ENTREGUE', 'PAGO')),
    valor_total REAL NOT NULL DEFAULT 0.0 CHECK (valor_total >= 0),
    FOREIGN KEY (mesa_id) REFERENCES mesas (id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- Tabela: itens_pedido
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS itens_pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    item_cardapio_id INTEGER NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario REAL NOT NULL CHECK (preco_unitario >= 0),
    observacao TEXT,
    FOREIGN KEY (pedido_id) REFERENCES pedidos (id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (item_cardapio_id) REFERENCES cardapio (id) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ------------------------------------------------------------
-- Índices para otimização de consultas frequentes
-- ------------------------------------------------------------
-- Consultas por categoria e itens ativos no cardápio
CREATE INDEX IF NOT EXISTS idx_cardapio_categoria ON cardapio (categoria);
CREATE INDEX IF NOT EXISTS idx_cardapio_disponivel ON cardapio (disponivel);

-- Filtragem de mesas por status (ex: listar livres para alocação)
CREATE INDEX IF NOT EXISTS idx_mesas_status ON mesas (status);

-- Consultas de pedidos por mesa, status de produção e histórico temporal
CREATE INDEX IF NOT EXISTS idx_pedidos_mesa_id ON pedidos (mesa_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos (status);
CREATE INDEX IF NOT EXISTS idx_pedidos_data_hora ON pedidos (data_hora);

-- Busca de itens por pedido (montagem da comanda) e agregação por produto
CREATE INDEX IF NOT EXISTS idx_itens_pedido_pedido_id ON itens_pedido (pedido_id);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_cardapio_id ON itens_pedido (item_cardapio_id);

-- ------------------------------------------------------------
-- Tabela: ingredientes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ingredientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    quantidade REAL NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
    unidade_medida TEXT NOT NULL CHECK (unidade_medida IN ('kg', 'g', 'ml', 'litro', 'unidade')),
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- ------------------------------------------------------------
-- Tabela: receitas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS receitas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    modo_preparo TEXT NOT NULL,
    tempo_preparo INTEGER NOT NULL CHECK (tempo_preparo > 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- ------------------------------------------------------------
-- Tabela de relacionamento N:N (receitas <-> ingredientes)
-- Um ingrediente pode ser usado em várias receitas;
-- uma receita pode ter vários ingredientes.
-- ------------------------------------------------------------
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
