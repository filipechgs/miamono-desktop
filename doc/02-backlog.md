# Backlog do Projeto

Backlog operacional do Miamono Desktop organizado por sprint.

## Épicos

- E01: Fundação do projeto e arquitetura em camadas (MVC + domínios).
- E02: Cadastro e gestão de serviços e pagadores.
- E03: Cadastro e listagem de recebimentos com filtros avançados.
- E04: Exportação de relatórios em CSV e PDF.
- E05: Empacotamento e distribuição para Windows e Linux.

## Sprint 1 - Fundação técnica e arquitetura

### Itens de backlog da sprint

- BL-001 Estruturar projeto Electron + Node.js v24 + TypeScript nativo
- BL-002 Definir estrutura de pastas por domínios e camadas MVC
- BL-003 Implementar conexão SQLite com API nativa do Node v24
- BL-004 Criar migrations iniciais de services, payers e receipts

### Tarefas detalhadas

- Criar estrutura base Electron com Node.js v24 e TypeScript nativo
- Definir arquitetura em camadas (view, controller, service/use_case, repository)
- Definir estrutura por domínios: receipts, services, payers, exports
- Configurar módulo de infraestrutura para acesso ao SQLite com API nativa
- Habilitar foreign_keys no SQLite e política de inicialização do banco
- Criar migrations iniciais para tabelas services, payers e receipts
- Garantir nomenclatura de tabelas e colunas em inglês e snake_case
- Criar camada de configuração comum para ambiente de desenvolvimento
- Definir padrão de tratamento de erro técnico e de domínio
- Documentar decisões arquiteturais principais

## Sprint 2 - Cadastros mestres com normalização

### Itens de backlog da sprint

- BL-005 Implementar CRUD de serviços
- BL-006 Implementar CRUD de pagadores
- BL-011 Implementar validações de formulário e regras de negócio
- BL-015 Implementar testes unitários para domínio de recebimentos

### Tarefas detalhadas

- Implementar casos de uso de criação, atualização, listagem e inativação de services
- Implementar casos de uso de criação, atualização, listagem e inativação de payers
- Criar telas de cadastro e listagem para serviços e pagadores
- Aplicar normalização de nomes na camada de domínio antes de persistir
- Implementar regra de capitalização com artigos e preposições em lowercase
- Cobrir normalização com testes unitários (casos simples e compostos)
- Validar unicidade de service_name e payer_full_name com mensagens claras
- Garantir que atualizações mantenham a mesma regra de normalização
- Implementar feedback de erro de validação na interface

## Sprint 3 - Fluxo principal de recebimentos

### Itens de backlog da sprint

- BL-007 Implementar cadastro de recebimento
- BL-008 Implementar listagem de recebimentos em tabela
- BL-009 Implementar filtro por mês e ano (obrigatório)
- BL-010 Implementar filtros por data, serviço, pagador e nota fiscal
- BL-016 Implementar testes de integração de repositórios SQLite

### Tarefas detalhadas

- Implementar cadastro de receipts com validações de data, valor e relacionamentos
- Implementar listagem tabular de receipts
- Implementar filtro obrigatório por mês e ano
- Implementar filtros adicionais por data, serviço, pagador e has_invoice
- Criar consultas otimizadas com uso dos índices recomendados
- Implementar paginação simples ou estratégia de carregamento eficiente na listagem
- Exibir totais básicos da listagem filtrada (quantidade e soma de valores)
- Implementar tratamento de estado vazio e mensagens de erro amigáveis
- Criar testes de integração dos repositórios para consultas filtradas

## Sprint 4 - Exportações e usabilidade da operação

### Itens de backlog da sprint

- BL-012 Implementar exportação da listagem para CSV
- BL-013 Implementar exportação da listagem para PDF com tabela
- BL-014 Melhorar UX da tela de filtros e listagem

### Tarefas detalhadas

- Implementar exportação da listagem filtrada para CSV
- Implementar exportação da listagem filtrada para PDF com tabela estruturada
- Garantir que exportações respeitem exatamente os filtros ativos
- Incluir cabeçalho com período e parâmetros aplicados no relatório
- Incluir totalização de valor no final da exportação
- Padronizar formatação de moeda e data nos arquivos exportados
- Melhorar UX da tela de filtros e listagem para reduzir cliques
- Adicionar confirmações e mensagens de sucesso/erro na exportação
- Cobrir cenários sem resultados e com volume maior de registros

## Sprint 5 - Empacotamento, distribuição e preparação open source

### Itens de backlog da sprint

- BL-017 Configurar build/packaging para Windows
- BL-018 Configurar build/packaging para Linux
- BL-019 Configurar pipeline de release open source
- BL-020 Definir licença e diretrizes de contribuição

### Tarefas detalhadas

- Configurar build e packaging para instalador Windows
- Configurar build e packaging para executável Linux
- Validar processo de geração de artefatos em ambiente limpo
- Definir convenção de versionamento para releases
- Criar processo de release com changelog e publicação de artefatos
- Definir licença do projeto e diretrizes de contribuição
- Revisar README com instruções de download e instalação por sistema
- Garantir checklist final de qualidade antes de release
- Executar bateria final de testes funcionais de regressão

## Critérios de Pronto (Definition of Done)

- Código implementado seguindo padrão MVC e organização por domínios.
- Testes mínimos da feature executando com sucesso.
- Validações de entrada e tratamento de erro implementados.
- Documentação atualizada quando houver impacto funcional/técnico.
- Build local sem erros para plataforma-alvo.

## Marcos Recomendados

- M1: Base técnica pronta (arquitetura + banco + cadastros básicos).
- M2: Fluxo principal completo (cadastro e filtros de recebimentos).
- M3: Exportações CSV/PDF concluídas.
- M4: Empacotamento Windows/Linux e preparação de release open source.
