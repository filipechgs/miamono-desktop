# Changelog

Todas as mudancas relevantes deste projeto sao documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added

- Empacotamento com `electron-builder` para Windows (NSIS) e Linux (AppImage/tar.gz).
- Script de seed de dados simulados para 2024 e 2025.
- Exportacao aprimorada com media mensal em cenarios com multiplos meses.
- Filtros dinamicos na tela de recebimentos.
- Seletor de ano populado apenas com anos existentes no banco.

### Changed

- CSV de exportacao com BOM UTF-8 para melhor compatibilidade com planilhas.
- Estilos do PDF com destaque pastel para indicadores principais.
- Fluxo de filtros sem botao manual de submissao.

## [1.0.0] - 2026-05-24

### Added

- Estrutura inicial do aplicativo Electron com arquitetura em camadas por dominio.
- Cadastros de servicos e pagadores.
- Fluxo de recebimentos com filtros e exportacao CSV/PDF.
