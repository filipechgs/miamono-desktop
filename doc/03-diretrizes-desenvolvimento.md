# Diretrizes de Desenvolvimento

Este documento estabelece padrões obrigatórios para implementação e evolução do projeto.

## 1. Diretrizes de Banco de Dados

- Toda a modelagem do banco de dados deve ser escrita em inglês.
- Todos os nomes de tabelas devem estar em snake_case.
- Todos os nomes de colunas devem estar em snake_case.
- Evitar abreviações ambíguas em nomes de tabelas e colunas.
- Priorizar nomes claros e semânticos para facilitar manutenção futura.

### 1.1 Exemplos de nomenclatura correta

- Tabelas: `receipts`, `services`, `payers`
- Colunas: `receipt_date`, `service_id`, `payer_full_name`, `has_invoice`, `created_at`, `updated_at`

### 1.2 Exemplos de nomenclatura incorreta

- Tabelas: `Receipts`, `tblServices`, `PAGADORES`
- Colunas: `ReceiptDate`, `serviceID`, `NomePagador`, `HasInvoice`

## 2. Diretrizes de Normalização de Dados de Entrada

As entradas de nomes de pessoas e nomes de serviços devem ser normalizadas antes da persistência no banco.

Regras obrigatórias:

- Cada palavra deve ser armazenada com a primeira letra em maiúsculo e as demais em minúsculo.
- Para nomes completos de pessoas, artigos e preposições devem permanecer em lowercase.
- A regra de artigos em lowercase também se aplica quando aparecerem no meio do nome do serviço.

Exemplo esperado para nome completo de pessoa:

- Entrada livre: `fILIPE DOS sANTOS`
- Saída normalizada: `Filipe dos Santos`

Artigos e preposições que devem permanecer em lowercase (lista inicial):

- `de`
- `da`
- `do`
- `das`
- `dos`
- `e`

## 3. Requisitos de Implementação

- A normalização deve ocorrer na camada de domínio/aplicação, antes da gravação.
- As mesmas regras devem ser aplicadas em criação e atualização de registros.
- Deve existir teste automatizado para garantir consistência da normalização.
- O sistema deve evitar persistir variações de capitalização para o mesmo nome.

## 4. Critérios de Validação

Uma implementação só deve ser considerada pronta quando:

- Todas as tabelas e colunas novas estiverem em inglês e snake_case.
- Todos os campos de nome de pessoa e nome de serviço forem salvos em formato normalizado.
- Casos com artigos e preposições estiverem corretamente mantidos em lowercase.
- Testes de normalização cobrirem casos simples, compostos e entradas com capitalização irregular.

## 5. Diretrizes de Interface (UI)

- Toda a interface do usuário deve estar em PT-BR.
- Labels, mensagens, títulos, botões, placeholders e feedbacks devem usar linguagem clara e natural em português brasileiro.
- O visual da interface deve ser amigável, limpo e de fácil usabilidade para uso diário.
- Fluxos principais (cadastro, filtragem e exportação) devem exigir o menor número possível de cliques.
- Mensagens de erro e sucesso devem ser objetivas, orientando a próxima ação do usuário.

## 6. Critérios de Validação de UI

Uma implementação de interface só deve ser considerada pronta quando:

- Todos os textos visíveis ao usuário estiverem em PT-BR.
- Navegação e ações principais puderem ser realizadas com clareza e baixa fricção.
- Layout e componentes apresentarem leitura confortável e organização visual consistente.
- Feedbacks de erro/sucesso estiverem presentes e compreensíveis.
