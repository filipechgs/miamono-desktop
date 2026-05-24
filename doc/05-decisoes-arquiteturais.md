# Decisões Arquiteturais - Sprint 1

Este documento registra as principais decisões técnicas adotadas na base do projeto.

## 1. Stack de Execução

- Runtime principal: Node.js v24.
- Desktop shell: Electron.
- Linguagem: TypeScript nativo sem etapa de compilação dedicada.
- Persistência: SQLite via API nativa `node:sqlite`.

## 2. Organização Arquitetural

- Arquitetura em camadas com separação de responsabilidades:
  - `controller`: coordena entrada e saída dos fluxos.
  - `application`: regras de aplicação/casos de uso.
  - `repository`: contratos de acesso a dados.
  - `model`: estruturas de entidade do domínio.
- Organização por domínios de negócio:
  - `receipts`
  - `services`
  - `payers`
  - `exports`

## 3. Banco de Dados

- Modelagem em inglês e snake_case.
- Tabelas iniciais:
  - `services`
  - `payers`
  - `receipts`
- Migração inicial em SQL versionado:
  - `src/infrastructure/database/migrations/001_initial_schema.sql`
- Índices criados para suportar filtros da listagem de recebimentos.

## 4. Configuração Compartilhada

- Configuração centralizada em `src/shared/config/environment.ts`.
- Diretório de dados local em `data/` na raiz do projeto.
- Banco SQLite em `data/miamono.sqlite`.

## 5. Padrão de Tratamento de Erros

- Erro base da aplicação: `AppError`.
- Erros especializados:
  - `DomainError` para regras de negócio e validação.
  - `TechnicalError` para infraestrutura/configuração.
- Catálogo de códigos em `src/shared/errors/error-codes.ts`.

## 6. Interface Inicial

- UI inicial em PT-BR para manter aderência às diretrizes do projeto.
- Tela de bootstrap amigável para validar runtime e estrutura.

## 7. Trade-offs da Sprint 1

- O foco foi estrutural, sem implementar ainda fluxos completos de CRUD.
- O módulo de exportação foi deixado como stub para Sprint 4.
- O processo de build distribuível para Windows/Linux será tratado na Sprint 5.
