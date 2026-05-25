# Guia de Contribuicao

Obrigado por considerar contribuir com o Miamono Desktop.

## Requisitos

- Node.js 24+
- npm 10+
- Python 3 (com launcher `py` no Windows para o comando de seed)

## Fluxo de desenvolvimento

1. Crie um branch a partir de `main`.
2. Instale dependencias com `npm install`.
3. Rode `npm run seed` para popular dados de desenvolvimento.
4. Execute `npm run build` antes de abrir pull request.
5. Atualize documentacao quando houver impacto funcional ou tecnico.

## Padroes de commit

Este repositorio usa mensagens de commit no formato convencional:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`
- `refactor: ...`
- `test: ...`

## Checklist de pull request

- Mudanca implementada e validada localmente.
- Build local sem erros (`npm run build`).
- Seed/testes de regressao executados (`npm run test:regression`).
- Arquivos de documentacao atualizados quando necessario.
- Mudancas sem segredos/credenciais.

## Reporte de bugs

Ao abrir uma issue, inclua:

- Plataforma (Windows/Linux)
- Versao do app
- Passos para reproduzir
- Resultado esperado e resultado atual
- Logs/screenshots, se possivel
