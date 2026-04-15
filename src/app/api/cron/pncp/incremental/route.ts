import { NextResponse } from 'next/server'
import { SyncService } from '@/services/sync.service'
import { format, subDays } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Proteção simples por Header (TOKEN)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Não autorizado', { status: 401 })
  }

  try {
    const hoje = new Date()
    // Sincroniza os últimos 3 dias para garantir redundância em caso de falhas
    const dataInicial = format(subDays(hoje, 3), 'yyyyMMdd')
    const dataFinal = format(hoje, 'yyyyMMdd')

    const result = await SyncService.syncRange(dataInicial, dataFinal)

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[CRON ERROR]', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
