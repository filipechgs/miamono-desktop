# Miamono Desktop

Aplicativo desktop open source para registro, consulta e exportação de recebimentos, pensado para profissionais liberais que precisam manter controle financeiro organizado e histórico confiável.

## Motivação

Este projeto nasce de uma necessidade real: oferecer uma forma simples, prática e confiável de acompanhar recebimentos de serviços prestados no dia a dia. A proposta é apoiar profissionais autônomos e liberais no controle de entradas financeiras, na conferência por período (mês/ano), e na geração de relatórios para análise e organização documental.

A motivação principal é atender ao cenário de uso de uma profissional liberal que precisa monitorar recebimentos com clareza, manter histórico e facilitar a rotina de conferência de pagamentos e notas fiscais.

## Visão Geral do Aplicativo

O Miamono Desktop é um sistema local (desktop) para cadastrar recebimentos e consultar os dados com filtros específicos. O aplicativo também permite exportar os resultados filtrados para arquivos `.pdf` e `.csv`, com estrutura tabular.

A entidade central do domínio é **Recebimento**, composta pelos campos:

- Data
- Nome do serviço
- Nome do pagador
- Valor
- Com nota fiscal?

## Funcionalidades

- Cadastro de recebimentos com os campos da entidade central.
- Listagem de recebimentos em formato de tabela.
- Filtro obrigatório por mês e ano na exibição da tabela.
- Filtros adicionais por:
  - Data
  - Serviço
  - Pagador
  - Presença de nota fiscal
- Cadastro e manutenção da lista de serviços.
- Cadastro e manutenção da lista de pagadores.
- Exportação da listagem (resultado atual filtrado) para:
  - `.csv`
  - `.pdf`
- Operação local com persistência em banco SQLite.

## Requisitos Funcionais

- RF-01: Permitir cadastrar um recebimento com data, serviço, pagador, valor e indicador de nota fiscal.
- RF-02: Permitir listar recebimentos em tabela.
- RF-03: Permitir filtrar a listagem por mês e ano.
- RF-04: Permitir aplicar filtros por data, serviço, pagador e presença de nota fiscal.
- RF-05: Permitir cadastrar e manter uma lista de serviços.
- RF-06: Permitir cadastrar e manter uma lista de pagadores.
- RF-07: Permitir exportar a listagem filtrada para arquivo `.csv`.
- RF-08: Permitir exportar a listagem filtrada para arquivo `.pdf` em formato tabular.
- RF-09: Preservar histórico de recebimentos localmente para consultas futuras.

## Requisitos Não Funcionais

- RNF-01: Aplicação desktop multiplataforma com empacotamento para **Windows** e **Linux**.
- RNF-01.1: Distribuição para usuário final com artefatos de download: instalador para **Windows** e executável para **Linux**.
- RNF-02: Implementação em **Node.js v24** com **TypeScript nativo** (sem etapa de compilação TypeScript externa, conforme suporte do runtime).
- RNF-03: Interface desktop construída com **Electron.js**.
- RNF-04: Persistência de dados com **SQLite** via API nativa do Node.js v24.
- RNF-05: Arquitetura em camadas seguindo padrão **MVC**.
- RNF-06: Projeto open source com estrutura clara para manutenção e evolução.
- RNF-07: Desempenho adequado para operações de cadastro, filtro e exportação em uso local.
- RNF-08: Integridade básica dos dados (validações de campos obrigatórios e tipos).

## Arquitetura

O projeto adota arquitetura em camadas com padrão MVC para separar responsabilidades e facilitar manutenção, testes e evolução.

Além do MVC em camadas, a base de código será estruturada por domínios de negócio (por exemplo: `recebimentos`, `servicos`, `pagadores`, `exportacao`). Essa organização orientada a domínio reduz acoplamento entre módulos, melhora a clareza das responsabilidades e facilita o incremento futuro de novas funcionalidades sem impactar de forma excessiva áreas já estáveis do sistema.

### Camadas

- **Apresentação (View)**
  - Componentes de interface desktop e interação com o usuário.
  - Exibição da tabela, formulários de cadastro e filtros.

- **Controle (Controller)**
  - Orquestra fluxos entre interface e regras de negócio.
  - Recebe eventos da UI, valida entradas e aciona serviços.

- **Aplicação/Domínio (Service/Use Cases)**
  - Regras de negócio do cadastro, consulta e exportação de recebimentos.
  - Aplicação de filtros e preparação dos dados para relatório.

- **Dados (Model/Repository)**
  - Modelos de dados e acesso ao SQLite.
  - Persistência e consultas com suporte a filtros.

### Organização MVC

- **Model**: entidades (`Recebimento`, `Serviço`, `Pagador`) e repositórios.
- **View**: telas e componentes da interface.
- **Controller**: controladores de recebimentos, serviços, pagadores e exportação.

### Organização por Domínios

- Cada domínio concentra seus próprios modelos, casos de uso, repositórios e controladores.
- Componentes compartilhados (infraestrutura, utilitários e contratos) permanecem em módulos comuns.
- A evolução de funcionalidades ocorre prioritariamente dentro do domínio afetado, reduzindo efeitos colaterais.
- Essa abordagem favorece escalabilidade de código, manutenção contínua e onboarding de novos colaboradores no projeto open source.

## Tecnologias Utilizadas

- **Node.js v24**
- **TypeScript nativo no Node.js v24** (sem compilação TS tradicional)
- **Electron.js**
- **SQLite** com API nativa do Node.js v24
- Ferramentas de empacotamento para gerar executáveis em Windows e Linux

## Como Rodar Localmente

### 1. Baixar o código-fonte

Você pode obter o projeto de duas formas:

- Clonar o repositório com Git.
- Baixar o código-fonte em um arquivo `.zip` pela interface do repositório e extrair em uma pasta local.

### 2. Instalar as dependências

Na raiz do projeto, execute:

```bash
npm install
```

### 3. Popular o banco com dados simulados

Antes de abrir o aplicativo pela primeira vez, rode o seed para criar e preencher o banco SQLite com dados simulados de 2024 e 2025:

```bash
npm run seed
```

Esse comando recria os dados de desenvolvimento local com registros de serviços, pagadores e recebimentos simulados.

### 4. Iniciar o aplicativo

Depois do seed, inicie a aplicação desktop com:

```bash
npm start
```

### Observações

- O banco local fica em `data/miamono.sqlite`.
- Se você quiser limpar e recriar os dados de teste, basta executar `npm run seed` novamente.
- No Windows, o comando de seed usa o launcher `py -3`, então o Python precisa estar instalado com esse atalho disponível.

### Solução de Problemas

- Se `npm run seed` falhar porque `py` não foi encontrado, instale o Python no Windows com o launcher padrão habilitado ou execute o script diretamente com o caminho completo do interpretador.
- Se o aplicativo estiver aberto enquanto você roda o seed, feche-o antes de executar o comando para evitar bloqueio no arquivo SQLite.

## Fora do Escopo Inicial

- Mecanismos de autenticação e gestão de usuários não fazem parte da primeira versão do projeto.
- A versão inicial é focada em uso local, com um fluxo simples e objetivo para registro e acompanhamento de recebimentos.

## Licenciamento e Open Source

O projeto será disponibilizado como open source, permitindo uso, estudo, melhorias e contribuições da comunidade. A definição da licença pode ser formalizada na evolução do repositório (ex.: MIT).

## Objetivo de Valor

Entregar uma solução desktop simples e objetiva para controle de recebimentos, com histórico consultável e exportação de dados, reduzindo esforço operacional e aumentando a visibilidade financeira mensal de profissionais liberais.
