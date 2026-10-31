# Abertura e lembranças de jogos

A abertura usa apenas CSS, HTML e um SVG local derivado dos limites públicos documentados em `data/README.md`. Não usa API, conta externa nem WebGL. Dura 4,2 segundos, oferece entrada imediata, funciona com Escape e guarda a preferência em `my-football-atlas-intro-v1`, separada dos dados pessoais. Aparece automaticamente somente na primeira visita daquele navegador; pode ser revista pelo menu. Com `prefers-reduced-motion: reduce`, não abre automaticamente e a reprodução manual é estática.

`matches.js` guarda jogos no array opcional `matches` de cada registro de estádio. Cada jogo tem identificador estável, data, mandante, visitante, gols de cada time, competição e notas. Todos os campos de memória são opcionais, mas é preciso preencher ao menos um. Zero é um placar válido; ausência aparece como `?`, nunca como resultado inventado. Datas inválidas e placares negativos/fracionários são recusados.

O cadastro permite criar, editar, mover um jogo para outro estádio e excluir somente o jogo. Falhas de persistência restauram os registros em memória e mantêm o formulário aberto. Registrar um jogo não aumenta a quantidade de visitas automaticamente. Fotos, coordenadas, notas do estádio e quantidades existentes são preservadas.

Os backups JSON existentes exportam e importam `matches` junto com os demais campos, mantendo compatibilidade com registros antigos sem jogos. Os jogos pessoais não são enviados ao GitHub nem a outro serviço; permanecem no navegador e nos arquivos que o usuário exportar.

Validação: `node --test tests/*.test.cjs`. Os testes de navegador também cobrem primeira visita/reprodução/pular/Escape, redução de movimento, cadastro completo/parcial, edição/mudança de estádio, cancelamento/exclusão, falha de quota, backup e layout móvel.
