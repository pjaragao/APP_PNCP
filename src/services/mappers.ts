import { Prisma, Modalidade, TipoInstrumento, Esfera, Poder } from '@prisma/client'
import { PNCPContratacao } from './pncp.service'

export const MODALIDADE_MAP: Record<number, Modalidade> = {
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
}

export function mapPNCPToPrisma(raw: PNCPContratacao): Prisma.ContratacaoCreateInput {
  return {
    numero_controle_pncp: raw.numeroControlePNCP,
    objeto: raw.objetoCompra,
    codigo_modalidade: MODALIDADE_MAP[raw.modalidadeId] || 'PREGAO_ELETRONICO',
    tipo_instrumento: 'EDITAL', // Default para carga de publicações
    data_divulgacao: raw.dataDivulgacao ? new Date(raw.dataDivulgacao) : null,
    data_recebimento_propostas: raw.dataRecebimentoProposta ? new Date(raw.dataRecebimentoProposta) : null,
    valor_estimado: raw.valorTotalEstimado ? new Prisma.Decimal(raw.valorTotalEstimado) : null,
    valor_homologado: raw.valorTotalHomologado ? new Prisma.Decimal(raw.valorTotalHomologado) : null,
    valor_sigiloso: raw.sigiloso || false,
    uf: raw.uf,
    codigo_municipio_ibge: raw.codigoMunicipioIBGE,
    orgao_nome: raw.orgao.nome,
    orgao_cnpj: raw.orgao.cnpj,
    orgao_esfera: (raw.orgao.esfera as Esfera) || null,
    orgao_poder: (raw.orgao.poder as Poder) || null,
    raw_data: raw as any,
  }
}
