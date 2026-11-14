// Servidor HTTP nativo do Node.js com suporte a download mobile e PWA
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORTA = 3000;
const TIPOS_MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.apk': 'application/vnd.android.package-archive'
};

// Trata o download da planilha para celulares via resposta direta HTTP
function tratarDownloadPlanilha(req, res) {
  let corpo = '';
  req.on('data', (pedaco) => { corpo += pedaco; });
  req.on('end', () => {
    let csv = corpo;
    if (corpo.startsWith('conteudo=')) {
      csv = decodeURIComponent(corpo.substring(9).replace(/\+/g, ' '));
    }
    const data = new Date().toISOString().split('T')[0];
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ViraCorpus_Agenda_${data}.csv"`
    });
    res.end(csv);
  });
}

// Funcao para tratar e responder cada requisicao de arquivo
function tratarRequisicao(req, res) {
  const urlLimpa = req.url.split('?')[0];
  if (urlLimpa === '/api/download-planilha') {
    tratarDownloadPlanilha(req, res);
    return;
  }
  const arquivo = urlLimpa === '/' ? '/index.html' : urlLimpa;
  const caminho = path.join(__dirname, arquivo);

  fs.readFile(caminho, (erro, conteudo) => {
    if (erro) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Arquivo não encontrado');
      return;
    }
    const ext = path.extname(caminho);
    res.writeHead(200, { 'Content-Type': TIPOS_MIME[ext] || 'application/octet-stream' });
    res.end(conteudo);
  });
}

// Inicializa o servidor HTTP na porta definida
const servidor = http.createServer(tratarRequisicao);
servidor.listen(PORTA, () => {
  console.log(`Servidor ViraCorpus rodando em http://localhost:${PORTA}`);
});
