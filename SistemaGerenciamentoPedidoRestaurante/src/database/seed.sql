-- Dados iniciais de teste para o GastroFlow

-- Mesas
INSERT OR IGNORE INTO mesas (id, numero, capacidade, status) VALUES
(1, 1, 4, 'LIVRE'),
(2, 2, 2, 'OCUPADA'),
(3, 3, 6, 'RESERVADA'),
(4, 4, 4, 'LIVRE'),
(5, 5, 2, 'LIVRE');

-- Itens do Cardápio
INSERT OR IGNORE INTO cardapio (id, codigo, nome, categoria, preco, disponivel) VALUES
(1, 'RIS-01', 'Risoto de Funghi', 'Prato Principal', 58.50, 1),
(2, 'RIS-02', 'Risoto de Camarão', 'Prato Principal', 68.00, 1),
(3, 'SUC-01', 'Suco de Laranja', 'Bebidas', 12.00, 1),
(4, 'SUC-02', 'Suco de Maracujá', 'Bebidas', 14.00, 1),
(5, 'SOB-01', 'Tiramisu', 'Sobremesa', 24.00, 0);
