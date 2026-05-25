# Planejamento de Sprints

Este documento organiza a execução do projeto em sprints incrementais, com tarefas detalhadas e alinhamento ao backlog já definido.

## Premissas

- Timebox sugerido: 2 semanas por sprint.
- Prioridade: entregar valor funcional cedo, sem abrir mão da base técnica.
- Arquitetura obrigatória: MVC em camadas com organização por domínios.
- Banco de dados: modelagem em inglês e nomes em snake_case.
- Fora do escopo inicial: autenticação e gestão de usuários.

## Sprint 1 - Fundação técnica e arquitetura

Objetivo:

- Deixar a base do projeto pronta para desenvolvimento seguro e escalável.

Tarefas detalhadas:

- [x] Criar estrutura base Electron com Node.js v24 e TypeScript nativo.
- [x] Definir arquitetura em camadas (view, controller, service/use_case, repository).
- [x] Definir estrutura por domínios: receipts, services, payers, exports.
- [x] Configurar módulo de infraestrutura para acesso ao SQLite com API nativa.
- [x] Habilitar foreign_keys no SQLite e política de inicialização do banco.
- [x] Criar migrations iniciais para tabelas services, payers e receipts.
- [x] Garantir nomenclatura de tabelas e colunas em inglês e snake_case.
- [x] Criar camada de configuração comum para ambiente de desenvolvimento.
- [x] Definir padrão de tratamento de erro técnico e de domínio.
- [x] Documentar decisões arquiteturais principais.

Itens de backlog relacionados:

- BL-001, BL-002, BL-003, BL-004

Critérios de aceite da sprint:

- Aplicação abre em ambiente local sem erro de bootstrap.
- Banco inicializa automaticamente com esquema base consistente.
- Estrutura de pastas por domínios e camadas está publicada.
- Migrations executam sem falha em instalação limpa.

## Sprint 2 - Cadastros mestres com normalização

Objetivo:

- Entregar gestão de serviços e pagadores com consistência de dados.

Tarefas detalhadas:

- [x] Implementar casos de uso de criação, atualização, listagem e inativação de services.
- [x] Implementar casos de uso de criação, atualização, listagem e inativação de payers.
- [x] Criar telas de cadastro e listagem para serviços e pagadores.
- [x] Aplicar normalização de nomes na camada de domínio antes de persistir.
- [x] Implementar regra de capitalização com artigos e preposições em lowercase.
- [x] Cobrir normalização com testes unitários (casos simples e compostos).
- [x] Validar unicidade de service_name e payer_full_name com mensagens claras.
- [x] Garantir que atualizações mantenham a mesma regra de normalização.
- [x] Implementar feedback de erro de validação na interface.

Itens de backlog relacionados:

- BL-005, BL-006, BL-011, BL-015

Critérios de aceite da sprint:

- Usuário consegue manter serviços e pagadores sem duplicidade indevida.
- Nomes persistidos seguem padrão de normalização definido.
- Testes de normalização passam em pipeline local.

## Sprint 3 - Fluxo principal de recebimentos

Objetivo:

- Entregar o ciclo central de cadastro e consulta de recebimentos.

Tarefas detalhadas:

- [x] Implementar cadastro de receipts com validações de data, valor e relacionamentos.
- [x] Implementar listagem tabular de receipts.
- [x] Implementar filtro obrigatório por mês e ano.
- [x] Implementar filtros adicionais por data, serviço, pagador e has_invoice.
- [x] Criar consultas otimizadas com uso dos índices recomendados.
- [x] Implementar paginação simples ou estratégia de carregamento eficiente na listagem.
- [x] Exibir totais básicos da listagem filtrada (quantidade e soma de valores).
- [x] Implementar tratamento de estado vazio e mensagens de erro amigáveis.
- [x] Criar testes de integração dos repositórios para consultas filtradas.

Itens de backlog relacionados:

- BL-007, BL-008, BL-009, BL-010, BL-016

Critérios de aceite da sprint:

- Fluxo completo de cadastro e listagem funciona ponta a ponta.
- Filtros obrigatórios e adicionais retornam resultados corretos.
- Performance aceitável em base local de uso comum.

## Sprint 4 - Exportações e usabilidade da operação

Objetivo:

- Permitir geração de relatórios úteis para rotina operacional.

Tarefas detalhadas:

- [x] Implementar exportação da listagem filtrada para CSV.
- [x] Implementar exportação da listagem filtrada para PDF com tabela estruturada.
- [x] Garantir que exportações respeitem exatamente os filtros ativos.
- [x] Incluir cabeçalho com período e parâmetros aplicados no relatório.
- [x] Incluir totalização de valor no final da exportação.
- [x] Padronizar formatação de moeda e data nos arquivos exportados.
- [x] Melhorar UX da tela de filtros e listagem para reduzir cliques.
- [x] Adicionar confirmações e mensagens de sucesso/erro na exportação.
- [x] Cobrir cenários sem resultados e com volume maior de registros.

Itens de backlog relacionados:

- BL-012, BL-013, BL-014

Critérios de aceite da sprint:

- CSV e PDF são gerados sem erro e com dados corretos.
- Arquivos exportados representam a tabela filtrada exibida ao usuário.
- Fluxo de exportação está simples e previsível para uso diário.

### Issues decorrentes da validação do cliente
- [x] Quando não houver filtro aplicado, a tabela deverá exibir todos os recebimento do ano presente ou do ano selecionado. O usuário deve poder esolher por seletores no cabeçalho de cada coluna a ordem de exibição (do maior para o menor, etc.). O filtro de ano deve ser separado do filtro de mês. Quando apenas o filtro de ano for aplicado cada mês deve ter sua div e tabela propria, exibindo ao final o toal recebido a cada mês. E uma div resumo exibindo a média e o total do período/filtro aplicado. Neste caso a exportação tembém deve ser gerada conforme o que está sendo exibido na tela, com um tabela para cada mês.
- [x] Terminar de preencher, popular, o banco de dados com informações simuladas dois anos inteiros de recebimentos (2024 e 2025) para simular e testar os filtros e exportações.

## Sprint 5 - Empacotamento, distribuição e preparação open source

Objetivo:

- Disponibilizar builds para usuários finais e preparar release pública.

Tarefas detalhadas:

- [ ] Configurar build e packaging para instalador Windows.
- [ ] Incluir ícone oficial da aplicação no empacotamento do instalador (BL-017).
- [ ] Configurar build e packaging para executável Linux.
- [ ] Validar processo de geração de artefatos em ambiente limpo.
- [ ] Definir convenção de versionamento para releases.
- [ ] Criar processo de release com changelog e publicação de artefatos.
- [ ] Definir licença do projeto e diretrizes de contribuição.
- [ ] Revisar README com instruções de download e instalação por sistema.
- [ ] Garantir checklist final de qualidade antes de release.
- [ ] Executar bateria final de testes funcionais de regressão.

Itens de backlog relacionados:

- BL-017, BL-018, BL-019, BL-020

Critérios de aceite da sprint:

- Usuário final consegue baixar instalador para Windows.
- Usuário final consegue baixar executável para Linux.
- Repositório possui documentação de contribuição e licença definida.

## Resumo de entregas por sprint

- Sprint 1: Base técnica e arquitetura pronta.
- Sprint 2: Cadastros mestres com normalização consistente.
- Sprint 3: Fluxo principal de recebimentos com filtros completos.
- Sprint 4: Exportações CSV e PDF + melhoria de usabilidade.
- Sprint 5: Packaging Windows/Linux e preparação de release open source.

## Riscos e mitigação

- Risco: divergência entre regra de normalização e dados já salvos.
- Mitigação: centralizar normalização na camada de domínio e cobrir com testes.

- Risco: inconsistência entre filtros da tela e exportação.
- Mitigação: compartilhar o mesmo objeto de critérios entre consulta e exportação.

- Risco: falhas no empacotamento multiplataforma.
- Mitigação: automatizar build e validar artefatos em ambientes limpos antes da release.
