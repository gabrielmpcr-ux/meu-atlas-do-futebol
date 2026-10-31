# Estimativa de voos

O quarto cartão apresenta uma comparação de deslocamentos aéreos, não um histórico real de passagens ou viagens.

- Origem fixa: centro de São Paulo, latitude -23.5475 e longitude -46.63611.
- Uma ida independente para cada cidade única fora do Brasil. Cidades próximas contam separadamente; vários estádios da mesma cidade não multiplicam o trajeto.
- Distância: grande círculo (Haversine), raio médio terrestre de 6.371,0088 km, entre referências dos centros urbanos.
- Tempo: distância / 800 km/h + 0,5 hora por trajeto. É um modelo aproximado de velocidade média, decolagem e aproximação; não inclui volta, escalas, esperas, ventos, rotas comerciais ou viagens por terra. Não pressupõe a existência de voo direto.
- Os totais são somados antes do arredondamento para apresentação.

`flight-data.js` contém referências públicas de cidades e aliases em português/inglês. Fonte: https://github.com/lutangar/cities.json (dados de GeoNames), licença CC BY 4.0, reproduzida em `data/CITIES-LICENSE.txt`. A base mundial foi consultada localmente; a lista de viagens não é enviada a geocodificadores. Wals-Siezenheim usa Wals como referência municipal. Homônimos foram desambiguados por país e região, incluindo Avellaneda (Buenos Aires), Toyota (Aichi), Yokohama (Kanagawa), Atlanta (Georgia), Miami/Orlando (Florida), Washington (DC) e Landover (Maryland).

O cálculo roda no navegador sem API, chave, assinatura ou novas dependências. Usa as coordenadas de referência quando disponíveis; para cidades novas, aceita um par válido de coordenadas dos registros. Cidades sem referência e sem coordenadas são explicitamente indicadas como não incluídas. A rotina não altera os registros pessoais.

Testes: `node --test tests/*.test.cjs`.
