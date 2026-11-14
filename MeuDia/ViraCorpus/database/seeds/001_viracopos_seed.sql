-- ====================================================================
-- Carga Inicial de Dados de Exemplo - Viracopos (ViraCorpus)
-- Marcados explicitamente como dados de teste e homologacao
-- ====================================================================

-- 1. Usuarios Iniciais (Senha padrao de teste com hash bcrypt)
INSERT INTO usuarios (id, nome, email, senha_hash, perfil) VALUES
('a0000000-0000-0000-0000-000000000001', 'Gestor de Sustentabilidade', 'gestao@viracorpus.com.br', '$2b$10$wEkgmXFm7yM46e3uWfZpReF2h16rPj0yL7Q9iMh29l7q9rP0sI1lO', 'GESTAO'),
('a0000000-0000-0000-0000-000000000002', 'Carlos Motorista Operacional', 'motorista@viracorpus.com.br', '$2b$10$wEkgmXFm7yM46e3uWfZpReF2h16rPj0yL7Q9iMh29l7q9rP0sI1lO', 'MOTORISTA'),
('a0000000-0000-0000-0000-000000000003', 'Fiscal de Patio Consulta', 'fiscal@viracorpus.com.br', '$2b$10$wEkgmXFm7yM46e3uWfZpReF2h16rPj0yL7Q9iMh29l7q9rP0sI1lO', 'CONSULTA')
ON CONFLICT (email) DO NOTHING;

-- 2. Locais Autorizados no Aeroporto de Viracopos (Coordenadas reais de referencia)
INSERT INTO locais_descarte (id, codigo_setor, nome, descricao_acesso, latitude, longitude) VALUES
('b0000000-0000-0000-0000-000000000001', 'TECA-CARGA-01', 'Terminal de Cargas - Doca 04', 'Acesso lateral pelo portao P4 - exigido cracha verde', -23.00742000, -47.13456000),
('b0000000-0000-0000-0000-000000000002', 'HANGAR-MANUT-02', 'Hangar de Manutencao de Aeronaves', 'Area restrita de pista, proximo ao patio de manobras', -23.01124000, -47.13891000),
('b0000000-0000-0000-0000-000000000003', 'TPS1-EMBARQUE-03', 'Terminal de Passageiros 1 - Doca Tecnica', 'Acesso pela via de servico inferior do terminal', -23.00481000, -47.14023000),
('b0000000-0000-0000-0000-000000000004', 'OBRA-PISTA-NOVA-04', 'Canteiro de Obras - Expansao Pista', 'Acesso pelo anel viario perimetral sul', -23.01563000, -47.14321000)
ON CONFLICT (codigo_setor) DO NOTHING;

-- 3. Tipos e Capacidades Padronizadas
INSERT INTO tipos_caixa (id, nome, modelo, capacidade_m3) VALUES
('c0000000-0000-0000-0000-000000000001', 'Roll-on 40m3', 'ROLL_ON', 40.00),
('c0000000-0000-0000-0000-000000000002', 'Roll-on 26m3', 'ROLL_ON', 26.00),
('c0000000-0000-0000-0000-000000000003', 'Poli 15m3', 'POLI', 15.00),
('c0000000-0000-0000-0000-000000000004', 'Poli 5m3', 'POLI', 5.00)
ON CONFLICT DO NOTHING;

-- 4. Materiais
INSERT INTO materiais (id, nome, instrucoes_descarte, cor_hex) VALUES
('d0000000-0000-0000-0000-000000000001', 'Madeira', 'Apenas pallets inteiros ou cortados. Proibido contaminantes quimicos.', '#8B5A2B'),
('d0000000-0000-0000-0000-000000000002', 'Papelao', 'Caixas abertas e desmontadas para compactacao otimizada.', '#3B82F6'),
('d0000000-0000-0000-0000-000000000003', 'Plastico Filme', 'Filme stretch limpo sem mistura com residuos organicos.', '#10B981'),
('d0000000-0000-0000-0000-000000000004', 'Sucata Metalica', 'Pecas de aco e ferro sem residuos inflamaveis.', '#64748B'),
('d0000000-0000-0000-0000-000000000005', 'Entulho de Construcao', 'Concreto, argamassa e ceramica sem gesso ou amianto.', '#F59E0B')
ON CONFLICT DO NOTHING;

-- 5. Associacao de Locais a Materiais Aceitos
INSERT INTO locais_materiais (local_id, material_id) VALUES
('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001'), -- TECA aceita Madeira
('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002'), -- TECA aceita Papelao
('b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004'), -- Hangar aceita Sucata
('b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002'), -- TPS1 aceita Papelao
('b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003'), -- TPS1 aceita Plastico
('b0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005')  -- Obras aceita Entulho
ON CONFLICT DO NOTHING;

-- 6. Caixas Fisicas no Inventario (Instaladas, Disponiveis e Caixas de Giro)
INSERT INTO caixas_fisicas (id, codigo_patrimonio, tipo_caixa_id, local_atual_id, status) VALUES
('e0000000-0000-0000-0000-000000000001', 'CX-40-001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'INSTALADA'),
('e0000000-0000-0000-0000-000000000002', 'CX-05-002', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'INSTALADA'),
('e0000000-0000-0000-0000-000000000003', 'CX-26-003', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003', 'INSTALADA'),
('e0000000-0000-0000-0000-000000000004', 'CX-15-004', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000004', 'INSTALADA'),
('e0000000-0000-0000-0000-000000000005', 'CX-40-GIRO-01', 'c0000000-0000-0000-0000-000000000001', NULL, 'DISPONIVEL'),
('e0000000-0000-0000-0000-000000000006', 'CX-05-GIRO-02', 'c0000000-0000-0000-0000-000000000004', NULL, 'GIRO')
ON CONFLICT (codigo_patrimonio) DO NOTHING;

