'use client'

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { ContratacaoCard } from "@/components/contratacoes/ContratacaoCard";
import { useState } from "react";

// Dados mockados para demonstração imediata
const MOCK_ITEMS = [
  {
    id: '1',
    numero_controle_pncp: '12345678000195-1-000001/2024',
    objeto: 'Aquisição de equipamentos de processamento de dados (Servidores e Storages) para infraestrutura de rede.',
    codigo_modalidade: 'PREGAO_ELETRONICO',
    orgao_nome: 'Ministério da Ciência, Tecnologia e Inovações',
    uf: 'DF',
    data_recebimento_propostas: '2024-05-15T14:00:00Z',
    valor_estimado: 1250000.00
  },
  {
    id: '2',
    numero_controle_pncp: '00394460000141-1-000045/2024',
    objeto: 'Serviços de manutenção preventiva e corretiva em sistemas de ar condicionado central.',
    codigo_modalidade: 'CONCORRENCIA_ELETRONICA',
    orgao_nome: 'Ministério da Fazenda',
    uf: 'RJ',
    data_recebimento_propostas: '2024-06-02T10:00:00Z',
    valor_estimado: 450000.50
  },
  {
    id: '3',
    numero_controle_pncp: '09423456000100-1-000122/2024',
    objeto: 'Fornecimento de licenças de software para produtividade e colaboração em nuvem.',
    codigo_modalidade: 'DISPENSA',
    orgao_nome: 'Prefeitura Municipal de Curitiba',
    uf: 'PR',
    data_recebimento_propostas: '2024-05-10T23:59:59Z',
    valor_estimado: 12500.00
  }
]

export default function BuscaPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Buscar Licitações</h1>
        <p className="text-muted-foreground">Encontre oportunidades em todo o Brasil sincronizadas do PNCP.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 h-11" 
            placeholder="Pesquisar por objeto, órgão ou CNPJ..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-11 gap-2">
          <SlidersHorizontal className="w-4 h-4" /> Filtros Avançados
        </Button>
        <Button className="h-11 px-8">Buscar</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ITEMS.map((item) => (
          <ContratacaoCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
