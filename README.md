# Reaglia — Prototype

**Reaglia** é um protótipo de uma ferramenta educacional voltada ao estudo e à aplicação da Álgebra Relacional em bancos de dados.

O projeto tem como objetivo explorar uma interface que permita aos estudantes construir consultas utilizando operações da Álgebra Relacional e compreender sua relação com as consultas realizadas em bancos de dados relacionais.

Este repositório contém a implementação do protótipo da aplicação, servindo como base para experimentação, validação da interface e desenvolvimento das funcionalidades do sistema.

## Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| React 19 | Construção da interface e organização dos componentes |
| TypeScript | Tipagem estática e segurança durante o desenvolvimento |
| Vite | Servidor de desenvolvimento e ferramenta de build |
| Tailwind CSS 4 | Estilização da interface |
| PNPM | Gerenciamento de dependências |
| Oxfmt | Formatação do código |

## Estrutura do projeto

A estrutura principal do repositório está organizada da seguinte maneira:

```text
Reag_Proto/
│
├── maker/
│
├── public/
│
├── src/
│
├── .gitattributes
├── .gitignore
├── .mise.toml
├── LICENSE.md
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── vite.config.ts
```

### Diretórios

- **`maker/`**: Diretório que contém scripts, configurações e arquivos gerados para construção do site.
- **`public/`**: Diretório destinado a arquivos estáticos disponibilizados diretamente pela aplicação, como imagens, ícones e outros recursos públicos.
- **`src/`**: Diretório principal do código-fonte da aplicação. Concentra a implementação da interface e a lógica desenvolvida utilizando React e TypeScript.

### Arquivos de configuração

- **`.gitattributes`**: Define atributos específicos para arquivos utilizados pelo Git.
- **`.gitignore`**: Determina quais arquivos e diretórios devem ser ignorados pelo controle de versão.
- **`.mise.toml`**: Arquivo de configuração do Mise, utilizado para gerenciar ferramentas e versões do ambiente de desenvolvimento.
- **`LICENSE.md`**: Arquivo de licença presente no repositório.
- **`index.html`**: Documento HTML de entrada da aplicação, utilizado pelo Vite para inicializar o projeto.
- **`package.json`**: Define os metadados do projeto, suas dependências e os comandos disponíveis para execução.
- **`pnpm-lock.yaml`**: Registra as versões exatas das dependências instaladas, garantindo maior consistência entre ambientes.
- **`tsconfig.json`**: Configuração do compilador TypeScript.
- **`vite.config.ts`**: Configura o ambiente de desenvolvimento e build do Vite.

## Instalação e execução

### Pré-requisitos

- Node.js
- PNPM

### 1. Clonar o repositório

```bash
git clone https://github.com/Gustavonn07/Reag_Proto.git
```

### 2. Acessar o diretório

```bash
cd Reag_Proto
```

### 3. Instalar as dependências

```bash
pnpm install
```

### 4. Executar em ambiente de desenvolvimento

```bash
pnpm dev
```

Após iniciar o servidor, o Vite disponibilizará o endereço local para acessar a aplicação pelo navegador.

### 5. Gerar a versão de produção

```bash
pnpm build
```

Os arquivos compilados serão disponibilizados no diretório `dist/`.

### 6. Visualizar a versão de produção

```bash
pnpm preview
```

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `pnpm dev` | Inicializa o servidor de desenvolvimento |
| `pnpm build` | Gera a versão de produção |
| `pnpm preview` | Executa uma pré-visualização da versão compilada |
| `pnpm format` | Executa a formatação do código utilizando Oxfmt |

## Desenvolvimento

O projeto utiliza React e TypeScript para estruturar a aplicação em componentes reutilizáveis, enquanto o Tailwind CSS é utilizado para a construção da interface.

O Vite é responsável pelo ambiente de desenvolvimento e pela geração dos arquivos de produção.

Por se tratar de um protótipo, sua estrutura pode sofrer alterações conforme a evolução dos requisitos e a implementação de novas funcionalidades.

## Repositório

O código-fonte está disponível publicamente no GitHub:

https://github.com/Gustavonn07/Reag_Proto

## Licença

Consulte o arquivo `LICENSE.md` para verificar as informações de licenciamento presentes no repositório.
