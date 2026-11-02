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
