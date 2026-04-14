# Plano: Arquitetura Backend

## Visão Geral

Backend em Node.js com Fastify, Prisma ORM, filas com BullMQ, e integração com Supabase. Estrutura modular com services, routes e jobs separados.

---

## 1. Stack Técnica

| Componente | Tecnologia | Justificativa |
|------------|------------|---------------|
| Plataforma Unificada | **Next.js (App Router/API)** | Permite agrupar Server Actions e endpoints Node.js nativamente com o Front |
| ORM (Acesso a Banco) | Supabase JS Client + Prisma | O Prisma modela de forma tipada os Jobs sever-side, enquanto o cliente Supabase gerencia RLS fluidamente no Front e Middleware |
| Backend Runtime | Vercel Serverless / Edge | Infraestrutura elástica, sem custo idle de servidores ligados |
| Jobs/Filas | **Cron Serverless / Supabase Edge Functions** | Substitui soluções robustas on-prem (como BullMQ) reduzindo custos e integrando-se via Vercel Crons gerenciados pelo Painel Admin |
| Validation | Zod | Type safety universal via T3 Stack approach |
| File Upload | Supabase Storage | Integração nativa e gerenciamento via RLS policies |
| Inteligência Artificial | **API Google Gemini** | Leitura massiva (long context window) por Flash e Pro, parsing de imagem nativo (Multimodal). |

---

## 2. Estrutura de Pastas

```
/backend
├── /src
│   ├── /routes           # Rotas Fastify
│   │   ├── index.ts      # Registro de rotas
│   │   ├── auth.ts       # Rotas de autenticação
│   │   ├── contratacoes.ts
│   │   ├── atas.ts
│   │   ├── contratos.ts
│   │   ├── propostas.ts
│   │   ├── documentos.ts
│   │   ├── usuarios.ts
│   │   ├── billing.ts
│   │   └── webhooks.ts
│   │
│   ├── /services         # Lógica de negócio
│   │   ├── authService.ts
│   │   ├── contratacaoService.ts
│   │   ├── ataService.ts
│   │   ├── contratoService.ts
│   │   ├── propostaService.ts
│   │   ├── documentoService.ts
│   │   ├── usuarioService.ts
│   │   ├── billingService.ts
│   │   ├── notificationService.ts
│   │   └── aiService.ts
│   │
│   ├── /jobs             # Jobs BullMQ
│   │   ├── index.ts      # Setup do scheduler
│   │   ├── cargaInicial.ts
│   │   ├── syncIncremental.ts
│   │   ├── syncItens.ts
│   │   ├── syncDocumentos.ts
│   │   ├── processarAlertas.ts
│   │   ├── verificarPrazos.ts
│   │   └── cleanup.ts
│   │
│   ├── /integrations     # Integrações externas
│   │   ├── /pncp
│   │   │   ├── client.ts
│   │   │   ├── mappers.ts
│   │   │   └── types.ts
│   │   ├── /supabase
│   │   │   └── index.ts
│   │   └── /stripe
│   │       ├── client.ts
│   │       └── webhooks.ts
│   │
│   ├── /plugins          # Plugins Fastify
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   └── cors.ts
│   │
│   ├── /middleware       # Middlewares
│   │   ├── auth.ts
│   │   ├── rateLimit.ts
│   │   └── errorHandler.ts
│   │
│   ├── /utils           # Utilitários
│   │   ├── errors.ts
│   │   ├── helpers.ts
│   │   ├── dates.ts
│   │   └── crypto.ts
│   │
│   ├── /types           # Tipos globais
│   │   └── index.ts
│   │
│   ├── app.ts           # App Fastify
│   ├── server.ts        # Entry point
│   └── worker.ts        # Worker BullMQ
│   │
├── /prisma
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── package.json
└── tsconfig.json
```

---

## 3. Estruturador de Rotas e Funções (Serverless)

Em vez de instanciar Express/Fastify, utilizamos a poderosa camada `<root>/app/api/` do Next.js. Os métodos `GET`/`POST` são geridos em handlers dedicados ou via _React Server Actions_.

### 3.1 Rotas Administrativas e de Controle (Admin Center)
Para compensar a falta de um gerenciador de fila como o Bull Board, criaremos:
```typescript
// /app/api/admin/sync/route.ts
GET    /api/admin/sync/status     # Status do último Cron
POST   /api/admin/sync/trigger    # Executar job on-demand via Serverless Worker
GET    /api/admin/stats           # Monitorar limites impostos pela Stripe e PNCP API
```

### 3.2 Rotas de IA e Drive (Gemini)
```typescript
POST   /api/ia/parse-document        # Converte PDF usando (Docling/Multimodal Pipeline)
POST   /api/ia/match-edital          # Envia metadados ao RAG Gemini para "Score técnico"
GET    /api/ia/drive-sync            # Sincroniza atestado técnico via Google Drive OAuth
```

---

## 4. Services (Lógica de Negócio)

### 4.1 ContratacaoService
```typescript
// services/contratacaoService.ts
export class ContratacaoService {
  constructor(
    private prisma: PrismaClient,
    private pncpClient: PNCPRestClient
  ) {}

  async findAll(filters: ContratacaoFilters): Promise<PaginatedResult<Contratacao>> {
    // Query com filtros
    // Suporte a busca por palavra-chave (full-text)
    // Paginação
  }

  async findById(id: string): Promise<Contratacao | null> {
    // Busca por ID ou numero_controle_pncp
  }

  async findByNumeroControlePNCP(numero: string): Promise<Contratacao | null> {
    // Busca no banco, senão busca no PNCP e armazena
  }

  async syncItens(contratacaoId: string): Promise<void> {
    // Busca itens da API e armazena
  }

  async syncDocumentos(contratacaoId: string): Promise<void> {
    // Busca documentos da API e armazena referências
  }
}
```

### 4.2 PropostaService
```typescript
// services/propostaService.ts
export class PropostaService {
  async create(
    usuarioId: string,
    contratacaoId: string,
    tipo: TipoDocumento,
    dados: Json
  ): Promise<Proposta> {
    // Valida se usuário está acompanhando a contratação
    // Valida limite do plano
    // Cria rascunho
  }

  async gerarPDF(id: string): Promise<string> {
    // Carrega template
    // Substitui placeholders com dados
    // Gera PDF via Puppeteer ou similar
    // Faz upload para Supabase Storage
    // Atualiza status
  }

  async enviar(id: string): Promise<void> {
    // Valida proposta completa
    // Marca como enviada
    // Notifica usuário (futuro: integração com email)
  }
}
```

### 4.3 UsuarioService
```typescript
// services/usuarioService.ts
export class UsuarioService {
  async create(data: CreateUsuarioDTO): Promise<Usuario> { /* ... */ }

  async updatePlano(
    usuarioId: string,
    plano: Plano,
    stripeSubscriptionId: string
  ): Promise<void> {
    // Atualiza plano e IDs do Stripe
  }

  async verificarLimiteItens(usuarioId: string): Promise<boolean> {
    // Busca quantidade de itens do usuário
    // Compara com limite do plano
  }

  async getLimiteItens(plano: Plano): Promise<number> {
    const limites = { FREE: 5, BASIC: 50, PRO: -1, PREMIUM: -1 };
    return limites[plano];
  }
}
```

---

## 5. Middlewares

### 5.1 Auth Middleware
```typescript
// middleware/auth.ts
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return reply.code(401).send({ error: 'Invalid token' });
    }

    request.user = user;
  } catch (err) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}
```

### 5.2 Rate Limiting
```typescript
// middleware/rateLimit.ts
import rateLimit from '@fastify/rate-limit';

export async function rateLimitPlugin(fastify: FastifyInstance) {
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    redis: redisClient,
  });
}
```

### 5.3 Error Handler
```typescript
// middleware/errorHandler.ts
export function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error);

  if (error instanceof ValidationError) {
    return reply.code(400).send({
      error: 'Validation Error',
      details: error.details,
    });
  }

  if (error instanceof NotFoundError) {
    return reply.code(404).send({
      error: 'Not Found',
    });
  }

  return reply.code(500).send({
    error: 'Internal Server Error',
  });
}
```

---

## 6. Jobs e Scheduler (Vercel Cron / Edge Functions)

Substituindo o uso de instâncias ligadas permanentemente (BullMQ/Redis), adotaremos uma orquestração enxuta:

### 6.1 Serverless Cron Jobs Config (`vercel.json`)
```json
{
  "crons": [
    {
      "path": "/api/cron/pncp/incremental",
      "schedule": "*/15 * * * *" 
    },
    {
      "path": "/api/cron/pncp/reverificacao",
      "schedule": "0 6 * * *",
      "comments": "Sincroniza metadados históricos de Licitações já ativas garantindo UPSERT"
    },
    {
      "path": "/api/cron/alertas",
      "schedule": "0 8 * * 1"
    }
  ]
}
```

### 6.2 Endpoint Interno do Scheduler (Protegido por Bearer Cron Token)
```typescript
// app/api/cron/pncp/incremental/route.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Executa service de fetch no PNCP e dispara transações do Prisma
  await executarSyncIncremental();
  return NextResponse.json({ status: "Synced", timestamp: new Date() });
}
```

---

## 7. Integração Stripe

### 7.1 Cliente
```typescript
// integrations/stripe/client.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
```

### 7.2 Webhooks
```typescript
// integrations/stripe/webhooks.ts
export async function handleStripeWebhook(
  payload: Buffer,
  signature: string
) {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await billingService.updateSubscription(subscription);
      break;

    case 'customer.subscription.deleted':
      const deleted = event.data.object;
      await billingService.cancelSubscription(deleted);
      break;

    case 'checkout.session.completed':
      const session = event.data.object;
      await billingService.handleCheckoutComplete(session);
      break;
  }
}
```

---

## 8. Integração PNCP

### 8.1 Cliente HTTP
```typescript
// integrations/pncp/client.ts
export class PNCPRestClient {
  private baseUrl = 'https://pncp.gov.br/api/consulta';
  private lastRequest = 0;
  private minInterval = 200; // 5 req/s

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    await this.waitForRateLimit();

    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, String(v));
      });
    }

    const response = await fetch(url.toString(), {
      headers: { accept: '*/*' },
    });

    if (response.status === 429) {
      await delay(1000);
      return this.get(endpoint, params);
    }

    if (!response.ok) {
      throw new Error(`PNCP API: ${response.status}`);
    }

    return response.json();
  }

  private async waitForRateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    if (elapsed < this.minInterval) {
      await delay(this.minInterval - elapsed);
    }
    this.lastRequest = Date.now();
  }
}
```

---

## 9. Validação de Planos e Limites

### 9.1 Decorator de Plano
```typescript
// middleware/requirePlan.ts
export function requirePlan(...planos: Plano[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const usuario = await getUsuarioFromRequest(request);

    if (!usuario) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    if (!planos.includes(usuario.plano)) {
      return reply.code(403).send({
        error: 'Plan required',
        required: planos,
        current: usuario.plano,
      });
    }
  };
}
```

### 9.2 Uso
```typescript
// routes/propostas.ts
fastify.post('/propostas', {
  preHandler: [authenticate, requirePlan('BASIC', 'PRO', 'PREMIUM')],
  handler: async (request, reply) => {
    // Criar proposta
  }
});
```

---

## 10. Upload de Arquivos

### 10.1 Service
```typescript
// services/documentoService.ts
export class DocumentoService {
  async upload(
    usuarioId: string,
    file: Buffer,
    metadata: { nome: string; tipo: TipoDocumento }
  ): Promise<DocumentoUsuario> {
    // Validar tamanho (10MB)
    // Validar tipo (PDF, DOC, DOCX, JPEG, PNG)
    // Gerar hash SHA256
    // Upload para Supabase Storage
    // Criar registro no banco

    const path = `${usuarioId}/${metadata.tipo}/${filename}`;

    const { data, error } = await supabase.storage
      .from('documentos')
      .upload(path, file, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw new Error('Upload failed');

    return prisma.documentoUsuario.create({
      data: {
        usuario_id: usuarioId,
        nome: metadata.nome,
        tipo: metadata.tipo,
        bucket: 'documentos',
        path,
        filename,
        tamanho: file.length,
        hash: await sha256(file),
      },
    });
  }
}
```

---

## 11. Health Checks

### 11.1 Endpoint
```typescript
// routes/health.ts
fastify.get('/health', async (request, reply) => {
  const [db, redis, pncp] = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkPNCP(),
  ]);

  const healthy = db && redis && pncp;

  return reply.code(healthy ? 200 : 503).send({
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: { db, redis, pncp },
  });
});
```

---

## 12. Variáveis de Ambiente

```env
# Database
DATABASE_URL=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Redis
REDIS_HOST=
REDIS_PORT=6379

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_BASIC=
STRIPE_PRICE_PRO=
STRIPE_PRICE_PREMIUM=

# PNCP (se necessário autenticação futura)
PNCP_API_KEY=

# App
APP_URL=http://localhost:3000
PORT=3001
NODE_ENV=development
```

---

*Versão: 1.0*
*Data: 2026-04-14*