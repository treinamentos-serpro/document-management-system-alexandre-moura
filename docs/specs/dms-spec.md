# Especificação - Document Management System (DMS)

## 1. Objetivo

Entregar um sistema web que permite enviar, listar e baixar documentos, com gestão simples por usuário e armazenamento estritamente local.

## 2. Escopo

### Dentro do escopo

- Upload de documentos (multipart/form-data via `multer` com `diskStorage`)
- Listagem dos documentos do próprio usuário
- Download de documentos pelo identificador
- Gestão simples por usuário (cada documento tem um dono)
- Interface React para envio, listagem e download
- Endpoint de verificação de saúde (`GET /health`, já existente)

### Fora do escopo

- Armazenamento externo ou em nuvem
- Versionamento de documentos
- Autenticação completa (login, senha, tokens)
- Exclusão, edição de metadados e compartilhamento entre usuários
- Banco de dados (metadados permanecem em memória)
- Pré-visualização de documentos
- TypeScript

## 3. Requisitos funcionais

| ID    | Requisito                                                                                 |
| ----- | ----------------------------------------------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento, associado ao seu identificador                        |
| RF-02 | O usuário pode listar os documentos que enviou, do mais recente ao mais antigo            |
| RF-03 | O usuário pode baixar um documento pelo identificador, somente se for o dono              |
| RF-04 | O sistema rejeita envios sem arquivo ou acima do limite de tamanho, com mensagem clara    |
| RF-05 | O sistema rejeita requisições sem identificação de usuário (header `X-User-Id`)           |
| RF-06 | O download preserva o nome original e o tipo MIME do arquivo                              |
| RF-07 | A interface exibe formulário de envio, lista de documentos e feedback de sucesso ou erro |

## 4. Requisitos não funcionais

| ID      | Requisito                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------- |
| RNF-01  | Arquivos gravados no filesystem local, na pasta `backend/storage`, via `multer` `diskStorage`      |
| RNF-02  | Metadados mantidos em memória nesta fase                                                           |
| RNF-03  | Configuração via variáveis de ambiente, com valores padrão (12-Factor)                             |
| RNF-04  | Arquivos gravados com nome gerado pelo sistema (UUID), nunca com o nome enviado, evitando path traversal |
| RNF-05  | Erros tratados nos limites do sistema (entrada HTTP, leitura e escrita de arquivos)                |
| RNF-06  | Backend em CommonJS com testes via `node:test`; frontend em ESM com React e Vite                   |
| RNF-07  | Não utilizar provedores de armazenamento externos                                                  |
| RNF-08  | Não quebrar o endpoint `GET /health`                                                               |

## 5. Modelo de dados (metadados do documento)

| Campo        | Tipo   | Descrição                                                              |
| ------------ | ------ | ---------------------------------------------------------------------- |
| id           | string | Identificador único do documento (igual ao `storedName`)               |
| originalName | string | Nome original do arquivo enviado                                       |
| storedName   | string | Nome do arquivo no disco (UUID). Interno, não exposto na API           |
| mimeType     | string | Tipo MIME informado no envio (ex.: `application/pdf`)                  |
| size         | number | Tamanho em bytes                                                       |
| uploadedAt   | string | Data/hora do upload (ISO 8601)                                         |
| owner        | string | Identificador do usuário dono (valor de `X-User-Id`, sem espaços nas bordas) |

Regras:
- Os metadados ficam em um `Map` indexado por `id` no repositório.
- Ao reiniciar o servidor, os metadados são perdidos; os arquivos permanecem em disco (limitação aceita nesta fase).

## 6. Contratos de API

Base: backend em `http://localhost:3000`. O frontend acessa os mesmos caminhos com o prefixo `/api`, via proxy do Vite, que remove o prefixo.

Header comum a todos os endpoints de documentos:
- `X-User-Id: <string não vazia>` (obrigatório)

Formato de erro:

```json
{ "error": "mensagem em português" }
```

### GET /health

- Resposta `200`: `{ "status": "ok" }`

### POST /upload

- Entrada: `multipart/form-data`, campo `file` com um único arquivo
- Resposta `201`: metadados do documento criado (sem `storedName`)

```json
{
  "id": "3f2c1a9e-8b7d-4c6e-9a1b-2d3e4f5a6b7c",
  "originalName": "contrato.pdf",
  "mimeType": "application/pdf",
  "size": 20480,
  "uploadedAt": "2026-10-26T14:30:00.000Z",
  "owner": "user-1"
}
```

- Erros:
  - `400`: campo `file` ausente ou inesperado
  - `401`: header `X-User-Id` ausente ou vazio
  - `413`: arquivo acima de `MAX_FILE_SIZE_BYTES`
  - `500`: falha ao gravar o arquivo

### GET /documents

- Resposta `200`: array com os metadados dos documentos do usuário, ordenado por `uploadedAt` decrescente. Lista vazia retorna `[]`.
- Erros: `401` (sem `X-User-Id`)

### GET /documents/:id/download

- Resposta `200`: conteúdo binário do arquivo
  - `Content-Type`: `mimeType` do documento
  - `Content-Disposition: attachment; filename="<originalName>"` (com encoding quando necessário)
- Erros:
  - `401`: sem `X-User-Id`
  - `404`: documento inexistente ou pertencente a outro usuário
  - `500`: arquivo ausente no disco ou falha de leitura

## 7. Decisões arquiteturais

### Camadas do backend (`backend/src`)

| Camada         | Responsabilidade                                                                                   | Arquivo previsto                     |
| -------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------ |
| routes/        | Definir endpoints e aplicar `requireOwner` e `upload.single('file')`; delegar ao controller        | `routes/documentRoutes.js`           |
| controllers/   | Ler header e arquivo, validar entrada básica, montar resposta HTTP e mapear erros de domínio       | `controllers/documentController.js`  |
| services/      | Regras de negócio: criar documento, listar por dono, obter para download por dono                  | `services/documentService.js`        |
| repositories/  | Persistência: `Map` de metadados e engine `diskStorage` do `multer`                                | `repositories/documentRepository.js` |
| composição     | Criação das dependências, middleware de erro e configuração do `multer`                            | `src/createApp.js`                   |
| config         | Leitura de variáveis de ambiente com valores padrão                                                | `src/config.js`                      |

Fluxo de dependência: `routes -> controllers -> services -> repositories`. Camadas internas não importam Express nem `multer`.

Composição: `createApp.js` cria o repositório, o serviço, o controller, as rotas e o `multer`, injetando as dependências (sem container de DI). `app.js` apenas carrega a configuração, cria o app e inicia o servidor.

Tratamento de erros: erros de domínio (`DocumentNotFoundError`) são mapeados para status HTTP no controller; erros do `multer` (ex.: `LIMIT_FILE_SIZE`) e de JSON são mapeados no middleware de erro de `createApp.js`.

### Configuração (variáveis de ambiente)

| Variável              | Padrão                   | Uso                              |
| --------------------- | ------------------------ | -------------------------------- |
| PORT                  | 3000                     | Porta do backend                 |
| STORAGE_DIR           | `backend/storage`        | Pasta de gravação dos arquivos   |
| MAX_FILE_SIZE_BYTES   | 10485760 (10 MB)         | Limite de tamanho por arquivo    |

### Frontend

- Componentes funcionais com React Hooks
- Estrutura: `components/` (`UploadForm`, `DocumentList`), `pages/` (`DocumentsPage`), `services/` (`documentService.js` com `fetch` para `/api`)
- Identificador do usuário definido na tela e enviado em `X-User-Id`

### Restrições

- Armazenamento estritamente local (`multer` `diskStorage`)
- JavaScript puro, sem TypeScript
- Preferir dependências já presentes no `package.json` (sem `supertest`; testes de integração usam `fetch` nativo e `listen` em porta livre)

## 8. Plano de execução

Roadmap em etapas, na ordem de implementação.

**Etapa 0: Aprovação da especificação**
- Revisar este documento e fechar as premissas da seção 7.

**Etapa 1: Configuração (backend)**
- `src/config.js` com as variáveis da seção 7.
- Testes: valores padrão e sobrescrita por variável de ambiente.
- Depende da Etapa 0.

**Etapa 2: Repositório (backend)**
- `documentRepository.js`: `Map` de metadados, engine `diskStorage` do `multer`, criação de `STORAGE_DIR`, caminho do arquivo.
- Testes de salvar, buscar por id e filtrar por dono.
- Depende da Etapa 1.

**Etapa 3: Serviço (backend)**
- `documentService.js`: criar, listar por dono e obter para download (com verificação de dono).
- Testes unitários com repositório fake.
- Depende da Etapa 2.

**Etapa 4: Controller, rotas e erros (backend)**
- `documentController.js`, `documentRoutes.js`, `createApp.js` com middleware de erro, `app.js` ajustado.
- Testes de integração com `node:test` cobrindo os status da seção 6.
- Depende da Etapa 3.

**Etapa 5: Frontend**
- `services/documentService.js` (chamadas `fetch` em `/api`), `UploadForm`, `DocumentList`, `DocumentsPage`, `App.jsx`.
- O proxy `/api` do `vite.config.js` já existe.
- Depende do contrato fechado na seção 6.

**Etapa 6: Integração e validação**
- Fluxo completo: enviar, listar, baixar; isolamento entre usuários; limite de tamanho.
- Depende das Etapas 4 e 5.

**Etapa 7: Documentação**
- Atualizar `README.md` com instruções de execução e variáveis de ambiente.
- Depende da Etapa 6.

## 9. Critérios de aceite

- Todos os requisitos RF-01 a RF-07 atendidos conforme a seção 3.
- Contratos da seção 6 respeitados, incluindo status e formato de erro.
- `npm test` no backend passa sem falhas.
- `GET /health` continua respondendo `200`.
- Nenhum arquivo é gravado fora de `STORAGE_DIR`.
