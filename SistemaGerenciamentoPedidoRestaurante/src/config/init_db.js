// Script para inicializacao e consulta do banco SQLite via Node.js
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const dbPath = path.resolve(__dirname, '..', 'database', 'restaurante.sqlite');
const schemaPath = path.resolve(__dirname, 'schema.sql');

function inicializarBanco() {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec(schemaSql);
  return db;
}

function popularDadosIniciais(db) {
  // Insere mesas de teste caso a tabela esteja vazia
  const totalMesas = db.prepare('SELECT COUNT(*) as count FROM mesas').get();
  if (totalMesas.count === 0) {
    const stmtMesa = db.prepare(
      'INSERT INTO mesas (numero, capacidade, status) VALUES (?, ?, ?)'
    );
    stmtMesa.run(1, 4, 'LIVRE');
    stmtMesa.run(2, 2, 'OCUPADA');
    stmtMesa.run(3, 6, 'RESERVADA');
    stmtMesa.run(4, 4, 'LIVRE');
    stmtMesa.run(5, 2, 'LIVRE');
  }

  // Insere itens no cardapio de teste caso esteja vazio
  const totalCardapio = db.prepare('SELECT COUNT(*) as count FROM cardapio').get();
  if (totalCardapio.count === 0) {
    const stmtCardapio = db.prepare(
      'INSERT INTO cardapio (codigo, nome, categoria, preco, disponivel) VALUES (?, ?, ?, ?, ?)'
    );
    stmtCardapio.run('RIS-01', 'Risoto de Funghi', 'Prato Principal', 58.50, 1);
    stmtCardapio.run('RIS-02', 'Risoto de Camarão', 'Prato Principal', 68.00, 1);
    stmtCardapio.run('SUC-01', 'Suco de Laranja', 'Bebidas', 12.00, 1);
    stmtCardapio.run('SUC-02', 'Suco de Maracujá', 'Bebidas', 14.00, 1);
    stmtCardapio.run('SOB-01', 'Tiramisu', 'Sobremesa', 24.00, 0);
  }
}

const db = inicializarBanco();
popularDadosIniciais(db);

const mesas = db.prepare('SELECT * FROM mesas').all();
console.log('MESAS:', JSON.stringify(mesas, null, 2));

const cardapio = db.prepare('SELECT * FROM cardapio').all();
console.log('CARDAPIO:', JSON.stringify(cardapio, null, 2));

db.close();
