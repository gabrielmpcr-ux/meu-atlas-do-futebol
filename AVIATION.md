# Meus voos

A área de voos usa os mesmos componentes visuais do Atlas e funciona no GitHub Pages, sem servidor de dados ou dependências adicionais.

Os dados pessoais **não são distribuídos com o site**. A importação única de um arquivo `{"type":"atlas-flights","aviation":{"version":1,"flights":[],"trips":[]}}` adiciona o histórico ao navegador sem substituir visitas, fotos ou jogos. O arquivo privado preparado para o proprietário fica fora do repositório. O catálogo `aviation-airports.js` contém apenas referências públicas de aeroportos.

## Uso

- Acesse **Meus voos** no menu ou na faixa de indicadores da página inicial.
- Combine busca, ano, companhia, viagem, país, origem e destino. Os atalhos incluem internacionais, saídas de GRU e ponte aérea São Paulo/Rio.
- Os rankings acompanham os filtros. Aeroportos desconhecidos ou repetidos no mesmo cartão não contam como uma partida/chegada identificada.
- Organize trechos em viagens. O arquivo privado inicial inclui grupos revisáveis; não é uma comprovação de viagens completas.
- Escolha uma viagem ou use **Ver seleção no mapa** para exibir suas rotas. Os modos Estádios, Voos e Tudo controlam as camadas. Aeroportos abrem um resumo e acesso aos trechos.
- Nos detalhes de um estádio, **Associar viagem** cria um vínculo escolhido pelo usuário. A viagem mostra o atalho de volta ao estádio, suas fotos e jogos.
- Presunções aparecem na lista. **Substituir por cartão** exige selecionar e conferir o cartão correto; remove a presunção e atualiza os grupos sem duplicar o voo.

## Persistência e backup

O histórico e as viagens ficam em `my-football-atlas-aviation-v1`. As associações ficam no campo opcional `flightTripIds` das visitas, mantidas em `my-football-atlas-v1`. A importação de voos mescla IDs estáveis e identidades com voo, data completa confirmada e aeroportos; não supõe duplicidade a partir de anos estimados.

O botão geral **Exportar dados** produz backup versão 2 com `visits` e `aviation`. Restaurar um backup antigo apenas de visitas preserva os voos já existentes. Restaurar um backup completo substitui os dois conjuntos após validação e confirmação. Erros de escrita tentam restaurar os valores anteriores; formulários mantêm os dados em caso de quota insuficiente. Importar o mesmo arquivo não repete registros nem sobrescreve edições locais.

Os quilômetros são ortodrômicos entre aeroportos conhecidos. A duração é um subtotal programado, sempre com a quantidade de registros que possuem esse dado. Editar rota, data ou qualidade do ano limpa horários e duração anteriores para não reaproveitar um cálculo sem contexto. Cidades/países dos voos contam chegadas, incluindo conexões e retornos para casa, sem alterar as estatísticas de cidades/países visitados.

`aviation-model.js` contém validação e cálculos independentes da interface. `aviation.js` integra importação, lista, viagens, mapa e vínculos. `aviation.css` contém os estilos responsivos. Testes: `node --test tests/*.test.cjs`.
