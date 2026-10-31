# Catálogo de estádios

`stadium-catalog.js` contém apenas referências públicas de estádios. Os registros pessoais continuam no localStorage do navegador; o catálogo não contém datas de visitas, notas ou fotos pessoais.

O catálogo identifica cada estádio pelo país ISO de três letras e pelo nome exato normalizado (acentos e pontuação são ignorados). `enrichStadium` preenche coordenadas somente quando ambos os campos estão vazios. Coordenadas existentes, campos parcialmente preenchidos, fotos personalizadas, notas e quantidades permanecem preservados. A operação é idempotente.

As fotos são consultadas no catálogo durante a renderização, com miniaturas de carregamento adiado e alternativa para a imagem original. Os créditos mostram autor, licença e página de origem. Fotos pessoais têm prioridade. Não usar fotografias genéricas de outro estádio como substitutas.

Cada coordenada e fotografia possui sua fonte no próprio registro. As localizações vêm das categorias geográficas do Wikimedia Commons; Anacleto Campanella usa a localização documentada de uma fotografia do estádio, com precisão aproximada dentro do complexo.

Cobertura atualmente conferida: 48 coordenadas e 50 fotografias em 52 entradas. Pendentes de verificação complementar: coordenadas de Estádio Espanha, Romildo Vitor Gomes Ferreira, José Liberatti e Cícero de Souza Marques; fotos de Estádio Espanha e Romildo Vitor Gomes Ferreira. Não preencher essas lacunas com estimativas não identificadas.

Validação local: `node --test tests/stadium-catalog.test.cjs`.

Para executar o site: `python3 -m http.server 8001 --bind 127.0.0.1` na raiz do checkout. Nenhuma dependência de build é necessária.
