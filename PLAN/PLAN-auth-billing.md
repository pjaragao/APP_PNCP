# Plano: Autenticação e Sistema de Billing

## Visão Geral

Sistema de autenticação com Supabase Auth e cobrança recorrente com Stripe. Integração completa de assinaturas com webhooks para sincronização de status.

---

## 1. Autenticação (Supabase)

### 1.1 Métodos de Login

| Método | Descrição | Use Case |
|--------|-----------|----------|
| Email/Password | Login tradicional | Usuários que preferem senha |
| Google OAuth | Login com Google | SSO rápido |
| Magic Link | Link no email | Recuperação de acesso sem senha |

### 1.2 Fluxo de Registro
```typescript
// POST /api/auth/register
async function register(
  email: string,
  password: string,
  nome: string,
  empresa_nome?: string
) {
  // 1. Criar usuário no Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome,
        empresa_nome,
      },
    },
  });

  if (error) throw error;

  // 2. Criar perfil na tabela usuarios (via trigger ou manual)
  // Opcional: já definir plano FREE

  return {
    user: data.user,
    session: data.session,
  };
}
```

### 1.3 Fluxo de Login
```typescript
// POST /api/auth/login
async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Verificar se usuário está bloqueado (status_pagamento)
  const usuario = await getUsuario(data.user.id);
  if (usuario.status_pagamento === 'UNPAID') {
    await supabase.auth.signOut();
    throw new Error('Conta suspensa por falta de pagamento');
  }

  return data;
}
```

### 1.4 Magic Link
```typescript
// POST /api/auth/magic-link
async function sendMagicLink(email: string) {
  const redirectTo = `${APP_URL}/auth/callback`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) throw error;
}

// Callback (frontend)
async function handleMagicLinkCallback() {
  // Supabase lida com o token na URL automaticamente
  const { data: { session }, error } = await supabase.auth.getSession();

  if (session) {
    // Redirecionar para dashboard
  }
}
```

### 1.5 OAuth Google
```typescript
// GET /api/auth/google
async function initiateGoogleAuth() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${APP_URL}/auth/callback`,
    },
  });

  if (error) throw error;

  return data.url; // Redirecionar para Google
}
```

### 1.6 Refresh Token
```typescript
// Configuração do Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
```

---

## 2. Proteção de Rotas

### 2.1 Middleware de Autenticação
```typescript
// backend/src/middleware/auth.ts
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Pega token do header
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'No token provided' });
  }

  const token = authHeader.slice(7);

  // Valida token com Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return reply.code(401).send({ error: 'Invalid token' });
  }

  // Anexa usuário à request
  request.user = user;
}
```

### 2.2 Protected Routes no Frontend
```typescript
// frontend/src/components/auth/ProtectedRoute.tsx
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

---

## 3. Gerenciamento de Sessões

### 3.1 Estrutura da Sessão
```typescript
interface Session {
  user: {
    id: string;
    email: string;
    nome?: string;
    empresa_nome?: string;
    plano: Plano;
    status_pagamento: StatusPagamento;
  };
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
```

### 3.2 Logout
```typescript
// POST /api/auth/logout
async function logout(request: FastifyRequest, reply: FastifyReply) {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;

  return reply.send({ success: true });
}
```

---

## 4. Sistema de Billing (Stripe)

### 4.1 Planos e Preços

| Plano | Preço | Itens Acompanhados | Propostas/Mês | Features |
|-------|-------|-------------------|---------------|----------|
| Free | R$0 | 5 | 0 | Busca, visualização |
| Basic | R$99/mês | 50 | 10 | + Propostas, alertas email |
| Pro | R$299/mês | Ilimitado | 100 | + AI Analysis, priority support |
| Premium | R$599/mês | Ilimitado | Ilimitado | + API Access, white-label |

### 4.2 Stripe Products/Price IDs
```typescript
const PRICES = {
  BASIC: 'price_xxxxxxxxxxxxx',
  PRO: 'price_xxxxxxxxxxxxx',
  PREMIUM: 'price_xxxxxxxxxxxxx',
};

const PLAN_LIMITS = {
  FREE: { itens: 5, propostas: 0 },
  BASIC: { itens: 50, propostas: 10 },
  PRO: { itens: -1, propostas: 100 },
  PREMIUM: { itens: -1, propostas: -1 },
};
```

### 4.3 Criar Sessão de Checkout
```typescript
// POST /api/billing/checkout
async function createCheckoutSession(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { priceId } = request.body;
  const user = request.user;

  // Buscar customer do Stripe ou criar novo
  let customerId = user.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;

    // Salvar no banco
    await updateUsuario(user.id, { stripe_customer_id: customerId });
  }

  // Criar sessão de checkout
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/dashboard?checkout=success`,
    cancel_url: `${APP_URL}/dashboard?checkout=cancelled`,
    subscription_data: {
      metadata: { user_id: user.id },
    },
  });

  return reply.send({ url: session.url });
}
```

### 4.4 Customer Portal
```typescript
// GET /api/billing/portal
async function createPortalSession(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user;

  if (!user.stripe_customer_id) {
    return reply.code(400).send({ error: 'No subscription' });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${APP_URL}/dashboard/billing`,
  });

  return reply.send({ url: session.url });
}
```

---

## 5. Webhooks Stripe

### 5.1 Endpoint
```typescript
// POST /api/billing/webhook
// Raw body é necessário para verificar assinatura
async function handleWebhook(request: FastifyRequest, reply: FastifyReply) {
  const signature = request.headers['stripe-signature']!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return reply.code(400).send({ error: 'Invalid signature' });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object);
      break;
  }

  return reply.send({ received: true });
}
```

### 5.2 Handler: Checkout Completed
```typescript
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  const userId = subscription.metadata.user_id;
  const priceId = subscription.items.data[0].price.id;
  const plano = getPlanFromPriceId(priceId);

  await prisma.usuario.update({
    where: { id: userId },
    data: {
      plano,
      stripe_subscription_id: subscription.id,
      status_pagamento: 'ACTIVE',
      plano_expira_em: new Date(subscription.current_period_end * 1000),
    },
  });
}
```

### 5.3 Handler: Subscription Updated
```typescript
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;
  const priceId = subscription.items.data[0].price.id;
  const plano = getPlanFromPriceId(priceId);

  let statusPagamento: StatusPagamento;

  switch (subscription.status) {
    case 'active':
      statusPagamento = 'ACTIVE';
      break;
    case 'past_due':
      statusPagamento = 'PAST_DUE';
      break;
    case 'canceled':
      statusPagamento = 'CANCELED';
      break;
    default:
      statusPagamento = 'TRIAL';
  }

  await prisma.usuario.update({
    where: { id: userId },
    data: {
      plano,
      status_pagamento: statusPagamento,
      plano_expira_em: new Date(subscription.current_period_end * 1000),
    },
  });
}
```

### 5.4 Handler: Payment Failed
```typescript
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const usuario = await prisma.usuario.findFirst({
    where: { stripe_customer_id: customerId },
  });

  if (usuario) {
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { status_pagamento: 'PAST_DUE' },
    });

    // Enviar email de cobrança
    await sendPaymentFailedEmail(usuario.email);
  }
}
```

### 5.5 Handler: Subscription Deleted
```typescript
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.user_id;

  await prisma.usuario.update({
    where: { id: userId },
    data: {
      plano: 'FREE',
      stripe_subscription_id: null,
      status_pagamento: 'CANCELED',
      plano_expira_em: null,
    },
  });
}
```

---

## 6. Limites e Verificações

### 6.1 Verificar Limite de Itens
```typescript
// services/usuarioService.ts
async function podeAcompanhar(usuarioId: string): Promise<boolean> {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: { itens_acompanhados: true },
  });

  if (!usuario) throw new Error('Usuário não encontrado');

  const limite = PLAN_LIMITS[usuario.plano].itens;
  const atual = usuario.itens_acompanhados.length;

  return limite === -1 || atual < limite;
}
```

### 6.2 Verificar Limite de Propostas
```typescript
async function podeCriarProposta(usuarioId: string): Promise<boolean> {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    include: {
      propostas: {
        where: {
          created_at: { gte: startOfMonth(new Date()) },
        },
      },
    },
  });

  const limite = PLAN_LIMITS[usuario.plano].propostas;
  const atual = usuario.propostas.length;

  return limite === -1 || atual < limite;
}
```

### 6.3 Middleware de Limite
```typescript
// middleware/checkLimits.ts
export async function checkItemLimit(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const pode = await podeAcompanhar(request.user.id);

  if (!pode) {
    return reply.code(403).send({
      error: 'Limit reached',
      message: 'Limite de itens acompanhados atingido. Atualize seu plano.',
      upgradeUrl: '/dashboard/billing',
    });
  }
}
```

---

## 7. Fluxo de Upgrade

### 7.1 Tela de Billing (Frontend)
```typescript
// pages/dashboard/Billing.tsx
export function BillingPage() {
  const { user } = useAuth();
  const { data: customerPortalUrl } = useQuery(['billing-portal'], () =>
    api.billing.getPortalUrl()
  );

  return (
    <div>
      <h1>Plano Atual: {user.plano}</h1>

      {user.status_pagamento === 'PAST_DUE' && (
        <Alert type="warning">
          Pagamento pendente. Atualize seu método de pagamento.
        </Alert>
      )}

      <PlanCard
        plano="BASIC"
        preco="R$ 99/mês"
        features={['50 itens', '10 propostas']}
        current={user.plano === 'BASIC'}
      />

      <PlanCard
        plano="PRO"
        preco="R$ 299/mês"
        features={['Ilimitados itens', '100 propostas', 'AI Analysis']}
        current={user.plano === 'PRO'}
      />

      <Button onClick={() => window.open(customerPortalUrl)}>
        Gerenciar Assinatura
      </Button>
    </div>
  );
}
```

### 7.2 Troca de Plano
```typescript
// POST /api/billing/change-plan
async function changePlan(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { priceId } = request.body;
  const user = request.user;

  // Obter assinatura atual
  if (!user.stripe_subscription_id) {
    return reply.code(400).send({ error: 'No active subscription' });
  }

  // Atualizar assinatura
  const subscription = await stripe.subscriptions.update(
    user.stripe_subscription_id,
    {
      items: [{ id: subscription.items.data[0].id, price: priceId }],
      proration_behavior: 'create_prorations',
    }
  );

  return reply.send({ success: true });
}
```

---

## 8. Cancelamento

### 8.1 Cancelar Assinatura
```typescript
// POST /api/billing/cancel
async function cancelSubscription(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user;

  if (!user.stripe_subscription_id) {
    return reply.code(400).send({ error: 'No active subscription' });
  }

  // Cancelar no final do período
  await stripe.subscriptions.update(user.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  return reply.send({
    success: true,
    message: 'Assinatura cancelada. Válida até o fim do período.',
  });
}
```

### 8.2 Reativar
```typescript
// POST /api/billing/reactivate
async function reactivateSubscription(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user;

  await stripe.subscriptions.update(user.stripe_subscription_id, {
    cancel_at_period_end: false,
  });

  return reply.send({ success: true });
}
```

---

## 9. Período de Trial

### 9.1 Configuração
- 7 dias de trial para novos usuários
- Stripe trial settings no preço

### 9.2 Status During Trial
```typescript
// Durante trial, usuário tem acesso PRO temporário
// Status = 'TRIAL'
// Ao fim do trial, se não pagar: downgrade para FREE
```

---

## 10. Locking de Features

### 10.1 Componente de Feature Gate
```typescript
// components/billing/FeatureGate.tsx
interface FeatureGateProps {
  feature: 'propostas' | 'ai_analysis' | 'api_access';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { user } = useAuth();

  const hasAccess = {
    propostas: ['BASIC', 'PRO', 'PREMIUM'].includes(user.plano),
    ai_analysis: ['PRO', 'PREMIUM'].includes(user.plano),
    api_access: ['PREMIUM'].includes(user.plano),
  };

  if (hasAccess[feature]) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}
```

### 10.2 Usage in Component
```typescript
// pages/contratacao/PropostaActions.tsx
<FeatureGate feature="propostas" fallback={<UpgradePrompt />}>
  <Button onClick={gerarProposta}>Gerar Proposta</Button>
</FeatureGate>

<FeatureGate feature="ai_analysis" fallback={null}>
  <Button onClick={analisarAcervo}>Analisar com AI</Button>
</FeatureGate>
```

---

## 11. Edge Cases

### 11.1 payment_failed → tentivas
```typescript
// Stripe tenta cobrar 3 vezes antes de marcar como past_due
// Notificar usuário em cada tentativa
// Após 3 falhas, marcar UNPAID e restringir acesso
```

### 11.2 Chargebacks
```typescript
// Se usuário fazer chargeback, Stripe notifica via webhook
// event.type = 'charge.dispute.created'
// Suspender conta temporariamente
```

### 11.3 Expiry de token durante checkout
```typescript
// Ao voltar do Stripe, renovar sessão se necessário
// Verificar status da assinatura
```

---

## 12. Testes

### 12.1 Mock do Stripe
```typescript
// mocks/stripe.ts
export const mockStripe = {
  checkout: {
    sessions: {
      create: jest.fn(),
    },
  },
  subscriptions: {
    update: jest.fn(),
    retrieve: jest.fn(),
  },
  customers: {
    create: jest.fn(),
  },
  billingPortal: {
    sessions: {
      create: jest.fn(),
    },
  },
};
```

### 12.2 Testes de Integração
```typescript
describe('Billing Flow', () => {
  it('should create checkout session', async () => {
    const res = await request(app)
      .post('/api/billing/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ priceId: PRICES.BASIC });

    expect(res.status).toBe(200);
    expect(res.body.url).toBeDefined();
  });

  it('should handle webhook', async () => {
    const webhookBody = { /* ... */ };
    const signature = stripe.webhooks.constructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: { object: mockSession },
    });

    const res = await request(app)
      .post('/api/billing/webhook')
      .set('stripe-signature', 'test')
      .send(webhookBody);

    expect(res.status).toBe(200);
  });
});
```

---

*Versão: 1.0*
*Data: 2026-04-14*