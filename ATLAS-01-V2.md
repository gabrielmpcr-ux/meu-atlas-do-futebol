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

## Conferência de estádios no mapa

Corrigida a seleção de país, que abria apenas o primeiro ponto cadastrado. Agora o painel lista todos os estádios daquele país, com localização direta e acesso à galeria filtrada. Selecionar país limpa o recorte de rota e restaura a camada completa. Estádios são desenhados após aeroportos e cidades em 2D. Estádio sem coordenadas válidas não recebe silenciosamente a localização do centro da cidade. A conferência abaixo do mapa compara os registros atuais deste navegador com os pontos gerados e informa pendências individualmente, sem gravar no armazenamento.

Catálogo completo: 53 referências com coordenadas e fontes. Foram preenchidas quatro referências antes sem coordenadas: Espanha, Romildo/Vail Chaves, José Liberatti e Cícero de Souza Marques. Fontes de coordenadas: https://mapcarta.com/W108138615, https://mapcarta.com/pt/W154337589, https://pt.wikipedia.org/wiki/Estádio_Municipal_Prefeito_José_Liberatti, https://en.wikipedia.org/wiki/Estádio_Cícero_de_Souza_Marques. A página Wikipédia do Estádio Espanha contém coordenadas conflitantes; foi usado o ponto OSM/Mapcarta da Caneleira, não o ponto da Vila Belmiro.

Testes: todas as referências geram ponto sem coordenadas pessoais; Espanha oferece Balaídos e Bernabéu; Brasil oferece 26 estádios da referência; detalhes acessíveis; sem escrita no armazenamento; largura mobile preservada. O backup disponível tem 53 estádios e não substitui as alterações posteriores do usuário. Registros novos são verificados pela conferência local na página.

## Inclusão solicitada: Vigo

Referências públicas acrescentadas: Estádio O Vao/Coruxo (42.1961, -8.79194) e Campo Municipal de Bouzas–Baltasar Pujales/Rápido de Bouzas (42.22679, -8.75571), conforme coordenadas fornecidas e páginas de fonte no catálogo. `incluir-estadios-vigo.html` é uma ação explícita de inclusão local: requer coleção válida já presente, mescla apenas registros ausentes, reconhece aliases, não altera registros anteriores nem voos, não atribui datas/fotos e é idempotente. O catálogo não implica visita: somente abrir essa página específica executa a inclusão autorizada. A página principal permanece sem essa escrita automática. Testes unitários e navegador verificam ausência de coleção, duas inclusões, repetição, preservação de registros e quatro pontos da Espanha no cenário testado.

## Gerenciamento nativo no novo ambiente

`atlas-management.js` e `.css` acrescentam inclusão e edição de voos, cidades e estádios em dialogs da própria página. Entrada no menu, seção de estádios, seção de voos e detalhes dos registros. Cidade é gerenciada por grupo ISO/nome, atualizando os rótulos dos registros relacionados e preservando os dados de cada estádio. Visita independente à cidade permite fotografia e lembrança. Estádio inclui foto comprimida, enquadramento, jogos e vínculos com grupos de viagem existentes. Catálogo auxilia preenchimento de estádio/cidade/país; aeroportos reconhecidos preenchem cidade/país do voo.

Salvamento lê a base bruta e altera somente o registro pretendido, preservando campos desconhecidos, fotografias, jogos e vínculos. Não persiste dados demonstrativos. Detecta alterações em outra aba antes da gravação. Código de aeroporto novo exige cidade/país; sem referência de coordenadas, o voo fica na coleção e não desenha rota fictícia. Datas parciais continuam parciais. Exclusão exige confirmação e atualiza as referências dos voos nos grupos. Backup completo JSON pode ser baixado na central de gerenciamento. Operações somente locais, sem envio de fotos ou dados ao servidor. Recarregamento após salvar atualiza mapa, galeria e indicadores.

A integração de gerenciamento foi entregue antes da promoção descrita na seção seguinte. As páginas anteriores permanecem disponíveis; os caminhos de edição e inclusão no novo layout não dependem delas. A migração posterior de importação/restauração e grupos de viagem está descrita na seção de ambiente único abaixo.

Verificação de navegador com registros sintéticos: inclusão/edição de cada tipo; validação de datas; preservação de fotos, jogos, grupos e campos extras; upload e compressão de foto; registro de jogo; exclusão de voo e limpeza de referência; backup baixado e conferido; conflito entre abas; formulário mobile sem transbordamento. Não são usadas capturas ou dados pessoais na publicação.


## Página principal

`index.html` agora serve o novo Atlas. A barra de comparação, nomes de prévia e links para propostas foram retirados da experiência ativa. `atlas-01-v2.html` e `conceito-1.html` continuam compatíveis com os links anteriores. A página de entrada principal tem título e descrição próprios e não carrega o marcador noindex das propostas. Uma sessão sem coleção continua claramente identificada como demonstrativa; exemplos não são gravados na coleção pessoal.

`atlas-classico.html` inicialmente preservava o HTML anterior como transição. Após a migração completa, passou a redirecionar para `index.html`, sem interface antiga; a cópia integral permanece no histórico Git. Recursos relativos continuam na mesma pasta. O novo ambiente e o anterior leem as mesmas chaves e a mesma origem de armazenamento. Não há migração, limpeza ou substituição automática dos dados. Âncoras históricas de voos, destinos, mapa e jogos são direcionadas às novas seções.

Testes: página raiz em desktop/mobile, dados demonstrativos identificados, ausência de comparador, preservação byte a byte do localStorage ao navegar, globo 3D e mapa 2D, galeria/detalhes, gerenciamento, links de retorno e âncoras antigas. Teste completo de inclusão/edição, fotos, jogos, backup e exclusão executado também pela página raiz.


## Ambiente único · migração completa do gerenciamento

Importação/restauração agora ocorre no dialog nativo: JSON completo versão 2, lista antiga de visitas e JSON de voos. O resumo informa antecipadamente os registros e o efeito: backup completo restaura/substitui; visitas sem aviação preservam os voos; arquivo de voos é mesclado. Oferece download do backup atual. Validação anterior à aplicação, confirmação de substituição, detecção de mudanças em outra aba e reversão das gravações caso a segunda chave falhe. Erros de reversão são explicitamente informados; não há promessa falsa de preservação nessa situação. Metadados extras são mantidos na importação e nos dados atuais. Sem avaliação de código do arquivo e sem uploads ao servidor.

Viagens: criar, editar nome/lembrança, selecionar trechos, ordenar manualmente, retirar trecho e excluir grupo mantendo voos. Exclusão remove associações ao grupo nos estádios, com escrita protegida nas duas bases. Os grupos entram no seletor do mapa e na associação do editor de estádio. Substituição de voo presumido por documentado disponível no editor, atualizando referências sem duplicar contagem. CSV exporta apenas o recorte ativo, com escape de fórmulas e identificação de estimativas. Jogos aceitam informações parciais, como o gerenciamento anterior.

Não há links para ambiente antigo. `atlas-classico.html`, `conceitos.html`, `conceito-1-v1.html`, `conceito-2.html` e `conceito-3.html` apenas redirecionam para o Atlas principal, preservando parâmetros e âncoras. O histórico Git mantém os layouts anteriores. `atlas-01-v2.html` e `conceito-1.html` permanecem aliases da mesma aplicação atual.

Testes unitários em `tests/atlas-transfer.test.cjs`: formatos de backup, rejeição de conteúdo inválido, preservação de campos, mesclagem sem duplicação, remapeamento dos vínculos e ordem dos trechos. Playwright cobre CRUD e ordem de viagem, associação/exclusão, jogo parcial, substituição de voo, CSV filtrado, arquivo inválido, prévia sem escrita, importação mesclada, restauração integral, reversão por quota, metadados, mobile e redirecionamento. Regressão do gerenciamento de voos/cidades/estádios, fotos, jogos e backup também passou.


## Filtros unificados e indicadores gerais

Os quatro cards superiores agora mostram total geral de voos, total de trechos internacionais entre países diferentes, ponte aérea SP ↔ RJ nos dois sentidos e horas. Valores calculados da base local, sem fixar 240. Clicar no internacional seleciona todos os sentidos internacionais por padrão (não apenas saída do Brasil). Horas abre a distribuição por companhia; outros atalhos abrem o panorama.

Um único painel substitui abas de tipo, opções expansíveis e bloco separado de busca: busca, tipo (todos/nacionais Brasil/internacionais/ponte aérea), companhia, ano, país de destino, saída e chegada. Trajeto internacional, no mesmo padrão de campo, aparece somente quando pertinente. Ordenação e limpeza no rodapé do painel. Etiquetas mostram cada filtro e permitem removê-lo individualmente, incluindo o recorte de cidade de um aprofundamento anterior. Os filtros se cruzam por interseção, preservam o painel de resultado ativo e não gravam dados. A busca aceita palavras em qualquer ordem. Limpar retorna a todos os voos sem trocar a visualização ativa.

Playwright: indicadores dinâmicos, painel único sem abas/expansores, internacional incluindo ida/volta e trechos externos, combinação de seis campos, remoção de etiquetas, limpeza, nacional, ponte aérea, horas, busca multi-palavra, grade 5/2 colunas, largura mobile e armazenamento inalterado.

## Ordem do menu e agrupamento de Avellaneda

Menu principal segue a ordem das seções na landing page: Explorar o mundo, Estádios, Minhas viagens, Memórias. Navegação fixa, compensação da altura e indicação da seção ativa preservadas.

A pedido do proprietário, a apresentação da coleção agrupa Avellaneda (Argentina) sob Buenos Aires para exploração e contagem de cidades, sem alterar o local real dos estádios. O detalhe mantém “Buenos Aires · Avellaneda”; busca da galeria reconhece o município original. O registro bruto e as coordenadas pessoais permanecem intactos, inclusive no editor e no backup. Referência geográfica: https://www.mda.gob.ar/ciudad/avellaneda/ — Avellaneda é município próprio na área metropolitana, não bairro da CABA; o agrupamento é uma convenção de apresentação deste Atlas, não alteração administrativa. O ponto sem coordenadas de uma visita municipal ainda utiliza a referência original de Avellaneda, não o centro de Buenos Aires.

Playwright: ordem do menu em desktop/mobile, contador agrupado, estádios preservados, busca Avellaneda, detalhe, localização e editor com coordenadas originais, âncora abaixo do menu e nenhum armazenamento modificado.
