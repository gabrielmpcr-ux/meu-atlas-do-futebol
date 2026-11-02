# Atlas imersivo — versão 2

Prévia em `atlas-01-v2.html`; o endereço `conceito-1.html` também abre esta versão. A primeira proposta está preservada em `conceito-1-v1.html`. O layout principal em `index.html` permanece disponível para edição e gestão dos registros.

## Experiência

- Estádios como primeiro item do menu e tema central da abertura.
- Galeria com fotos pessoais e referências do catálogo, busca, filtro de país, ordenação, paginação e detalhes com notas e jogos.
- Indicadores calculados a partir dos dados locais, com acesso aos respectivos tópicos.
- Faixas de países e companhias com movimento automático, pausa, arraste e navegação por teclado. Sem barra de rolagem visível. Movimento reduzido é respeitado.
- Mapa 2D vetorial com Leaflet 1.9.4 hospedado no próprio site, atualização de dimensões após a troca de visualização e visão global ajustada ao espaço disponível.
- Globo com oceanos escuros, continentes neutros, estádios dourados, aeroportos claros e destaque da viagem selecionada. Camadas Estádios, Voos e Tudo.

## Correções

A API Globe.gl pode retornar `null` para `globeMaterial()` quando usa o material padrão. O acesso sem verificação interrompia a configuração; agora o retorno é verificado. As coberturas poligonais foram retiradas do globo: elas criavam preenchimento indesejado e prejudicavam contraste e desempenho. Os países continuam destacados no mapa 2D.

A seleção manual de 2D é preservada mesmo durante carregamento lento do 3D. O mapa é redimensionado quando se torna visível. Em perda do contexto WebGL, a prévia retorna ao 2D. Renderização 3D e reprodução são pausadas fora da área visível ou em outra aba.

## Dados e licenças

A prévia apenas lê os registros do navegador. Não altera chaves, fotos, visitas, viagens ou voos. A edição continua disponível no Atlas principal. Fotos pessoais têm prioridade sobre o catálogo; falhas de imagem usam a fonte original quando disponível e, depois, uma mensagem clara.

Leaflet: BSD-2-Clause, licença em `vendor/leaflet-LICENSE.txt`. Globe.gl, fontes, bandeiras e fotografias seguem os créditos em `DESIGN-CREDITS.md`. A nova textura é uma rasterização dos dados Natural Earth já utilizados pelo Atlas, com cores grafite/azul e cinza. Nenhum mapa pago, serviço de rastreamento ou chave de API foi adicionado.

## Verificação

Testes em Chromium para computador e celular: ambos os mapas, trocas repetidas, carregamento lento, indicadores e consultas, filtros e detalhes dos estádios, rolagem e arraste, preservação dos dados e ausência de rolagem horizontal. Preferência por movimento reduzido verificada. Suíte existente do projeto aprovada.


## Coleção de voos e navegação fixa

Os indicadores leem os registros locais: LATAM (inclui nome TAM), GOL, CGH/GRU ↔ SDU/GIG nos dois sentidos e soma de minutos registrados ou estimativa do modelo. A cobertura da duração aparece no indicador; as estimativas são identificadas. Sem inventar dias para registros com apenas ano. A coleção tem busca, companhia, ano, ponte aérea, paginação de 20 e cinco colunas em desktop, três em tablet e duas em celular. Detalhes e rota permanecem na página. O menu usa altura medida para compensar âncoras e marca a seção atual. Nenhuma escrita em localStorage.

Validação: Playwright com dados sintéticos verifica contagens, dois sentidos, filtros, paginação, detalhes, mapa, 5/2 colunas, menu fixo, deslocamento da âncora, largura mobile e preservação do armazenamento.

A fonte ativa é `atlas-01-v2.js`. O gerador histórico em `/workspace/work/v2/build.py` pertence à versão anterior e não deve ser executado sobre esta revisão.


## Panorama e filtros avançados de voos

Nacionais são trechos com ambos os aeroportos no Brasil. Internacionais cruzam países e abrem por padrão em saídas do Brasil; seletor permite retornos, trechos entre outros países e todos. Trechos domésticos em países estrangeiros e registros sem país conhecido permanecem em Todos, evitando classificações falsas. País/aeroporto vêm do catálogo com fallback nos campos do registro. Busca, companhia, ano, ponte aérea, país de destino, origem e chegada são cumulativos. Ordenação por ano e dia/mês disponíveis, sem atribuir datas completas a registros parciais; anos ausentes ficam ao final.

O panorama agrega todos os resultados antes da paginação, com percursos direcionais, países/cidades de destino e cobertura de duração. Os registros individuais ficam fechados até pedido explícito ou clique em um percurso. Mudança de filtro retorna ao consolidado. A grade mantém paginação de 20. Teste Playwright cobre classificação, escopos internacionais, consolidação anterior à lista, combinação de filtros, ordenação, rota agrupada, mobile e armazenamento intacto.


## Menu do panorama

Os cinco totais são botões com estado expandido. Inicialmente nenhuma visualização é aberta. Voos, percursos direcionais, países de destino, cidades de destino e tempo por companhia compartilham o mesmo painel; alternar visualizações preserva os filtros. Alterar filtros atualiza o painel ativo. Horas indicam cobertura e estimativas. Países/cidades exibem contagem de chegadas por trecho, não alegam visitas fora do aeroporto. Percursos e destinos permitem aprofundar nos voos. Recolher fecha o painel. Cards de cidade têm controle para remover o recorte de cidade; limpar filtros restaura o panorama inicial.

Verificação Playwright: cinco painéis, recolhimento inicial, manutenção de filtros/painel, classificação nacional/internacional, escopos, filtros de aeroporto/país, ordenação, rota, largura mobile e armazenamento intacto.
