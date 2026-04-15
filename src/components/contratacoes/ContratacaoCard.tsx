import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Calendar, MapPin, ExternalLink, Plus } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ContratacaoCardProps {
  item: any // Tipado via Prisma futuramente
}

export function ContratacaoCard({ item }: ContratacaoCardProps) {
  return (
    <Card className="hover:border-primary/50 transition-all flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
            {item.codigo_modalidade.replace('_', ' ')}
          </Badge>
          <span className="text-[10px] font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
             {item.numero_controle_pncp}
          </span>
        </div>
        <CardTitle className="text-sm font-bold line-clamp-2 leading-tight min-h-[2.5rem]">
          {item.objeto}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-4 space-y-3 flex-1 text-[13px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{item.orgao_nome}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{item.uf}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>{item.data_recebimento_propostas ? format(new Date(item.data_recebimento_propostas), "dd/MM/yy", { locale: ptBR }) : 'N/A'}</span>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-xs text-muted-foreground font-medium uppercase">Valor Estimado</p>
          <p className="text-base font-bold text-primary">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.valor_estimado || 0))}
          </p>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 px-6 grid grid-cols-2 gap-2 mt-auto">
        <Button variant="secondary" size="sm" className="w-full text-xs gap-1">
          Detalhes <ExternalLink className="w-3 h-3" />
        </Button>
        <Button size="sm" className="w-full text-xs gap-1">
          Acompanhar <Plus className="w-3 h-3" />
        </Button>
      </CardFooter>
    </Card>
  )
}
