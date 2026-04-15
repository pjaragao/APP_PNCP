import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { RefreshCcw, CheckCircle2, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminSyncPage() {
  const logs = await prisma.syncLog.findMany({
    orderBy: { started_at: 'desc' },
    take: 20
  })

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Controle PNCP</h1>
          <p className="text-muted-foreground">Monitore a integridade e sincronismo das licitações.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Sincronismo</CardTitle>
            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {logs[0] ? format(logs[0].started_at, 'HH:mm', { locale: ptBR }) : '--:--'}
            </div>
            <p className="text-xs text-muted-foreground">Sincronismo automático incremental</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registros</TableHead>
                <TableHead>Duração</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {format(log.started_at, "dd/MM 'às' HH:mm:ss", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="capitalize">{log.tipo.replace('_', ' ')}</TableCell>
                  <TableCell>
                    {log.status === 'sucesso' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Sucesso
                      </Badge>
                    ) : log.status === 'processando' ? (
                        <Badge variant="outline" className="animate-pulse gap-1">
                          <RefreshCcw className="w-3 h-3 animate-spin" /> Processando
                        </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="w-3 h-3" /> Erro
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{log.registros_total || 0}</TableCell>
                  <TableCell>
                    {log.completed_at 
                      ? `${Math.round((log.completed_at.getTime() - log.started_at.getTime()) / 1000)}s` 
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Nenhum log de sincronismo encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
