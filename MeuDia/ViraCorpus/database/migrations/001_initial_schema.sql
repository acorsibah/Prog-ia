-- ====================================================================
-- Esquema Inicial do Banco de Dados - ViraCorpus
-- Objetivo: Gestao logistica de caixas de residuos em Viracopos
-- Regra central: Desacoplamento entre Troca e Destinacao
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Perfis de Acesso de Usuarios
DO $$ BEGIN
    CREATE TYPE perfil_usuario AS ENUM ('GESTAO', 'MOTORISTA', 'CONSULTA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil perfil_usuario NOT NULL DEFAULT 'CONSULTA',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Locais Autorizados para Descarte no Aeroporto
CREATE TABLE IF NOT EXISTS locais_descarte (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_setor VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao_acesso TEXT,
    latitude NUMERIC(10, 8) NOT NULL,
    longitude NUMERIC(11, 8) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tipos e Capacidades de Caixas
DO $$ BEGIN
    CREATE TYPE modelo_caixa AS ENUM ('ROLL_ON', 'POLI', 'PONTUAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS tipos_caixa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(60) NOT NULL,
    modelo modelo_caixa NOT NULL,
    capacidade_m3 NUMERIC(5, 2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. Inventario Individual de Caixas Fisicas
DO $$ BEGIN
    CREATE TYPE status_caixa AS ENUM (
        'DISPONIVEL', 'INSTALADA', 'EM_TRANSITO', 
        'EM_MANUTENCAO', 'INDISPONIVEL', 'GIRO', 'RETIRADA_OPERACAO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS caixas_fisicas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_patrimonio VARCHAR(50) NOT NULL UNIQUE,
    tipo_caixa_id UUID NOT NULL REFERENCES tipos_caixa(id),
    local_atual_id UUID REFERENCES locais_descarte(id),
    status status_caixa NOT NULL DEFAULT 'DISPONIVEL',
    is_provisoria BOOLEAN NOT NULL DEFAULT FALSE,
    observacao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Materiais Aceitos e Orientacoes
CREATE TABLE IF NOT EXISTS materiais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(80) NOT NULL,
    instrucoes_descarte TEXT NOT NULL,
    cor_hex VARCHAR(7) DEFAULT '#6B7280',
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS locais_materiais (
    local_id UUID REFERENCES locais_descarte(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materiais(id) ON DELETE CASCADE,
    PRIMARY KEY (local_id, material_id)
);

-- 6. Programacao de Servicos
DO $$ BEGIN
    CREATE TYPE tipo_servico AS ENUM ('TROCA', 'RETIRADA', 'INSTALACAO', 'DESTINACAO', 'OUTRO');
    CREATE TYPE status_programacao AS ENUM ('PROGRAMADA', 'EM_ANDAMENTO', 'REALIZADA', 'NAO_REALIZADA', 'CANCELADA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS programacoes_servico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_servico tipo_servico NOT NULL,
    local_id UUID NOT NULL REFERENCES locais_descarte(id),
    caixa_prevista_id UUID REFERENCES caixas_fisicas(id),
    motorista_id UUID REFERENCES usuarios(id),
    veiculo_placa VARCHAR(10),
    data_prevista TIMESTAMP WITH TIME ZONE NOT NULL,
    status status_programacao NOT NULL DEFAULT 'PROGRAMADA',
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Eventos Operacionais (Execucao em Campo)
CREATE TABLE IF NOT EXISTS eventos_operacionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    programacao_id UUID REFERENCES programacoes_servico(id),
    tipo_servico tipo_servico NOT NULL,
    local_id UUID NOT NULL REFERENCES locais_descarte(id),
    caixa_retirada_id UUID REFERENCES caixas_fisicas(id),
    caixa_instalada_id UUID REFERENCES caixas_fisicas(id),
    motorista_id UUID NOT NULL REFERENCES usuarios(id),
    veiculo_placa VARCHAR(10) NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observacoes TEXT
);

-- 8. Registros de Destinacao (SEPARADO DO EVENTO OPERACIONAL)
DO $$ BEGIN
    CREATE TYPE status_destinacao AS ENUM ('PENDENTE', 'CONFIRMADA', 'CANCELADA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS registros_destinacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evento_operacional_id UUID REFERENCES eventos_operacionais(id),
    caixa_fisica_id UUID NOT NULL REFERENCES caixas_fisicas(id),
    material_id UUID REFERENCES materiais(id),
    local_gerador_id UUID NOT NULL REFERENCES locais_descarte(id),
    status status_destinacao NOT NULL DEFAULT 'PENDENTE',
    motivo_pendencia TEXT,
    destinadora VARCHAR(120),
    data_expedicao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_confirmacao TIMESTAMP WITH TIME ZONE,
    peso_kg NUMERIC(10, 2),
    mtr_numero VARCHAR(60),
    ticket_cdr VARCHAR(60),
    responsavel_registro_id UUID NOT NULL REFERENCES usuarios(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Anexos e Evidencias Obrigatorias
CREATE TABLE IF NOT EXISTS evidencias_anexos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entidade_tipo VARCHAR(30) NOT NULL, -- 'EVENTO_OPERACIONAL' ou 'DESTINACAO'
    entidade_id UUID NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL, -- 'FOTO_LOCAL', 'TICKET_BALANCA', 'MTR_ASSINADO'
    caminho_arquivo VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Trilha de Auditoria
CREATE TABLE IF NOT EXISTS auditoria_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tabela_nome VARCHAR(60) NOT NULL,
    registro_id UUID NOT NULL,
    acao VARCHAR(10) NOT NULL,
    dados_anteriores JSONB,
    dados_novos JSONB,
    usuario_id UUID REFERENCES usuarios(id),
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

