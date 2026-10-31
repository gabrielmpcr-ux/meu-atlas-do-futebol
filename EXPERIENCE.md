# Abertura e lembranças de jogos

A abertura usa HTML, CSS, JavaScript e arquivos locais: fotografias originais e um SVG derivado dos limites públicos documentados em `data/README.md`. Não usa API, conta externa nem WebGL. Dura 6,8 segundos, oferece entrada imediata, funciona com Escape e guarda a preferência em `my-football-atlas-intro-v1`, separada dos dados pessoais. Aparece automaticamente somente na primeira visita daquele navegador; pode ser revista pelo menu. Com `prefers-reduced-motion: reduce`, não abre automaticamente e a reprodução manual é estática.

`matches.js` guarda jogos no array opcional `matches` de cada registro de estádio. Cada jogo tem identificador estável, data, mandante, visitante, gols de cada time, competição e notas. Todos os campos de memória são opcionais, mas é preciso preencher ao menos um. Zero é um placar válido; ausência aparece como `?`, nunca como resultado inventado. Datas inválidas e placares negativos/fracionários são recusados.

O cadastro permite criar, editar, mover um jogo para outro estádio e excluir somente o jogo. Falhas de persistência restauram os registros em memória e mantêm o formulário aberto. Registrar um jogo não aumenta a quantidade de visitas automaticamente. Fotos, coordenadas, notas do estádio e quantidades existentes são preservadas.

Os backups JSON existentes exportam e importam `matches` junto com os demais campos, mantendo compatibilidade com registros antigos sem jogos. Os jogos pessoais não são enviados ao GitHub nem a outro serviço; permanecem no navegador e nos arquivos que o usuário exportar.

Validação: `node --test tests/*.test.cjs`. Os testes de navegador também cobrem primeira visita/reprodução/pular/Escape, redução de movimento, cadastro completo/parcial, edição/mudança de estádio, cancelamento/exclusão, falha de quota, backup e layout móvel.

## Fotografias de viagem

`travel-photos.js` é o manifesto das fotografias originais disponíveis. `travel-memories.js` usa a mesma coleção na capa e na abertura. O mosaico mantém cada fotografia em 4:3; `object-position` ajusta o ponto focal, incluindo a origem em orientação vertical. Um filtro CSS suave de saturação, contraste, sépia e luminosidade dá unidade sem gerar conteúdo ou alterar rostos. Os originais ficam preservados fora do checkout; o site recebe cópias WebP com lado maior de até 1.000 pixels, sem metadados EXIF.

As quatro molduras da abertura trocam as fotos a cada 1,6 segundo. São mantidas no máximo duas imagens por moldura durante a transição. Ao sair, pular ou pressionar Escape, os timers são interrompidos. A reprodução manual reinicia a sequência; redução de movimento mantém as molduras estáticas. A preferência anterior de primeira visita continua válida.

Coleção completa: onze fotografias únicas, provenientes de sete arquivos HEIC e quatro imagens recebidas em ZIP. As duas imagens repetidas de River Plate e Assunção são usadas apenas uma vez no mosaico. Os arquivos originais recebidos permanecem preservados fora do checkout.
