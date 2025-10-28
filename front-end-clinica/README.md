# 🏥 Clínica Saúde - Sistema de Gestão de Consultas Médicas

Sistema completo de gerenciamento de consultas médicas com agendamento online, controle de pagamentos e dashboards administrativos.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Usuários e Perfis](#usuários-e-perfis)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Troubleshooting](#troubleshooting)

## 🎯 Sobre o Projeto

O **Clínica Saúde** é uma aplicação web moderna para gestão completa de clínicas médicas, permitindo:

- 👥 Gestão de usuários (Pacientes, Médicos e Administradores)
- 📅 Agendamento de consultas online
- 💳 Sistema de pagamentos simulado
- 📊 Dashboards com métricas e KPIs
- 🗓️ Gestão de agenda médica
- 📈 Relatórios e análises

## 🚀 Tecnologias

Este projeto foi desenvolvido com as seguintes tecnologias:

### Core
- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool e dev server ultrarrápido

### UI/UX
- **Tailwind CSS** - Framework CSS utility-first
- **shadcn/ui** - Componentes React reutilizáveis
- **Radix UI** - Componentes acessíveis e não estilizados
- **Lucide React** - Ícones modernos

### Estado e Dados
- **TanStack Query (React Query)** - Gerenciamento de estado servidor
- **Zustand** - Gerenciamento de estado global
- **Axios** - Cliente HTTP

### Formulários e Validação
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas TypeScript-first

### Outras Bibliotecas
- **React Router DOM** - Roteamento
- **Day.js** - Manipulação de datas
- **Sonner** - Notificações toast
- **Recharts** - Gráficos e visualizações

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** (geralmente vem com Node.js) ou **yarn**
- **Git**
- **Backend da API** rodando em `http://localhost:8000`

### Verificando as versões instaladas

```bash
node --version  # Deve ser >= 18.0.0
npm --version   # Deve ser >= 9.0.0
```

## 💻 Instalação

### 1. Clone o repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd front-end-clinica
```

### 2. Instale as dependências

```bash
npm install
```

ou com yarn:

```bash
yarn install
```

## ⚙️ Configuração

### 1. Arquivo de Ambiente

Crie um arquivo `.env` na raiz do projeto copiando o `.env.example`:

```bash
cp .env.example .env
```

### 2. Configure a URL da API

Edite o arquivo `.env` e defina a URL do backend:

```env
VITE_API_URL=http://localhost:8000
```

> ⚠️ **Importante**: Certifique-se de que o backend está rodando antes de iniciar o frontend.

## 🎮 Executando o Projeto

### Modo Desenvolvimento

Inicia o servidor de desenvolvimento com hot-reload:

```bash
npm run dev
```

A aplicação estará disponível em: `http://localhost:8080`

### Build para Produção

Gera os arquivos otimizados para produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

### Preview da Build

Para visualizar a build de produção localmente:

```bash
npm run preview
```

### Lint

Para verificar problemas no código:

```bash
npm run lint
```

## 📁 Estrutura do Projeto

```
front-end-clinica/
├── src/
│   ├── api/                    # Configuração e endpoints da API
│   │   ├── axios.ts           # Cliente Axios configurado
│   │   └── endpoints.ts       # Endpoints da API
│   │
│   ├── components/            # Componentes React
│   │   ├── auth/             # Componentes de autenticação
│   │   ├── common/           # Componentes compartilhados
│   │   ├── layouts/          # Layouts (Patient, Doctor, Admin)
│   │   └── ui/               # Componentes UI (shadcn/ui)
│   │
│   ├── hooks/                # Custom hooks
│   │
│   ├── lib/                  # Utilitários e helpers
│   │   ├── date.ts          # Funções de data/hora
│   │   ├── error.ts         # Tratamento de erros
│   │   └── utils.ts         # Funções utilitárias
│   │
│   ├── pages/               # Páginas da aplicação
│   │   ├── admin/          # Páginas do administrador
│   │   ├── auth/           # Páginas de autenticação
│   │   ├── doctor/         # Páginas do médico
│   │   ├── patient/        # Páginas do paciente
│   │   ├── Index.tsx       # Página inicial
│   │   └── NotFound.tsx    # Página 404
│   │
│   ├── store/              # Estado global (Zustand)
│   │   └── auth.ts        # Store de autenticação
│   │
│   ├── types/              # Definições de tipos TypeScript
│   │   └── api.ts         # Tipos da API
│   │
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Entry point
│   └── index.css           # Estilos globais
│
├── public/                  # Arquivos públicos
├── .env.example            # Exemplo de variáveis de ambiente
├── package.json            # Dependências e scripts
├── vite.config.ts         # Configuração do Vite
├── tailwind.config.ts     # Configuração do Tailwind
└── tsconfig.json          # Configuração do TypeScript
```

## ✨ Funcionalidades

### 🏠 Página Inicial (Pública)
- Apresentação do sistema
- Informações sobre funcionalidades
- Links para login e cadastro

### 🔐 Autenticação
- **Login**: Email e senha
- **Registro**: Apenas para pacientes (Admin/Médico criados pelo Admin)
- **Refresh Token**: Renovação automática de sessão
- **Logout**: Encerramento de sessão

### 👤 Paciente

#### Dashboard
- KPIs: Consultas do mês, gasto total, taxa de ocupação
- Próximas consultas agendadas
- Ações rápidas (agendar, ver consultas)

#### Médicos
- Listagem de todos os médicos disponíveis
- Informações: Nome, especialidade, CRM, valor da consulta
- Botão para acessar agenda do médico

#### Agenda
- Visualização de horários disponíveis por data
- Seleção de horário livre
- Confirmação de agendamento
- Redirecionamento para pagamento

#### Consultas
- Listagem de todas as consultas
- Filtros: Todas, Agendadas, Realizadas, Canceladas, Pagas
- Status de pagamento
- Botão para pagar consulta

#### Pagamento
- Detalhes da consulta
- Formulário de pagamento (simulado)
- Confirmação com NSU gerado
- Status de aprovação

#### Perfil
- Informações pessoais
- CPF, telefone, email
- Data de nascimento
- Data de cadastro

### 👨‍⚕️ Médico

#### Dashboard
- KPIs: Consultas do mês, faturamento, taxa de ocupação, pacientes ativos
- Consultas recentes
- Ações rápidas

#### Minha Agenda
- Criação de horários disponíveis
- Listagem de slots por data
- Status dos horários (Livre, Reservado, Concluído, Cancelado)
- Remoção de horários livres
- Visualização de pacientes agendados

### 👔 Administrador

#### Dashboard
- KPIs globais do sistema
- Faturamento anual
- Gráfico de faturamento mensal
- Total de usuários ativos

#### Gestão de Usuários
- Listagem completa de usuários
- Filtros por tipo (Admin, Médico, Paciente)
- Criação de novos usuários (qualquer tipo)
- Edição de usuários existentes
- Informações: Nome, email, CPF, role, data de criação

## 👥 Usuários e Perfis

### Tipos de Usuário

| Tipo | Descrição | Cadastro |
|------|-----------|----------|
| **PACIENTE** | Usuário padrão que agenda consultas | Auto-cadastro |
| **MEDICO** | Profissional que atende consultas | Criado pelo Admin |
| **ADMIN** | Gerencia todo o sistema | Criado pelo Admin |

### Rotas por Perfil

```typescript
// Paciente
/app/dashboard
/app/appointments
/app/doctors
/app/schedule/:doctorId
/app/payment/:appointmentId
/app/profile

// Médico
/doctor/dashboard
/doctor/agenda

// Administrador
/admin/dashboard
/admin/users
```

## 📜 Scripts Disponíveis

```json
{
  "dev": "Inicia servidor de desenvolvimento",
  "build": "Gera build de produção",
  "build:dev": "Gera build de desenvolvimento",
  "lint": "Executa o ESLint",
  "preview": "Preview da build de produção"
}
```

## 🎨 Customização de Tema

O projeto usa um sistema de design com variáveis CSS para fácil customização:

### Cores Principais

```css
--primary: 210 85% 48%      /* Azul médico */
--secondary: 145 65% 48%    /* Verde saúde */
--tertiary: 24 92% 54%      /* Laranja destaque */
```

### Editando Cores

Modifique as cores em `src/index.css` na seção `:root`:

```css
:root {
  --primary: SEU_VALOR_HSL;
  --secondary: SEU_VALOR_HSL;
  /* ... */
}
```

## 🔒 Segurança

### Tokens de Autenticação
- **Access Token**: Armazenado em memória (não persiste)
- **Refresh Token**: Armazenado em localStorage (persiste)
- Renovação automática via interceptor Axios

### Proteção de Rotas
- Componente `ProtectedRoute` verifica autenticação
- Redirecionamento baseado em roles
- Verificação de permissões por tipo de usuário

## 🐛 Troubleshooting

### Problema: Erro de conexão com API

**Solução**:
1. Verifique se o backend está rodando
2. Confirme a URL em `.env`
3. Verifique o CORS no backend

### Problema: Erros de TypeScript

**Solução**:
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Problema: Build falha

**Solução**:
```bash
# Execute o lint primeiro
npm run lint

# Corrija os erros apontados
# Depois tente o build novamente
npm run build
```

### Problema: Porta 8080 já em uso

**Solução**:
```bash
# Mate o processo na porta
# Linux/Mac:
lsof -ti:8080 | xargs kill -9

# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Problema: Hot reload não funciona

**Solução**:
1. Verifique se o arquivo está dentro de `src/`
2. Reinicie o servidor de desenvolvimento
3. Limpe o cache do navegador

## 📝 Boas Práticas

### Commits
- Use commits semânticos: `feat:`, `fix:`, `docs:`, etc.
- Mensagens descritivas em português ou inglês
- Um commit por funcionalidade

### Código
- Componentes: PascalCase (`UserCard.tsx`)
- Funções: camelCase (`formatDate()`)
- Constantes: UPPER_CASE (`API_URL`)
- Sempre tipar com TypeScript
- Comentários em português

### Estrutura de Componentes
```typescript
// 1. Imports
import { ... } from "..."

// 2. Types/Interfaces
interface ComponentProps { ... }

// 3. Component
export default function Component(props: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState()
  
  // 5. Functions
  const handleClick = () => { ... }
  
  // 6. Effects
  useEffect(() => { ... }, [])
  
  // 7. Render
  return ( ... )
}
```

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Verifique a seção [Troubleshooting](#troubleshooting)
2. Consulte a documentação das tecnologias utilizadas
3. Abra uma issue no repositório
4. Entre em contato com a equipe de desenvolvimento

## 📄 Licença

Este projeto está sob a licença especificada no arquivo LICENSE.

---

⭐ **Desenvolvido com React, TypeScript e muito ☕**