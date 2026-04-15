# PNCP Insight - Inteligência em Licitações Públicas

PNCP Insight é um SaaS focado na otimização da jornada de empresas B2B que vendem para o governo através do Portal Nacional de Contratações Públicas (PNCP).

## 🚀 Tecnologias

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Banco de Dados**: [Supabase](https://supabase.com/) (PostgreSQL) + [Prisma ORM](https://www.prisma.io/)
- **IA**: [Google Gemini Pro/Flash](https://ai.google.dev/)
- **Pagamentos**: [Stripe](https://stripe.com/)

## 🛠️ Estrutura do Projeto

- `src/app/`: Rotas, Layouts e API Routes (incluindo Crons).
- `src/services/`: Camada de lógica de negócio (PNCP, IA, Billing, Sync).
- `src/components/`: Componentes UI e Layouts (Mobile-First).
- `src/lib/`: Configurações de clientes (Supabase, Prisma).
- `PLAN/`: Documentação estratégica e técnica do projeto.

## ⚙️ Configuração

1. Clone o repositório.
2. Copie o `.env.example` para `.env` e preencha as variáveis:
   ```bash
   cp .env.example .env
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Execute as migrations do banco:
   ```bash
   npx prisma migrate dev
   ```
5. Inicie o servidor:
   ```bash
   npm run dev
   ```

## 📈 Funcionalidades Implementadas

- [x] Landing Page Premium.
- [x] Sistema de Autenticação (Supabase SSR).
- [x] Integração de Sincronismo com API PNCP.
- [x] Dashboard de Monitoramento Administrativo.
- [x] Busca de Licitações Inteligente.
- [x] Análise de Editais com IA (Gemini).

---
Desenvolvido por **Antigravity AI** para o ecossistema Kilo.
