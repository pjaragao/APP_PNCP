# PNCP Insight - Documentação dos Planos

Este diretório contém todos os planos detalhados do projeto PNCP Insight.

## Índice dos Planos

### Plano Principal
- **[PLAN.md](PLAN.md)** - Plano geral do projeto com visão holística, roadmap e decisões arquiteturais

### Planos Detalhados por Área

| Arquivo | Descrição |
|---------|-----------|
| **[PLAN-data-model.md](PLAN-data-model.md)** | Modelo de dados completo, schema do Prisma, entidades, relacionamentos e RLS |
| **[PLAN-api-integration.md](PLAN-api-integration.md)** | Estratégia de integração com API PNCP, sincronização batch e incremental |
| **[PLAN-frontend.md](PLAN-frontend.md)** | Arquitetura frontend, componentes, páginas, design system e fluxos |
| **[PLAN-backend.md](PLAN-backend.md)** | Arquitetura backend, rotas, services, jobs e middleware |
| **[PLAN-auth-billing.md](PLAN-auth-billing.md)** | Sistema de autenticação (Supabase) e billing (Stripe) |

---

## Visão Rápida das Responsabilidades

### Data Model
- Define todas as entidades: Contratacao, Ata, Contrato, Usuario, Proposta, etc.
- Relacionamentos e chaves estrangeiras
- Índices para performance
- Row Level Security (RLS)

### API Integration
- Cliente HTTP para PNCP
- Carga inicial (batch por chunks)
- Sync incremental (cron 15min)
- Tratamento de erros e rate limiting

### Frontend & Backend (Next.js)
- Stack: React 18, TypeScript, **Next.js (App Router)**, Tailwind, shadcn/ui
- Pages: Landing, Dashboard, Busca, Detalhes, Propostas, Config, **Admin Center**
- Hooks: TanStack Query, Zustand
- Fluxos: Auth, Acompanhamento, Propostas
- Rotas RESTful (Serverless API Routes)
- Services para lógica de negócio, integrados nativamente

### Sincronização e Workers
- Arquitetura: **Serverless Functions** (Vercel/Supabase Cron)
- Integrações: Client HTTP otimizado e painel gerencial no Admin
- Jobs para carga macro e sync contínuo (com inteligência de re-verificação de status das licitações passadas).

### Inteligência Artificial
- Stack: **Google Gemini API** (Flash / Pro)
- Conversão de Documentos: Parsing de PDF visando Markdown (estilo Docling) ou avaliação Multimodal.
- Funcionalidades: Análise RAG de Editais, preenchimento de habilitacao contra Acervo Técnico.

### Auth & Billing
- Supabase Auth (email, Google, magic link)
- Stripe (subscriptions, webhooks)
- Planos: Free, Basic, Pro, Premium
- Feature gates e limits

---

## Próximos Passos

1. Revisar e validar os planos com stakeholders
2. Decidir fluxos menores de UI e manter aderência primária em telas **Mobile**.
3. Iniciar setup do projeto (repositório, estrutura base)
4. Implementar em fases conforme roadmap

---

*Projeto: PNCP Insight*
*Versão dos planos: 1.0*
*Data: 2026-04-14*