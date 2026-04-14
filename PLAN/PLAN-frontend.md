# Plano: Arquitetura Frontend

## Visão Geral

Frontend moderno em React 18+ com TypeScript, utilizando Vite como bundler, shadcn/ui + Tailwind CSS para interface, e TanStack Query para gerenciamento de estado server-side.

---

## 1. Stack Técnica

| Tecnologia | Escolha | Justificativa |
|------------|---------|---------------|
| Framework | **Next.js (App Router)** | SSR/SSG integrados, melhor SEO e API Routes, Fullstack features |
| Linguagem | TypeScript | Type safety, DX melhor |
| UI Library | shadcn/ui | Componentes customizáveis, design system robusto |
| Estilização | Tailwind CSS | Flexibilidade, alta sinergia com Next.js |
| State (Server) | TanStack Query | Cache, refetch, mutations no lado do cliente com Server Components hidratando dados |
| State (Client) | Zustand | Simplicidade para estado global do usuário logado |
| Forms | React Hook Form + Zod | Performance transacional e validação cruzável com backend |
| Auth | Supabase Auth (SSR) | Integração via SSR cookies / middleware do Next.js |

---

## 2. Estrutura de Pastas (Next.js App Router)

```
/
├── /app
│   ├── (public)             # Grupo de rotas públicas
│   │   ├── page.tsx         # Landing (Página inicial)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── pricing/page.tsx
│   ├── (dashboard)          # App autenticado
│   │   ├── layout.tsx       # Header, Sidebar responsivos
│   │   ├── page.tsx         # Dashboard Principal
│   │   ├── busca/page.tsx
│   │   ├── contratacoes/
│   │   │   └── [id]/page.tsx
│   │   ├── propostas/page.tsx
│   │   ├── acervo/page.tsx
│   │   └── configuracoes/page.tsx
│   ├── admin/               # Painel Central do Sincronismo PNCP
│   │   ├── layout.tsx
│   │   ├── page.tsx         # Dashboard Admin (Logs e Cron)
│   │   └── sync-status/page.tsx
│   ├── api/                 # Next.js Serverless Route Handlers
│   │   ├── webhooks/stripe/route.ts
│   │   └── cron/pncp/route.ts
│   ├── globals.css
│   └── layout.tsx           # Layout raiz HTML
├── /components
│   ├── /ui                  # Componentes shadcn/ui
│   ├── /contratacoes        # Displays de Licitação
│   └── /common              # Shared blocks
├── /hooks                   # Hooks Zustand e Queries
├── /lib                     # Helpers de negócio (Supabase client CSR/SSR)
└── tailwind.config.ts
```

---

## 3. Design System

### 3.1 Paleta de Cores
```typescript
const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main blue (governamental)
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  secondary: {
    // Grays neutros
  },
  success: '#10b981',  // Verde para status positivos
  warning: '#f59e0b',  // Amarelo para alertas
  error: '#ef4444',    // Vermelho para erros
};
```

### 3.2 Tipografia
```typescript
const fontFamily = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
};

// Escala
// text-xs: 12px
// text-sm: 14px
// text-base: 16px
// text-lg: 18px
// text-xl: 20px
// text-2xl: 24px
// text-3xl: 30px
```

### 3.3 Espaçamento
- Base: 4px
- Componentes: 8px, 12px, 16px, 24px, 32px
- Seções: 48px, 64px

---

## 4. Componentes Principais

### 4.1 Layout
```typescript
// componentes/layout/AppLayout.tsx
interface AppLayoutProps {
  children: React.ReactNode;
}

// Estrutura:
// ┌─────────────────────────────────────────────────┐
// │  Header (logo, search, notifications, user)    │
// ├──────────┬──────────────────────────────────────┤
// │          │                                      │
// │  Sidebar │  Main Content                        │
// │  (nav)   │                                      │
// │          │                                      │
// │          │                                      │
// └──────────┴──────────────────────────────────────┘
```

### 4.2 Cards de Listagem
```typescript
// components/contratacoes/ContratacaoCard.tsx
interface ContratacaoCardProps {
  contratacao: Contratacao;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
}
```

### 4.3 Search e Filtros
```typescript
// components/busca/SearchFilters.tsx
interface SearchFiltersProps {
  filters: BuscaFiltros;
  onChange: (filters: BuscaFiltros) => void;
  onSearch: () => void;
}

// Filtros:
// - Palavra-chave
// - UF (multi-select)
// - Modalidade (checkboxes)
// - Esfera (radio)
// - Porte (radio)
// - Valor mínimo/máximo
// - Data publicação (range)
```

### 4.4 Timeline de Ações
```typescript
// components/contratacoes/AcoesTimeline.tsx
interface AcoesTimelineProps {
  contratacao: Contratacao;
  status: StatusAcompanhamento;
  acoes: Acao[];
}
```

---

## 5. Páginas Principais

### 5.1 Landing Page
```
┌─────────────────────────────────────────────────┐
│  Hero: "Acompanhe oportunidades no governo"     │
│  CTA: "Começar gratuitamente"                   │
├─────────────────────────────────────────────────┤
│  Features:                                      │
│  - Busca inteligente                            │
│  - Alertas personalizados                       │
│  - Geração de propostas                         │
│  - Análise de elegibilidade                     │
├─────────────────────────────────────────────────┤
│  Pricing preview (3 planos)                     │
├─────────────────────────────────────────────────┤
│  Footer                                         │
└─────────────────────────────────────────────────┘
```

### 5.2 Dashboard
```
┌─────────────────────────────────────────────────┐
│  Bem-vindo, [Nome]                    [Plano]  │
├─────────────────────────────────────────────────┤
│  ┌───────────┐ ┌───────────┐ ┌───────────┐    │
│  │Seguindo   │ │Participando│ │Propostas  │    │
│  │   15      │ │     3     │ │    8      │    │
│  └───────────┘ └───────────┘ └───────────┘    │
├─────────────────────────────────────────────────┤
│  Próximos Prazos                                │
│  ┌─────────────────────────────────────────┐   │
│  │ Pregão X - Recebimento: 25/04           │   │
│  │ Pregão Y - Recebimento: 26/04           │   │
│  └─────────────────────────────────────────┘   │
├─────────────────────────────────────────────────┤
│  Últimas Notificações                           │
│  ┌─────────────────────────────────────────┐   │
│  │ [item]                                  │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 5.3 Busca
```
┌─────────────────────────────────────────────────┐
│  [🔍 Barra de busca .........................] │
├──────────────┬──────────────────────────────────┤
│  Filtros     │  Resultados (47)                 │
│  ─────────   │  ─────────────────               │
│  UF: [x] [ ] │  ┌──────────────────────────┐   │
│  Modalidade  │  │ Pregão 12/2024           │   │
│  [x] Pregão  │  │ UASG - Órgão             │   │
│  [ ] Concorr │  │ Objeto: Aquisição de...  │   │
│  Esfera:     │  │ Valor: R$ 150.000,00     │   │
│  [ ] Fed     │  │ [Acompanhar] [Ver mais]  │   │
│  [ ] Est     │  └──────────────────────────┘   │
│  [ ] Mun     │                                  │
│  ─────────   │  [Pagination]                    │
│  Valor:      │                                  │
│  De: [    ]  │                                  │
│  Até: [    ] │                                  │
└──────────────┴──────────────────────────────────┘
```

### 5.4 Detalhe da Contratação
```
┌─────────────────────────────────────────────────┐
│  ← Voltar                                       │
├─────────────────────────────────────────────────┤
│  PREGÃO ELETRÔNICO 12/2024                      │
│  UASG: 123456 - Nome do Órgão                   │
│  UF: MG | Modalidade: Pregão Eletrônico         │
├─────────────────────────────────────────────────┤
│  Status: [ Acompanhar ▼ ]                       │
├─────────────────────────────────────────────────┤
│  [Info] [Itens] [Documentos] [Histórico]        │
│  ─────────────────────────────────────────────  │
│  Objeto: Descrição completa do objeto...        │
│                                                 │
│  Valor Estimado: R$ 150.000,00                  │
│  Valor Homologado: R$ 145.000,00                │
│                                                 │
│  Datas:                                         │
│  - Divulgação: 01/04/2024                       │
│  - Recebimento: 25/04/2024 14:00                │
│                                                 │
│  [Ações Disponíveis]                            │
│  ┌─────────────────────────────────────────┐   │
│  │ [Questionar] [Impugnar]                 │   │
│  │ [Gerar Proposta Habilitação]            │   │
│  │ [Gerar Proposta Técnica]                │   │
│  │ [Gerar Proposta Financeira]             │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 5.5 Minhas Propostas
```
┌─────────────────────────────────────────────────┐
│  Propostas                         [+ Nova]    │
├─────────────────────────────────────────────────┤
│  [Todos ▼] [Status ▼] [Tipo ▼]                 │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐   │
│  │ Proposta Habilitação                    │   │
│  │ Pregão 12/2024 - UASG                   │   │
│  │ Status: Rascunho | Criada: 20/04        │   │
│  │ [Editar] [Gerar PDF] [Excluir]          │   │
│  └─────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────┐   │
│  │ Proposta Financeira                     │   │
│  │ Pregão 12/2024 - UASG                   │   │
│  │ Status: Gerada | Criada: 21/04          │   │
│  │ [Ver] [Download PDF]                    │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 6. Fluxos de Usuário

### 6.1 Fluxo de Autenticação
```
Landing → Login/Registro → Dashboard

Métodos:
- Email/Password (Supabase Auth)
- Google OAuth
- Magic Link
```

### 6.2 Fluxo de Acompanhamento
```
Busca → Seleciona contratação →
  → Acompanhar (salva no DB)
  → Participar (muda status)

Participando:
  → Questionar
  → Impugnar
  → Upload Documentos
  → Gerar Propostas
```

### 6.3 Fluxo de Proposta
```
Contratação Participando → Selecionar tipo →
  → Upload documentos necessários
  → Preencher dados
  → Preview
  → Gerar PDF
  → Download
```

---

## 7. Queries e Cache

### 7.1 Query Keys
```typescript
const queryKeys = {
  contratacoes: {
    list: (filters) => ['contratacoes', 'list', filters],
    detail: (id) => ['contratacoes', 'detail', id],
    itens: (id) => ['contratacoes', 'itens', id],
    documentos: (id) => ['contratacoes', 'documentos', id],
  },
  atas: {
    list: (filters) => ['atas', 'list', filters],
    detail: (id) => ['atas', 'detail', id],
  },
  contratos: {
    list: (filters) => ['contratos', 'list', filters],
    detail: (id) => ['contratos', 'detail', id],
  },
  usuario: {
    me: ['usuario', 'me'],
    itens: ['usuario', 'itens'],
    propostas: ['usuario', 'propostas'],
    documentos: ['usuario', 'documentos'],
  },
};
```

### 7.2 Custom Hooks
```typescript
// hooks/queries/useContratacoes.ts
export function useContratacoes(filters: BuscaFiltros) {
  return useQuery({
    queryKey: queryKeys.contratacoes.list(filters),
    queryFn: () => api.contratacoes.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// hooks/queries/useContratacao.ts
export function useContratacao(id: string) {
  return useQuery({
    queryKey: queryKeys.contratacoes.detail(id),
    queryFn: () => api.contratacoes.get(id),
  });
}

// hooks/queries/useMeusItens.ts
export function useMeusItens() {
  return useQuery({
    queryKey: queryKeys.usuario.itens,
    queryFn: () => api.usuario.itens(),
  });
}
```

---

## 8. Formulários com React Hook Form

### 8.1 Schema de Validação (Zod)
```typescript
// schemas/proposta.ts
export const propostaHabilitacaoSchema = z.object({
  empresa_nome: z.string().min(1, 'Nome obrigatório'),
  empresa_cnpj: z.string().regex(/\d{14}/, 'CNPJ inválido'),
  certidao_federal: z.string().optional(),
  certidao_estadual: z.string().optional(),
  certidao_municipal: z.string().optional(),
  cnpj: z.string().optional(),
  // ... mais campos
});

export type PropostaHabilitacaoForm = z.infer<typeof propostaHabilitacaoSchema>;
```

### 8.2 Componente de Form
```typescript
// pages/propostas/PropostaForm.tsx
export function PropostaHabilitacaoForm({
  contratacaoId,
  onSubmit,
}: Props) {
  const form = useForm<PropostaHabilitacaoForm>({
    resolver: zodResolver(propostaHabilitacaoSchema),
    defaultValues: { /* ... */ },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="empresa_nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Empresa</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* mais fields */}
        <Button type="submit">Gerar Proposta</Button>
      </form>
    </Form>
  );
}
```

---

## 9. Autenticação

### 9.1 Auth Provider
```typescript
// lib/auth/AuthProvider.tsx
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <LoadingSpinner />;

  return <>{children}</>;
}
```

### 9.2 Protected Routes
```typescript
// components/auth/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

---

## 10. Responsividade

### 10.1 Breakpoints
```typescript
// tailwind.config.ts
const screens = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};
```

### 10.2 Layout Adaptativo (Filosofia Mobile-First)
- **Mobile First Rigoroso**: O portal B2B será concebido primariamente a partir da visualização em celulares (xs/sm breakpoints). Interfaces nativas com abas horizontais simplificadas para ler o Objeto de licitações extensas on-the-go.
- Mobile: O layout possui Sidebar colapsável focada em ergonomia de polegar (bottom navigation em páginas focadas, hambúrguer global). Leitura de editais com padding limpo usando cores serenas.
- Tablet: Sidebar converte em drawer flexível.
- Desktop: Expansão ultra-wide. As Kanban views (ex. arrastar licitação para status de meta) entram como padrão total da tela.
---

## 11. Performance

### 11.1 Code Splitting
```typescript
// App.tsx
const Dashboard = lazy(() => import('./pages/dashboard/Index'));
const Busca = lazy(() => import('./pages/dashboard/Busca'));
const ContrataroesDetalhe = lazy(() => import('./pages/dashboard/ContrataroesDetalhe'));
```

### 11.2 Image Optimization
```typescript
// Usar next/image ou vite-imagetools
// WebP quando possível
// Lazy loading
```

---

## 12. Testes

### 12.1 Estrutura
```
/src
├── /components
│   └── /__tests__
│       ├── Button.test.tsx
│       └── Card.test.tsx
├── /pages
│   └── /__tests__
│       └── Dashboard.test.tsx
└── /hooks
    └── /__tests__
        └── useContratacoes.test.ts
```

### 12.2 Stack de Testes
- Vitest (unit tests)
- React Testing Library (component tests)
- Playwright (e2e tests)

---

*Versão: 1.0*
*Data: 2026-04-14*