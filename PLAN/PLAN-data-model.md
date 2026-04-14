# Plano: Modelo de Dados e Schema do Banco

## Visão Geral

Este documento detalha o modelo de dados completo para a aplicação PNCP Insight, utilizando Supabase (PostgreSQL) como banco de dados relacional.

---

## 1. Schema do Prisma (Backend)

### 1.1 Enum Types

```prisma
enum Modalidade {
  LEILAO_ELETRONICO        // 1
  DIALOGO_COMPETITIVO      // 2
  CONCURSO                 // 3
  CONCORRENCIA_ELETRONICA  // 4
  CONCORRENCIA_PRESENCIAL  // 5
  PREGAO_ELETRONICO        // 6
  PREGAO_PRESENCIAL        // 7
  DISPENSA                 // 8
  INEXIGIBILIDADE          // 9
  MANIFESTACAO_INTERESSE   // 10
  PRE_QUALIFICACAO         // 11
  CREDENCIAMENTO           // 12
  LEILAO_PRESENCIAL        // 13
}

enum TipoInstrumento {
  EDITAL                           // 1
  AVISO_CONTRATACAO_DIRETA        // 2
  ATO_AUTORIZANDO_CONTRATACAO_DIRETA // 3
}

enum SituacaoContratacao {
  DIVULGADA  // 1
  REVOGADA   // 2
  ANULADA    // 3
  SUSPENSA   // 4
}

enum SituacaoItem {
  EM_ANDAMENTO  // 1
  HOMOLOGADO    // 2
  CANCELADO     // 3
  DESERTO       // 4
  FRACASSADO    // 5
}

enum ModoDisputa {
  ABERTO            // 1
  FECHADO           // 2
  ABERTO_FECHADO    // 3
  DISPENSA_DISPUTA  // 4
  NA                // 5
  FECHADO_ABERTO    // 6
}

enum CriterioJulgamento {
  MENOR_PRECO        // 1
  MAIOR_DESCONTO     // 2
  TECNICA_E_PRECO    // 4
  MAIOR_LANCE        // 5
  MAIOR_RETORNO      // 6
  MELHOR_TECNICA     // 8
  CONTEUDO_ARTISTICO // 9
}

enum TipoContrato {
  CONTRATO_INICIAL // 1
  COMODATO         // 2
  CONCESSAO        // 4
  CONVENIO         // 6
  NOTA_EMPENHO     // 7
  TED              // 9
}

enum TermoAdicional {
  RESCISÃO       // 1
  ADITIVO        // 2
  APOSTILAMENTO  // 3
}

enum PorteEmpresa {
  ME    // 1 - Microempresa
  EPP   // 2 - Empresa Pequeno Porte
  OUTROS // 3 - Demais Entidades
}

enum Esfera {
  FEDERAL  // F
  ESTADUAL // E
  MUNICIPAL // M
}

enum Poder {
  LEGISLATIVO // L
  EXECUTIVO   // E
  JUDICIARIO  // J
}

enum StatusAcompanhamento {
  ACOMPANHANDO
  PARTICIPANDO
  PROPOSTA_ENVIADA
  HOMOLOGADO_VENCIDO
  HOMOLOGADO_PERDIDO
  CANCELADO
}

enum TipoDocumento {
  HABILITACAO
  TECNICA
  FINANCEIRA
  CERTIDAO
  ATESTADO
  PORTFOLIO
}

enum StatusProposta {
  RASCUNHO
  GERADA
  ENVIADA
}

enum TipoQuestionamento {
  QUESTIONAMENTO
  IMPUGNACAO
}

enum StatusQuestionamento {
  PENDENTE
  ENVIADO
  RESPONDIDO
}

enum StatusPagamento {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
}

enum Plano {
  FREE
  BASIC
  PRO
  PREMIUM
}
```

---

## 2. Modelos Principais

### 2.1 Usuario

```prisma
model Usuario {
  id                   String   @id @default(uuid())
  email                String   @unique
  nome                 String?
  empresa_nome         String?
  empresa_cnpj         String?  @unique
  empresa_inscricao_estadual String?
  empresa_inscricao_municipal String?
  empresa_endereco     String?
  empresa_telefone     String?
  empresa_porte        PorteEmpresa?

  plano              Plano     @default(FREE)
  status_pagamento   StatusPagamento @default(TRIAL)
  stripe_customer_id    String?   @unique
  stripe_subscription_id String?  @unique
  plano_expira_em      DateTime?

  preferencias_filtros Json?    // Filtros padrão salvos

  created_at         DateTime  @default(now())
  updated_at         DateTime  @updatedAt

  // Relations
  itens_acompanhados     UsuarioItem[]
  documentos             DocumentoUsuario[]
  propostas              Proposta[]
  questionamentos        Questionamento[]
  acervos_tecnicos       AcervoTecnico[]
  alertas                Alerta[]

  @@map("usuarios")
}
```

### 2.2 Contratacao (Licitação)

```prisma
model Contratacao {
  id                      String   @id @default(uuid())
  numero_controle_pncp    String   @unique

  // Identificação
  objeto                  String
  codigo_modalidade       Modalidade
  tipo_instrumento        TipoInstrumento
  modo_disputa            ModoDisputa?
  criterio_julgamento     CriterioJulgamento?

  // Status
  situacao                SituacaoContratacao @default(DIVULGADA)
  situacao_item           SituacaoItem?       @default(EM_ANDAMENTO)

  // Datas
  data_divulgacao         DateTime?
  data_recebimento_propostas DateTime?
  data_inicial            DateTime
  data_final              DateTime
  vigencia_inicio         DateTime?
  vigencia_fim            DateTime?

  // Valores
  valor_estimado          Decimal?  @db.Decimal(15,2)
  valor_homologado        Decimal?  @db.Decimal(15,2)
  valor_sigiloso          Boolean   @default(false)

  // Localização
  uf                      String?   // EX: MG, SP
  codigo_municipio_ibge   Int?
  municipio_nome          String?

  // Órgão
  orgao_nome              String
  orgao_cnpj              String
  orgao_uasg              String?
  orgao_esfera            Esfera?
  orgao_poder             Poder?

  // SRP
  srp                     Boolean   @default(false)

  // Dados raw
  raw_data                Json?

  // Timestamps
  created_at              DateTime  @default(now())
  updated_at              DateTime  @updatedAt
  last_sync_at            DateTime  @default(now())

  // Relations
  itens                   ItemContratacao[]
  atas                    Ata[]
  contratos               Contrato[]
  documentos              DocumentoPncp[]
  usuarios_acompanhando   UsuarioItem[]
  propostas               Proposta[]
  questionamentos         Questionamento[]
  editais                 Edital[]

  @@index([uf])
  @@index([codigo_modalidade])
  @@index([data_recebimento_propostas])
  @@index([created_at])
  @@map("contratacoes")
}
```

### 2.3 ItemContratacao

```prisma
model ItemContratacao {
  id                String   @id @default(uuid())
  contratacao_id    String

  numero_item       Int
  descricao         String
  quantidade        Decimal  @db.Decimal(15,3)
  unidade           String?
  valor_unitario    Decimal? @db.Decimal(15,2)
  valor_total       Decimal? @db.Decimal(15,2)
  valor_sigiloso    Boolean  @default(false)

  cataiogo_codigo   String?  // Código do catálogo federal
  cataiogo_descricao String?

  created_at        DateTime @default(now())

  // Relations
  contratacao       Contratacao @relation(fields: [contratacao_id], references: [id], onDelete: Cascade)

  @@unique([contratacao_id, numero_item])
  @@map("itens_contratacao")
}
```

### 2.4 Ata (Registro de Preços)

```prisma
model Ata {
  id                          String   @id @default(uuid())
  numero_controle_pncp_ata    String   @unique
  contratacao_id              String?

  // Datas
  data_assinatura             DateTime?
  vigencia_inicio             DateTime
  vigencia_fim                DateTime
  data_publicacao             DateTime?

  //Fornecedores
  fornecedores                Json?    // Array de {cnpj, nome, item}

  // Órgão (para DRAs/caronas)
  orgao_responsavel           String?
  orgao_cnpj                  String?
  orgao_subrogado_cnpj        String?

  // Status
  ativa                       Boolean  @default(true)

  raw_data                    Json?

  created_at                  DateTime @default(now())
  updated_at                  DateTime @updatedAt

  // Relations
  contratacao                 Contratacao? @relation(fields: [contratacao_id], references: [id])
  usuarios_acompanhando       UsuarioItem[]

  @@map("atas")
}
```

### 2.5 Contrato

```prisma
model Contrato {
  id                      String   @id @default(uuid())
  numero_contrato         String?
  numero_controle_pncp    String   @unique
  contratacao_id          String?

  // Tipo
  tipo_contrato           TipoContrato
  termo_tipo              TermoAdicional?

  //Natureza
  receita                 Boolean  // true = órgão arrecada, false = paga fornecedor

  // Fornecedor
  fornecedor_tipo         String?  // PJ, PF, PE
  fornecedor_cnpj         String?
  fornecedor_nome         String?
  fornecedor_subcontratado_cnpj String?
  fornecedor_subcontratado_nome String?

  // Valores
  valor_inicial           Decimal?  @db.Decimal(15,2)
  valor_acumulado         Decimal?  @db.Decimal(15,2)
  valor_parcelas          Int?
  valor_sigiloso          Boolean   @default(false)

  // Vigência
  vigencia_inicio         DateTime?
  vigencia_fim            DateTime?
  vigencia_vigente        Boolean   @default(true)

  // Órgão
  orgao_nome              String?
  orgao_cnpj              String?

  // Dados extras
  numero_parcelas         Int?
  url_cipi                String?   // Plano Integrador de Investimentos

  raw_data                Json?

  created_at              DateTime  @default(now())
  updated_at              DateTime  @updatedAt

  // Relations
  contratacao             Contratacao? @relation(fields: [contratacao_id], references: [id])
  usuarios_acompanhando   UsuarioItem[]
  termos                  Termo[]

  @@map("contratos")
}
```

### 2.6 Termo (Aditivos, Rescisões, etc)

```prisma
model Termo {
  id                  String   @id @default(uuid())
  contrato_id         String

  tipo                TermoAdicional
  numero_termo        String?
  data_assinatura     DateTime?

  // Alterações
  valor_alterado      Decimal?  @db.Decimal(15,2)
  prazo_alterado      Int?      // dias

  descricao           String?

  raw_data            Json?

  created_at          DateTime  @default(now())

  // Relations
  contrato            Contrato  @relation(fields: [contrato_id], references: [id], onDelete: Cascade)

  @@map("termos")
}
```

---

## 3. Modelos de Relacionamento

### 3.1 UsuarioItem (Itens Acompanhados)

```prisma
model UsuarioItem {
  id            String   @id @default(uuid())
  usuario_id    String
  item_type     String   // 'contratacao' | 'ata' | 'contrato'
  item_id       String

  status        StatusAcompanhamento @default(ACOMPANHANDO)

  // Notificações
  notify_email  Boolean  @default(true)
  notify_push   Boolean  @default(false)

  // Dados do momento do follow
  seguido_em    DateTime @default(now())
  started_at    DateTime? // Quando começou a participar
  ended_at      DateTime? // Quando terminou

  // Relations
  usuario       Usuario       @relation(fields: [usuario_id], references: [id], onDelete: Cascade)

  // Polymorphic relations
  contratacao   Contratacao?  @relation(fields: [item_id], references: [id], map: "usuario_item_contratacao")
  ata           Ata?          @relation(fields: [item_id], references: [id], map: "usuario_item_ata")
  contrato      Contrato?     @relation(fields: [item_id], references: [id], map: "usuario_item_contrato")

  @@unique([usuario_id, item_type, item_id])
  @@map("usuario_itens")
}
```

---

## 4. Modelos de Documentos

### 4.1 DocumentoPncp (Referências aos Documentos do PNCP)

```prisma
model DocumentoPncp {
  id                String   @id @default(uuid())
  contratacao_id    String

  tipo_documento    String?  // 'edital', 'anexo', 'resultado', etc
  descricao         String?
  nome_arquivo      String?

  // URL direta PNCP (não baixamos o arquivo)
  url               String
  content_type      String?
  tamanho           BigInt?

  // Identificação PNCP
  documento_id_pncp String?

  created_at        DateTime @default(now())

  // Relations
  contratacao       Contratacao @relation(fields: [contratacao_id], references: [id], onDelete: Cascade)

  @@map("documentos_pncp")
}
```

### 4.2 DocumentoUsuario

```prisma
model DocumentoUsuario {
  id                String   @id @default(uuid())
  usuario_id        String

  nome              String
  descricao         String?

  tipo              TipoDocumento

  // Storage
  bucket            String   @default("documentos")
  path              String
  filename          String
  content_type      String?
  tamanho           BigInt?
  hash              String?  // SHA256

  // Metadados
  tags              String[] // ['qualificação', 'fiscal', etc]
  validade          DateTime? // Para certidões

  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  // Relations
  usuario           Usuario @relation(fields: [usuario_id], references: [id], onDelete: Cascade)
  propostas         Proposta[]
  acervos           AcervoTecnico[]

  @@map("documentos_usuario")
}
```

### 4.3 Edital (cache do arquivo principal)

```prisma
model Edital {
  id                String   @id @default(uuid())
  contratacao_id    String   @unique

  titulo            String?
  tipo              String?  // 'edital', 'Aviso', etc

  // URL PNCP
  url               String
  content_type      String?
  tamanho           BigInt?

  // Cache local (opcional - para search)
  texto_extraido    Text?

  created_at        DateTime @default(now())

  // Relations
  contratacao       Contratacao @relation(fields: [contratacao_id], references: [id], onDelete: Cascade)

  @@map("editais")
}
```

---

## 5. Modelos de Propostas

### 5.1 Proposta

```prisma
model Proposta {
  id                String   @id @default(uuid())
  usuario_id        String
  contratacao_id    String

  tipo              TipoDocumento // HABILITACAO, TECNICA, FINANCEIRA

  status            StatusProposta @default(RASCUNHO)

  // Dados da proposta (JSON estruturado)
  dados             Json?

  // Documento gerado
  documento_id      String?
  documento         DocumentoUsuario? @relation(fields: [documento_id], references: [id])

  // Validade
  validade_dias     Int?

  // Observações
  observacoes       Text?

  // Timestamps
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt
  enviada_em        DateTime?

  // Relations
  usuario           Usuario     @relation(fields: [usuario_id], references: [id], onDelete: Cascade)
  contratacao       Contratacao @relation(fields: [contratacao_id], references: [id], onDelete: Cascade)

  @@unique([usuario_id, contratacao_id, tipo])
  @@map("propostas")
}
```

---

## 6. Modelos de Interação

### 6.1 Questionamento

```prisma
model Questionamento {
  id                String   @id @default(uuid())
  usuario_id        String
  contratacao_id    String

  tipo              TipoQuestionamento

  texto             Text
  data_envio        DateTime?

  status            StatusQuestionamento @default(PENDENTE)

  // Resposta do órgão
  resposta_texto    Text?
  resposta_data     DateTime?

  // Referência PNCP
  numero_protocolo  String?

  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  // Relations
  usuario           Usuario     @relation(fields: [usuario_id], references: [id], onDelete: Cascade)
  contratacao       Contratacao @relation(fields: [contratacao_id], references: [id], onDelete: Cascade)

  @@map("questionamentos")
}
```

---

## 7. Modelos de Acervo Técnico

### 7.1 AcervoTecnico

```prisma
model AcervoTecnico {
  id                String   @id @default(uuid())
  usuario_id        String

  nome              String
  descricao         Text?

  tipo              TipoDocumento

  documento_id      String?
  documento         DocumentoUsuario? @relation(fields: [documento_id], references: [id])

  // Análise IA
  analise_ia        Json?    // {score, requisitos_cumpridos, faltantes, sugestoes}
  analise_data      DateTime?

  // Dados do documento
  entidade_emisora  String?
  data_emissao      DateTime?
  data_validade     DateTime?

  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  // Relations
  usuario           Usuario @relation(fields: [usuario_id], references: [id], onDelete: Cascade)

  @@map("acervos_tecnicos")
}
```

---

## 8. Modelos de Alertas

### 8.1 Alerta

```prisma
model Alerta {
  id                String   @id @default(uuid())
  usuario_id        String

  nome              String
  ativo             Boolean  @default(true)

  // Filtros salvos
  filtros           Json     // {uf: ['MG'], modalidades: [6,7], keywords: ['software', 'TI'], ...}

  // Frequência
  frequencia        String   @default("diaria") // 'diaria', 'semanal', 'instantanea'

  // Stats
  ultimo_envio      DateTime?
  total_resultados  Int      @default(0)

  created_at        DateTime @default(now())

  // Relations
  usuario           Usuario @relation(fields: [usuario_id], references: [id], onDelete: Cascade)

  @@map("alertas")
}
```

### 8.2 Notificacao

```prisma
model Notificacao {
  id                String   @id @default(uuid())
  usuario_id        String

  tipo              String   // 'novo_edital', 'prazo', 'resposta', 'alerta'
  titulo            String
  mensagem          String

  // Relacionamento (opcional)
  related_type      String?  // 'contratacao', 'ata', 'contrato'
  related_id        String?

  lida              Boolean  @default(false)
  lida_em           DateTime?

  created_at        DateTime @default(now())

  @@index([usuario_id, created_at])
  @@map("notificacoes")
}
```

---

## 9. Modelos de Auditoria

### 9.1 SyncLog

```prisma
model SyncLog {
  id                String   @id @default(uuid())
  tipo              String   // 'contratacoes', 'atas', 'contratos', 'full'
  status            String   // 'iniciando', 'sucesso', 'erro'

  // Stats
  registros_total   Int?
  registros_novos   Int?
  registros_atualizados Int?

  // Erro
  erro_mensagem     Text?
  erro_detalhes     Json?

  // Timing
  started_at        DateTime @default(now())
  completed_at      DateTime?

  @@map("sync_logs")
}
```

### 9.2 AuditLog

```prisma
model AuditLog {
  id                String   @id @default(uuid())
  usuario_id        String?
  action            String   // 'create', 'update', 'delete', 'login', etc
  entity_type       String   // 'proposta', 'usuario', etc
  entity_id         String?

  // Dados
  old_data          Json?
  new_data          Json?
  ip_address        String?
  user_agent        String?

  created_at        DateTime @default(now())

  @@index([usuario_id])
  @@index([entity_type, entity_id])
  @@map("audit_logs")
}
```

---

## 10. Tabelas de Domínio (Enums como Tabelas)

### 10.1 natureza_juridica

```prisma
model NaturezaJuridica {
  codigo     Int    @id
  descricao  String

  @@map("naturezas_juridicas")
}
```

### 10.2 Municipio

```prisma
model Municipio {
  ibge      Int    @id
  nome      String
  uf        String
  regiao    String
  mesorregiao String?
  microrregiao String?

  @@index([uf])
  @@index([nome])
  @@map("municipios")
}
```

---

## 11. Row Level Security (RLS)

### Exemplo de RLS para usuarios

```sql
-- Usuários só veem seus próprios dados
CREATE POLICY "Usuários veem próprio perfil"
ON usuarios FOR SELECT
USING (auth.uid() = id);

-- Usuários só veem seus próprios itens
CREATE POLICY "Usuários veem próprios itens"
ON usuario_itens FOR SELECT
USING (usuario_id = auth.uid());
```

---

## 12. Índices Recomendados

```sql
-- Consultas frequentes
CREATE INDEX idx_contratacoes_uf_modalidade ON contratacoes(uf, codigo_modalidade);
CREATE INDEX idx_contratacoes_data_recebimento ON contratacoes(data_recebimento_propostas) WHERE situacao = 1;
CREATE INDEX idx_contratacoes_valor ON contratacoes(valor_estimado) WHERE valor_estimado IS NOT NULL;
CREATE INDEX idx_usuarios_itens_usuario ON usuario_itens(usuario_id, status);
CREATE INDEX idx_documentos_usuario_tipo ON documentos_usuario(usuario_id, tipo);

-- Full-text search
CREATE INDEX idx_contratacoes_objeto_fts ON contratacoes USING gin(to_tsvector('portuguese', objeto));
```

---

## 13. Triggers

### 13.1 Atualizar updated_at automaticamente

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_contratacoes_updated_at
  BEFORE UPDATE ON contratacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

*Versão: 1.0*
*Data: 2026-04-14*