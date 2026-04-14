# Plano: Integração com API PNCP

## Visão Geral

Este documento detalha a estratégia de integração com a API do Portal Nacional de Contratações Públicas (PNCP), incluindo sincronização inicial (batch), atualizações incrementais, tratamento de erros e rate limiting.

---

## 1. Configuração da API

### 1.1 Base URL e Autenticação
```typescript
const PNCP_BASE_URL = 'https://pncp.gov.br/api/consulta';
const SWAGGER_URL = 'https://pncp.gov.br/api/consulta/swagger-ui/index.html';

// Headers padrão
const defaultHeaders = {
  'accept': '*/*',
  'Content-Type': 'application/json'
};
```

### 1.2 Parâmetros de Paginação
```typescript
const PAGINATION = {
  defaultPageSize: 500,  // Máximo recomendado para jobs massivos
  maxRetries: 3,
  retryDelay: 1000,      // ms
};
```

---

## 2. Endpoints e Mapeamento

### 2.1 Contratações (Licitações)
```typescript
// GET /v1/contratacoes/publicacao
interface ContratacoesParams {
  dataInicial: string;      // YYYYMMDD
  dataFinal: string;        // YYYYMMDD
  codigoModalidadeContratacao?: number;
  uf?: string;
  codigoMunicipioIbge?: number;
  cnpj?: string;
  tamanhoPagina?: number;   // max 500
  numeroPagina?: number;
}

interface ContratacoesResponse {
  data: Contratacao[];
  totalRegistros: number;
  totalPaginas: number;
  numeroPagina: number;
  paginasRestantes: number;
  empty: boolean;
}
```

### 2.2 Atas de Registro de Preços
```typescript
// GET /v1/atas
interface AtasParams {
  dataInicial: string;
  dataFinal: string;
  uf?: string;
  tamanhoPagina?: number;
  numeroPagina?: number;
}
```

### 2.3 Contratos
```typescript
// GET /v1/contratos
interface ContratosParams {
  dataInicial: string;
  dataFinal: string;
  uf?: string;
  tamanhoPagina?: number;
  numeroPagina?: number;
}
```

### 2.4 Itens de uma Contratação
```typescript
// GET /v1/contratacoes/{numeroControlePNCP}/itens
interface ItensResponse {
  data: ItemContratacao[];
}
```

### 2.5 Documentos de uma Contratação
```typescript
// GET /v1/contratacoes/{numeroControlePNCP}/documentos
interface DocumentosResponse {
  data: Documento[];
}
```

---

## 3. Tipos de Dados PNCP

### 3.1 Contratacao (mapeamento)
```typescript
interface PNCPContratacao {
  numeroControlePNCP: string;           // PK
  objetoCompra: string;
  modalidadeId: number;                  // 1-13
  tipoInstrumentoConvocatorioId: number; // 1-3
  modoDisputaId?: number;               // 1-6
  criterioJulgamentoId?: number;        // 1,2,4,5,6,8,9

  // Situação
  situacaoCompraId?: number;            // 1-4
  situacaoItemId?: number;              // 1-5

  // Datas
  dataDivulgacao?: string;              // ISO
  dataRecebimentoProposta?: string;     // ISO

  // Valores
  valorTotalEstimado?: number;
  valorTotalHomologado?: number;
  sigiloso?: boolean;

  // Localização
  UF?: string;
  codigoMunicipioIBGE?: number;

  // Órgão
  orgao: {
    cnpj: string;
    nome: string;
    uasg?: string;
    esfera?: string;     // F, E, M
    poder?: string;      // L, E, J
  };

  // SRP
  srp?: boolean;

  // Sub-rogação
  orgaoSubRogado?: {
    cnpj: string;
    nome: string;
  };
}
```

### 3.2 Mapeamento de Enums
```typescript
const MODALIDADE_MAP = {
  1: 'LEILAO_ELETRONICO',
  2: 'DIALOGO_COMPETITIVO',
  3: 'CONCURSO',
  4: 'CONCORRENCIA_ELETRONICA',
  5: 'CONCORRENCIA_PRESENCIAL',
  6: 'PREGAO_ELETRONICO',
  7: 'PREGAO_PRESENCIAL',
  8: 'DISPENSA',
  9: 'INEXIGIBILIDADE',
  10: 'MANIFESTACAO_INTERESSE',
  11: 'PRE_QUALIFICACAO',
  12: 'CREDENCIAMENTO',
  13: 'LEILAO_PRESENCIAL',
};

const SITUACAO_COMPRA_MAP = {
  1: 'DIVULGADA',
  2: 'REVOGADA',
  3: 'ANULADA',
  4: 'SUSPENSA',
};
```

---

## 4. Estratégia de Sincronização

### 4.1 Fase 1: Carga Inicial (Batch)

#### Abordagem
- Chunk por períodos de 3 meses (devido ao volume)
- Execução em horários de baixo tráfego
- Sem rate limiting agressivo

#### Script de Carga Inicial
```typescript
// jobs/cargaInicial.ts
async function executarCargaInicial() {
  const inicio = new Date('2021-01-01'); // Início do PNCP
  const fim = new Date();
  const chunkMeses = 3;

  const chunks = gerarChunksData(inicio, fim, chunkMeses);

  for (const chunk of chunks) {
    console.log(`Processando: ${chunk.inicio} até ${chunk.fim}`);

    await syncContratacoes(chunk.inicio, chunk.fim);
    await syncAtas(chunk.inicio, chunk.fim);
    await syncContratos(chunk.inicio, chunk.fim);

    // Aguardar entre chunks (respect rate limits)
    await delay(2000);
  }
}
```

#### Progresso e Recovery
```typescript
interface CargaProgresso {
  ultimaDataProcessada: string;
  fase: 'contratacoes' | 'atas' | 'contratos';
  paginaAtual: number;
  chunkAtual: number;
  totalChunks: number;
  registrosSyncados: number;
  erros: Array<{data: string, erro: string}>;
}
```

### 4.2 Fase 2: Atualizações Incrementais (Serverless Cron)

#### Job Agendado (via Vercel Cron ou Supabase pg_cron)
Em vez de instâncias fixas, um cron dispara um hit na nossa rota REST `/api/cron/pncp/incremental`:
```typescript
// app/api/cron/pncp/incremental/route.ts
export async function GET(req: Request) {
  // O Cron bate aqui a cada 15 min.
  const ultimos7dias = {
    dataInicial: formatDate(subDays(new Date(), 7)),
    dataFinal: formatDate(new Date())
  };

  // Buscamos as novas entidades e fazemos o upsert
  await Promise.all([
    syncContratacoes(ultimos7dias.dataInicial, ultimos7dias.dataFinal),
    syncAtas(ultimos7dias.dataInicial, ultimos7dias.dataFinal),
    syncContratos(ultimos7dias.dataInicial, ultimos7dias.dataFinal),
  ]);
  
  return NextResponse.json({ success: true });
}
```

#### Re-sincronização de Licitações Ativas (Deep Update)
Além de baixar as recém-publicadas (últimos 7 dias), também rodamos um job noturno que busca **licitações da nossa base que ainda não terminaram** (fase de lances, pendentes) e as forçam a buscar dados novos (retificações de edital, alteração de datas) na API PNCP usando a PK `numeroControlePNCP`.

### 4.3 Fase 3: Sync On-Demand

- Quando usuário busca um PNCP específico que não existe no DB
- Verificação de status antes de deadline de propostas

---

## 5. Implementação do Cliente HTTP

### 5.1 Cliente com Retry e Rate Limiting
```typescript
// services/pncpClient.ts
class PNCPRestClient {
  private baseUrl = PNCP_BASE_URL;
  private requestQueue: Array<() => Promise<any>> = [];
  private lastRequestTime = 0;
  private minRequestInterval = 200; // 5 requests por segundo

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    // Rate limiting
    await this.awaitRateLimit();

    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, String(v));
      });
    }

    const response = await fetch(url.toString(), {
      headers: defaultHeaders,
    });

    if (!response.ok) {
      throw new PNCPError(response.status, await response.text());
    }

    return response.json();
  }

  private async awaitRateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minRequestInterval) {
      await delay(this.minRequestInterval - elapsed);
    }
    this.lastRequestTime = Date.now();
  }
}
```

### 5.2 Tratamento de Erros
```typescript
class PNCPError extends Error {
  constructor(
    public statusCode: number,
    public body: string
  ) {
    super(`PNCP API Error: ${statusCode}`);
  }

  isRateLimit() {
    return this.statusCode === 429;
  }

  isServerError() {
    return this.statusCode >= 500;
  }

  isNotFound() {
    return this.statusCode === 404;
  }
}
```

---

## 6. Transformação de Dados

### 6.1 Mapper PNCP → DB
```typescript
// services/mappers/contratacaoMapper.ts
function mapPNCPToContratacao(raw: PNCPContratacao): Prisma.ContratacaoCreateInput {
  return {
    numero_controle_pncp: raw.numeroControlePNCP,
    objeto: raw.objetoCompra,
    codigo_modalidade: MODALIDADE_MAP[raw.modalidadeId] ?? 'PREGAO_ELETRONICO',
    tipo_instrumento: TIPO_INSTRUMENTO_MAP[raw.tipoInstrumentoConvocatorioId],
    modo_disputa: raw.modoDisputaId ? MODO_DISPUTA_MAP[raw.modoDisputaId] : null,
    criterio_julgamento: raw.criterioJulgamentoId ? CRITERIO_MAP[raw.criterioJulgamentoId] : null,
    situacao: SITUACAO_COMPRA_MAP[raw.situacaoCompraId] ?? 'DIVULGADA',
    situacao_item: raw.situacaoItemId ? SITUACAO_ITEM_MAP[raw.situacaoItemId] : null,
    data_divulgacao: raw.dataDivulgacao ? new Date(raw.dataDivulgacao) : null,
    data_recebimento_propostas: raw.dataRecebimentoProposta ? new Date(raw.dataRecebimentoProposta) : null,
    valor_estimado: raw.valorTotalEstimado ? new Prisma.Decimal(raw.valorTotalEstimado) : null,
    valor_homologado: raw.valorTotalHomologado ? new Prisma.Decimal(raw.valorTotalHomologado) : null,
    valor_sigiloso: raw.sigiloso ?? false,
    uf: raw.UF,
    codigo_municipio_ibge: raw.codigoMunicipioIBGE,
    orgao_nome: raw.orgao.nome,
    orgao_cnpj: raw.orgao.cnpj,
    orgao_uasg: raw.orgao.uasg,
    orgao_esfera: raw.orgao.esfera as Esfera,
    orgao_poder: raw.orgao.poder as Poder,
    srp: raw.srp ?? false,
    raw_data: raw,
  };
}
```

---

## 7. Bulk Operations

### 7.1 Upsert com Batch
```typescript
// services/contratacaoService.ts
async function upsertContratacoesBatch(items: PNCPContratacao[]): Promise<number> {
  const operations = items.map(item => {
    return prisma.contratacao.upsert({
      where: { numero_controle_pncp: item.numeroControlePNCP },
      update: {
        ...mapPNCPToContratacao(item),
        updated_at: new Date(),
        last_sync_at: new Date(),
      },
      create: {
        ...mapPNCPToContratacao(item),
      },
    });
  });

  // Executar em batches de 100
  const BATCH_SIZE = 100;
  let inserted = 0;

  for (let i = 0; i < operations.length; i += BATCH_SIZE) {
    const batch = operations.slice(i, i + BATCH_SIZE);
    const results = await prisma.$transaction(batch);
    inserted += results.length;

    // Progress logging
    console.log(`Progresso: ${inserted}/${operations.length}`);
  }

  return inserted;
}
```

---

## 8. Sync de Dados Relacionados

### 8.1 Sync de Itens (filhos)
```typescript
async function syncItensContratacao(contratacaoId: string) {
  const response = await client.get<ItensResponse>(
    `/v1/contratacoes/${contratacaoId}/itens`
  );

  for (const item of response.data) {
    await prisma.itemContratacao.upsert({
      where: {
        contratacao_id_numero_item: {
          contratacao_id: contratacaoId,
          numero_item: item.numeroItem,
        }
      },
      update: { /* ... */ },
      create: { /* ... */ },
    });
  }
}
```

### 8.2 Sync de Documentos
```typescript
async function syncDocumentosContratacao(contratacaoId: string) {
  const response = await client.get<DocumentosResponse>(
    `/v1/contratacoes/${contratacaoId}/documentos`
  );

  for (const doc of response.data) {
    // Não baixamos o arquivo, apenas salvamos a referência
    await prisma.documentoPncp.upsert({
      where: { id: doc.id },
      update: { /* ... */ },
      create: {
        contratacao_id: contratacaoId,
        tipo_documento: doc.tipo,
        descricao: doc.descricao,
        nome_arquivo: doc.nomeArquivo,
        url: `https://pncp.gov.br/api/consulta/v1/contratacoes/${contratacaoId}/documentos/${doc.id}`,
        content_type: doc.contentType,
        tamanho: doc.tamanho,
        documento_id_pncp: doc.id,
      },
    });
  }
}
```

---

## 9. Logging e Monitoramento

### 9.1 SyncLog
```typescript
async function logSync(
  tipo: string,
  status: 'iniciando' | 'sucesso' | 'erro',
  stats?: { total: number; novos: number; atualizados: number },
  error?: Error
) {
  await prisma.syncLog.create({
    data: {
      tipo,
      status,
      registros_total: stats?.total,
      registros_novos: stats?.novos,
      registros_atualizados: stats?.atualizados,
      erro_mensagem: error?.message,
      erro_detalhes: error ? { stack: error.stack } : null,
      completed_at: status !== 'iniciando' ? new Date() : null,
    },
  });
}
```

### 9.2 Métricas
```typescript
interface SyncMetrics {
  totalRegistros: number;
  novosRegistros: number;
  registrosAtualizados: number;
  duracaoMs: number;
  requestsFeitos: number;
  errosEncontrados: number;
}
```

---

## 10. Estrutura de Jobs (Route Handlers)

```
/app/api/cron/
├── /pncp
│   ├── /incremental/route.ts   # Sync contínuo (novos)
│   ├── /reverificacao/route.ts # Atualização de editais ativos
│   └── /carga/route.ts         # Disparo manual de macro-batch
├── /alertas/route.ts           # Envio de alertas de keywords
└── /cleanup/route.ts           # Limpeza de logs
```

---

## 11. Health Check

```typescript
// GET /api/health/pncp
async function checkPNCPHealth() {
  const start = Date.now();
  try {
    await client.get('/v1/contratacoes/publicacao', {
      dataInicial: formatDate(subDays(new Date(), 1)),
      dataFinal: formatDate(new Date()),
      tamanhoPagina: 1,
    });
    return { status: 'healthy', latency: Date.now() - start };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
```

---

## 12. Limitações e Considerações

### 12.1 Rate Limiting
- Recommended: 5 requests/segundo
- implementar exponential backoff em caso de 429

### 12.2 Volume de Dados
- PNCP tem milhões de registros desde 2021
- Carga inicial pode levar semanas
- Sugestão: começar com dados de 2023+

### 12.3 Dados Sigilosos
- Alguns valores podem vir como sigilosos
- Não tentar forçar busca desses valores
- Marcar com flag `valor_sigiloso = true`

### 12.4 Desatualização
- API pode ter delay de até 24h
- Não confiar 100% em dados para prazos críticos
- Sempre verificar no portal oficial

---

*Versão: 1.0*
*Data: 2026-04-14*