# Funcionalidades de Busca do Portal PNCP

Este documento mapeia o funcionamento das pesquisas no site oficial do PNCP, com base nas evidências coletadas nas telas do portal (pncp1.png, pncp2.png e pncp4.png). 

## Visão Geral da Interface de Busca

A página principal de consultas do portal divide-se primariamente em abas maiores:
- Editais e Avisos de Contratações
- Atas de Registro de Preços
- Contratos

Ao realizar uma pesquisa, o usuário dispõe de uma caixa principal de "Palavra-chave" e seletores de status (ex: "Em Julgamento/Propostas Encerradas", "Encerradas", "A Receber", "Vigentes", "Não vigentes", "Todos").

## Sistema de Filtros Avançados
Para facilitar o acesso rápido, uma sessão de filtros suspensos pode ser acionada. Entre os filtros suportados, notam-se:
- Modalidades de Contratação (ex: Pregão Eletrônico, Concorrência, Dispensa).
- Tipos de Contrato
- Órgãos, Unidades, UFs e Municípios
- Esferas e Poderes (Federal, Estadual, Judiciário, Executivo)
- Fontes orçamentárias e tipos de margem de preferência

## Como os Resultados São Exibidos
Os resultados (como em uma busca de contratações diretas ou editais, ou de contratos vigentes) vêm em lista padronizada que exibe:
- Número do documento em destaque (Ex: Aviso de Contratação Direta nº 13/2026).
- Id da contratação ou Id do contrato no PNCP (número chave de controle).
- Data de Última Atualização.
- Nome e Modalidade (Ex: Dispensa, Concorrência, Pregão eletrônico).
- Órgão e Local associado (ex: BOCAIÚVA CAMARA MUNICIPAL, Bocaiúva/MG).
- O texto integral do **Objeto** do contrato/licitação.
- O valor global contratado se for a pesquisa de um contrato consolidado.

Existe ainda um campo de ordenação, geralmente priorizando "Mais recente".

Relacionado a: [[API_Consulta]], [[Detalhes_Contratacao]]
