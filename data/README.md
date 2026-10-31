# Limites geográficos

`countries.geojson` é uma versão simplificada dos dados públicos de Natural Earth, distribuídos por [datasets/geo-countries](https://github.com/datasets/geo-countries). Fonte: https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson . Licença dos dados: domínio público (Natural Earth; PDDL na distribuição geo-countries).

A simplificação topológica de 0,035 grau e o arredondamento a cinco casas decimais preservam as 258 feições, inclusive países pequenos, reduzindo o arquivo de 14.643.641 para 1.722.443 bytes. Esta camada serve para navegação mundial e destaque de países, não para limites cadastrais ou navegação de ruas. Coordenadas dos estádios não são simplificadas.

O site carrega este arquivo localmente, sem consulta externa em tempo de execução. Os créditos permanecem visíveis no mapa.

Para regenerar, instale Shapely num ambiente de manutenção e execute:

```sh
python3 scripts/build-map-data.py /caminho/para/countries-original.geojson
```

Shapely não é uma dependência para executar o site.
