# ViraCorpus - Logística de Resíduos em Viracopos

Sistema web e móvel para consulta de pontos de descarte e gestão da logística de caixas estacionárias de resíduos no Aeroporto Internacional de Viracopos (Campinas/SP).

---

## 🚀 Diferencial de Negócio: Desacoplamento entre Troca e Destinação

No modelo operacional de Viracopos, a **Troca** de uma caixa em campo (ponto de descarte) não significa que o resíduo foi descartado/destinado no mesmo momento:
1. Uma **caixa de giro** pode ser retirada cheia e permanecer no caminhão ou em área de triagem temporária.
2. A **Destinação** é um evento posterior que exige evidências documentais obrigatórias:
   - **MTR** (Manifesto de Transporte de Resíduos);
   - **Ticket de Balança / CDR** (Comprovante de Destinação de Resíduos);
   - **Peso Líquido Aferido** em balança rodoviária.
3. O ViraCorpus garante que **nenhuma carga seja duplicada em relatórios** e que uma troca física gere automaticamente um registro de destinação com status `PENDENTE` até a confirmação pela Gestão.

---

## 📁 Estrutura do Projeto

```text
ViraCorpus/
├── database/                # Scripts de modelagem e dados autorizados
│   ├── migrations/          # 001_initial_schema.sql (DDL completo PostgreSQL)
│   └── seeds/               # 001_viracopos_seed.sql (Carga de dados de Viracopos)
├── backend/                 # API REST em Node.js com TypeScript e Express
│   ├── src/
│   │   ├── models/          # Tipos e interfaces de domínio
│   │   ├── repositories/    # Persistência (Memória / PostgreSQL)
│   │   ├── services/        # Regras de negócio (Troca, Destinação, Auditoria)
│   │   ├── controllers/     # Controladores HTTP
│   │   ├── routes/          # Definição dos endpoints REST
│   │   └── server.ts        # Ponto de entrada do servidor
│   └── package.json
└── frontend/                # Interface React + TypeScript + Vite + Tailwind + Leaflet
    ├── src/
    │   ├── components/      # Mapa interativo, Cards, Filtros e Modais operacionais
    │   ├── services/        # Comunicação com a API
    │   └── App.tsx          # Tela principal mobile-first
    └── package.json
```

---

## 🛠️ Como Executar o Projeto

### 1. Back-end
```bash
cd backend
npm install
npm test       # Executa a suíte de testes de regras de negócio
npm run dev    # Inicia o servidor em http://localhost:3001
```

### 2. Front-end
```bash
cd frontend
npm install
npm run dev    # Inicia a interface em http://localhost:3000
```

---

## 🧪 Testes Automatizados

O back-end possui testes automatizados que validam:
- Bloqueio de operação para perfil `CONSULTA`.
- Registro de troca com geração de destinação `PENDENTE`.
- Rejeição de confirmação de destinação sem MTR ou Ticket de balança.
- Homologação de destinação e liberação da caixa de giro para o status `DISPONIVEL`.

