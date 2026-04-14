# Documentação da API de Consultas do PNCP

Este documento detalha as especificações contidas no "Manual das APIs de Consultas PNCP" (Versão 1.0), visando facilitar e viabilizar a criação de esquemas em nosso banco de dados relacional para comportar as integrações com o Portal Nacional de Contratações Públicas.

## Resumo Técnico e Acesso
A comunicação é feita via modelo REST (HTTP 1.1) tendo o JSON como estrutura trafegada.
- **Portal Base:** `https://pncp.gov.br`
- **Serviços (Base URL):** `https://pncp.gov.br/api/consulta`
- **Swagger Oficial:** `https://pncp.gov.br/api/consulta/swagger-ui/index.html`

## Identificadores de Controle PNCP (Primary Keys Sugeridas)
Cada transação ou objeto é encadeado por um número string de controle PNCP, vital para rastrear dados e interligar a origem com as ramificações (como Edital -> Atas -> Contratos). O manual delimita:
1. **PCA (Plano de Contratações):** Máscara `CNPJ-0-SEQUENCIAL/ANO`. Ex: `99999999999999-0-999999/9999`
2. **Contratação/Licitação:** Máscara com marcador "1". Ex: `CNPJ-1-SEQUENCIAL/ANO` (`99999999999999-1-999999/9999`)
3. **Ata de Registro de Preços:** Máscara dupla. Ex: `CNPJ-1-SEQ/ANO-SEQ_ATA` (`...-1-999999/9999-999999`)
4. **Contrato:** Máscara com marcador "2". Ex: `CNPJ-2-SEQUENCIAL/ANO` (`99999999999999-2-999999/9999`)

## Container Padronizado de Rotas Listáveis e Paginação
Rotas em formato de listagem adotam um limite de páginas ajustável por parâmetro `tamanhoPagina` (padrão 50, contudo é recomendado setar até **500** em _jobs_ massivos para poupar chamadas).
O envelope JSON inclui a estruturação de listagem com metadados:
- `data`: Objeto Vetor (array) com os registros finais;
- `totalRegistros`: Número int;
- `totalPaginas`: Número int (Útil para loops de varredura `while` na cron);
- `numeroPagina` & `paginasRestantes`: Inteiros úteis;
- `empty`: Boleano se obteve output real.

---

## Dicionário Completo: Tabelas de Domínio
O BD interno deve criar entidades dicionário para espelhar as regras de negócio em códigos (int):

### 1. Instrumento Convocatório
- `1` = Edital // `2` = Aviso de Contratação Direta // `3` = Ato autorizando Contratação Direta.

### 2. Modalidade de Contratação
- `1` = Leilão - Eletrônico // `2` = Diálogo Competitivo // `3` = Concurso // `4` = Concorrência Eletrônica // `5` = Concorrência Presencial // `6` = Pregão Eletrônico // `7` = Pregão Presencial // `8` = Dispensa // `9` = Inexigibilidade // `10` = Manifestação de Interesse // `11` = Pré-qualificação // `12` = Credenciamento // `13` = Leilão Presencial.

### 3. Modos de Disputa e Critério de Julgamento
**Modo de Disputa:** `1` (Aberto), `2` (Fechado), `3` (Aberto-Fechado), `4` (Dispensa com Disputa), `5` (N/A), `6` (Fechado-Aberto).
**Critério de Julgamento:** `1` (Menor preço), `2` (Maior desconto), `4` (Técnica e preço), `5` (Maior lance), `6` (Maior retorno econômico), `8` (Melhor técnica), `9` (Conteúdo artístico).

### 4. Situação / Status do Processo
**Situação Contratação:** `1` (Divulgada), `2` (Revogada), `3` (Anulada), `4` (Suspensa).
**Situação Item Específico:** `1` (Em Andamento), `2` (Homologado), `3` (Cancelado/Anulado), `4` (Deserto), `5` (Fracassado).

### 5. Tipos e Termos de Contrato
**Contratos:** `1` (Contrato Inicial), `2` (Comodato), `4` (Concessão), `6` (Convênio), `7` (Nota de Empenho), `9` (TED - Termo Execução Descentralizada). 
**Termos Adicionais:** `1` (Rescisão), `2` (Aditivo), `3` (Apostilamento).

### 6. Demais Entidades Dominiais (Enums grandes úteis para filtros)
- **Natureza Jurídica:** Uma enorme enumeração que distingue de "1015 - Executivo Federal" até "3999 - Associação Privada".
- **Porte da Empresa:** `1` (ME), `2` (EPP), `3` (Demais Entidades).
- **Categorias do Plano PCA:** `1` (Material), `2` (Serviço), `3` (Obras).
- **Esfera / Poder:** Letras como `F, E, M` (Federal, Estadual, Municipal) ou `L, E, J` (Legislativo, Executivo, Judiciário).

---

## Catálogo de Serviços (Endpoints Base no GET)
A base principal de requisições GET exige passagem no header de `-H 'accept: */*'`. 

### 1. PCA (Plano Anual Consultivo)
**Endpoints:** `/v1/pca/usuario` ou `/v1/pca/`
> Filtros (Query Param): `anoPca` (obrigatório), `idUsuario` (Id sistema integrador). Sub-Filtros: `codigoClassificacaoSuperior`.
**Dados Extraídos e mapeados:** O objeto devolve o array de _Itens do PCA_ contemplando a categorização do PDMCodigo (catalogo federal) de matérias, quantidade (`quantidadeEstimada`), `valorUnitario` e dados orgânicos atrelados (`dataAtualizacao`).

### 2. Consultar Contratações (Licitações Completas)
**Endpoint:** `/v1/contratacoes/publicacao`
> Filtros Críticos (Query): Periodização obrigatória em `dataInicial` e `dataFinal` formato AAAA-MM-DD reduzido (`YYYYMMDD`). É fortemente sugerido passar: `codigoModalidadeContratacao`, `uf`, `codigoMunicipioIbge` e `cnpj`.
> Campos de Transição à BD:
- Base de amarração: `numeroControlePNCP`.
- Ids Estrangeiros a ligar com tabelas fixas: `modalidadeId`, `situacaoCompraId`, `tipoInstrumentoConvocatorioId`.
- Propriedades Diretas: String de `objetoCompra`.
- Booleanos: `srp` (é registro de preço).
- Finanças: Propriedades decimais `valorTotalEstimado` e `valorTotalHomologado` podem vir mascaradas e zeradas se os campos sigilosos forem `true`.
- Grupos Geopolíticos: O json encapsula `unidadeOrgao` (unidade executora) e `orgaoSubRogado` em subdivisões da resposta.

### 3. Consultar Contratações via Grade de Propostas
**Endpoint:** `/v1/contratacoes/proposta`
Dedicado a filtros na fase interna/aberta (para empresas rastrearem calendários urgentes baseados da query _data final do recebimento de proposta_).

### 4. Consultar Atas de SRP (Sistema de Registro de Preços)
**Endpoint:** `/v1/atas`
> Filtros: Datas do período delimitador da **vigência**.
> Campos base da tabela na BD:
Este nível armazena o `numeroControlePNCPAta` (Id próprio), possuindo campo referencial `numeroControlePNCPCompra` para que o BD relacione Ata à licitação Pai. Os arrays embutem dados do ciclo vital (`dataAssinatura`, `vigenciaInicio` / `Fim` limitando as adesões) e indicação de fornecedores consolidados ou `cnpjOrgaoSubrogado` para caronas.

### 5. Consultas de Contratos Firmados & Empenhos
**Endpoint:** `/v1/contratos`
Reflete os termos firmados sobre as licitações originais ou atas.
> Metadados de interesse:  
- Ligação de origem `numeroControlePNCPCompra`.
- Atributos Booleanos para direcionamento de fluxo: `receita` (`true` define que estado arrecada; `false` indica estado pagando a empresa fornecedora).
- Fornecedores alocados em colunas CNPJ CPF ou `tipoPessoa` ('PJ','PF','PE'). Inclui sub-colunas cruciais em cascata (Ex: `niFornecedorSubContratado`).
- Desdobramento Monetário: Campo decimal de `valorInicial`, rastreabilidade de pagamentos `valorAcumulado` global, `numeroParcelas` configuradas e a linkagem profunda a projetos de governo listados externamente (`urlCipi` para plano federal Integrador de Investimentos).

_Nota Importante: O roteamento API prevê listagens massivas gerais. Para escavar de forma cirúrgica tabelas-filho (documentos e PDFs da licitação, imagens do item do fornecedor ou histórico de propostas aditivas), a aplicação deve estar configurada para puxar as primary keys "ControlePNCP" nestes passos 1 a 5 e despachar requests secundários (`/v1/contratacoes/{ID}/itens`, `/v1/contratacoes/{ID}/documentos`) descritas lateralmente pelo manual PNCP._

Relacionado a: [[Portal_Busca]], [[Detalhes_Contratacao]]
