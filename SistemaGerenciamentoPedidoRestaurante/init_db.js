// Script para inicializacao e consulta do banco SQLite
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const dbDir = path.resolve('src', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.resolve(dbDir, 'restaurante.sqlite');
const schemaSql = fs.readFileSync('schema.sql', 'utf8');

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');
db.exec(schemaSql);

// Inicializacao das mesas caso tabela esteja vazia
const countMesas = db.prepare('SELECT COUNT(*) as c FROM mesas').get();
if (countMesas.c === 0) {
  const insertMesa = db.prepare('INSERT INTO mesas (numero, capacidade, status) VALUES (?, ?, ?)');
  insertMesa.run(1, 4, 'LIVRE');
  insertMesa.run(2, 2, 'OCUPADA');
  insertMesa.run(3, 6, 'RESERVADA');
  insertMesa.run(4, 4, 'LIVRE');
  insertMesa.run(5, 2, 'LIVRE');
}

// Inicializacao do cardapio caso tabela esteja vazia
const countCardapio = db.prepare('SELECT COUNT(*) as c FROM cardapio').get();
if (countCardapio.c === 0) {
  const insertItem = db.prepare('INSERT INTO cardapio (codigo, nome, categoria, preco, disponivel) VALUES (?, ?, ?, ?, ?)');
  insertItem.run('RIS-01', 'Risoto de Funghi', 'Prato Principal', 58.50, 1);
  insertItem.run('RIS-02', 'Risoto de Camarão', 'Prato Principal', 68.00, 1);
  insertItem.run('SUC-01', 'Suco de Laranja', 'Bebidas', 12.00, 1);
  insertItem.run('SUC-02', 'Suco de Maracujá', 'Bebidas', 14.00, 1);
  insertItem.run('SOB-01', 'Tiramisu', 'Sobremesa', 24.00, 0);
}

// Consulta dos dados solicitados pelo Agente Maitre
const mesa4 = db.prepare('SELECT * FROM mesas WHERE numero = 4').get();
const itemRisoto = db.prepare("SELECT * FROM cardapio WHERE codigo = 'RIS-01'").get();
const itemSuco = db.prepare("SELECT * FROM cardapio WHERE codigo = 'SUC-02'").get();

console.log('RESULTADO_MESA:', JSON.stringify(mesa4));
console.log('RESULTADO_RISOTO:', JSON.stringify(itemRisoto));
console.log('RESULTADO_SUCO:', JSON.stringify(itemSuco));

db.close();
