import prisma from '@/lib/prisma'
import { PNCPService } from './pncp.service'
import { mapPNCPToPrisma } from './mappers'

export class SyncService {
  /**
   * Executa o sincronismo de um range de datas
   */
  static async syncRange(dataInicial: string, dataFinal: string) {
    const log = await prisma.syncLog.create({
      data: {
        tipo: 'contratacoes_incremental',
        status: 'processando',
        started_at: new Date()
      }
    })

    try {
      let pagina = 1
      let totalProcessado = 0
      let temMais = true

      while (temMais) {
        const result = await PNCPService.fetchContratacoes({
          dataInicial,
          dataFinal,
          pagina,
          tamanhoPagina: 50
        })

        if (!result.data || result.data.length === 0) {
          temMais = false
          break
        }

        // Upsert dos dados
        for (const item of result.data) {
          const mapped = mapPNCPToPrisma(item)
          
          await prisma.contratacao.upsert({
            where: { numero_controle_pncp: item.numeroControlePNCP },
            update: {
              ...mapped,
              updated_at: new Date(),
              last_sync_at: new Date()
            },
            create: mapped
          })
          totalProcessado++
        }

        pagina++
        temMais = pagina <= result.totalPaginas
      }

      await prisma.syncLog.update({
        where: { id: log.id },
        data: {
          status: 'sucesso',
          registros_total: totalProcessado,
          completed_at: new Date()
        }
      })

      return { totalProcessado }
    } catch (error: any) {
      await prisma.syncLog.update({
        where: { id: log.id },
        data: {
          status: 'erro',
          erro_mensagem: error.message,
          completed_at: new Date()
        }
      })
      throw error
    }
  }
}
