# Processo de Release

## Convencao de versionamento

O projeto usa Semantic Versioning (`MAJOR.MINOR.PATCH`).

- `MAJOR`: mudancas incompativeis.
- `MINOR`: novas funcionalidades compativeis.
- `PATCH`: correcoes sem quebra de compatibilidade.

## Fluxo sugerido

1. Atualizar `CHANGELOG.md` em `Unreleased`.
2. Rodar validacoes locais:
   - `npm run test:regression`
   - `npm run package:dir`
3. Definir nova versao no `package.json`.
4. Criar commit de release (`chore: release x.y.z`).
5. Criar tag Git anotada (`vX.Y.Z`).
6. Publicar release no GitHub usando o conteudo do changelog.

## Artefatos esperados

- Windows: instalador NSIS (`.exe`).
- Linux: AppImage e `tar.gz`.

## Publicacao automatizada

O workflow em `.github/workflows/release-build.yml` gera artefatos para Windows e Linux em tags `v*` e em execucao manual.

## Rollback

Se a release falhar:

1. Corrigir no branch principal.
2. Criar nova versao patch.
3. Publicar nova tag/release.
