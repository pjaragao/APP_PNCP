# Detalhes e Visualização de Contratação e Contratos

Este documento resume as sub-páginas internas que listam as especificidades de um aviso e de um contrato (baseado em pncp3.png e pncp5.png).

## Visão de um Aviso de Contratação / Edital

Quando se acessa uma contratação em aberto (ou seu histórico) o portal fornece uma ficha técnica densa. A página fornece inclusive um QR code para acesso.

### Cabeçalho Informativo
Os itens constantes na ficha são:
- **Local, Órgão e Unidade compradora.**
- **Modalidade e Amparo Legal.** (Ex: Lei 14.133/2021)
- Informações sobre SRP (Registro de Preço) e fontes orçamentárias.
- Datas balizadoras: Divulgação, Recebimento de Propostas, Início e Fim.
- Identificadores PNCP base.
- **Objeto** integral.
- Informações coloridas em caixas com o **Valor Total Estimado** e **Valor Total Homologado** da compra (pode constar "Sigiloso" em conformidade com as regras normativas).

### Abas de detalhamento do Aviso
Ocorrem em divisões por abas (tabs) de:
- **Itens:** Relacionando todas as metas da contratação. Apresenta o número, a descrição integral (ex: fornecimento de banners ou água térmica), a quantidade, a unitagem de valor e o total.
- **Arquivos:** Contempla os editais, aditivos documentais e relatórios anexos.
- **Histórico.**

## Visão de um Contrato Efetivado

A visão de contrato (ex: Contrato nº 32/2025) reflete o que foi consolidado do aviso de contratação, listando os aditivos.

### Cabeçalho do Contrato
A ficha muda ligeiramente e passa a exibir:
- O vínculo referenciado (Id contratação PNCP da origem).
- **Receita ou Despesa**.
- Categoria do processo e Tipo do contrato (termo inicial, aditivo).
- O período explícito de **Vigência** estipulado para a execução material do objeto.
- Objeto do referenciado contrato.

### Detalhamento Financeiro e Fornecimento
No contrato é incluído o box do **Valor Contratado** verificado e o detalhamento do **Fornecedor**:
- Tipo (ex: pessoa jurídica).
- CNPJ/CPF oficial.
- Nome/Razão Social.
- Um atalho de "Consultar sanções e penalidades do fornecedor".

### Abas de detalhamento do Contrato
- **Termos:** Que mostra cada ato formal de retificação ou prolongamento (como um Termo Aditivo, seu número, data de assinatura e link de detalhes).
- **Arquivos** e **Histórico**.

A conexão entre a visão do contrato finalizado e o escopo original garante o track dos repasses de dados governamentais conforme rege a integração descrita pela API.

Relacionado a: [[API_Consulta]], [[Portal_Busca]]
