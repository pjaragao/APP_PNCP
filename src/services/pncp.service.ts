const PNCP_BASE_URL = 'https://pncp.gov.br/api/consulta/v1'

export interface PNCPContratacao {
  numeroControlePNCP: string
  objetoCompra: string
  modalidadeId: number
  dataDivulgacao: string
  dataRecebimentoProposta?: string
  valorTotalEstimado?: number
  valorTotalHomologado?: number
  sigiloso?: boolean
  uf?: string
  codigoMunicipioIBGE?: number
  orgao: {
    cnpj: string
    nome: string
    esfera?: string
    poder?: string
  }
}

export class PNCPService {
  /**
   * Busca contratações por período
   */
  static async fetchContratacoes(params: {
    dataInicial: string
    dataFinal: string
    pagina: number
    tamanhoPagina?: number
  }) {
    const url = new URL(`${PNCP_BASE_URL}/contratacoes/publicacao`)
    url.searchParams.set('dataInicial', params.dataInicial)
    url.searchParams.set('dataFinal', params.dataFinal)
    url.searchParams.set('numeroPagina', String(params.pagina))
    url.searchParams.set('tamanhoPagina', String(params.tamanhoPagina || 100))

    const response = await fetch(url.toString(), {
      headers: { accept: '*/*' }
    })

    if (!response.ok) {
      throw new Error(`Erro PNCP API: ${response.status} - ${await response.text()}`)
    }

    return response.json()
  }

  /**
   * Busca itens de uma contratação específica
   */
  static async fetchItens(numeroControlePNCP: string) {
    const response = await fetch(`${PNCP_BASE_URL}/contratacoes/${numeroControlePNCP}/itens`, {
      headers: { accept: '*/*' }
    })

    if (!response.ok) return []
    return response.json()
  }
}
