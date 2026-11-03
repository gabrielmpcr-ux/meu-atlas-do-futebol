# Migração de dados para a nuvem

Estado: o proprietário concluiu a configuração, passou os cinco checks, restaurou o backup e confirmou os dados em janela anônima. O index principal foi promovido para a coleção compartilhada na nuvem. A cópia de migração e os antigos aliases redirecionam para o index. A chave do cliente é publicável; nenhuma senha ou chave administrativa é usada no código.

`preparar-nuvem.html` apresenta criação da conta de edição, SQL personalizado pelo e-mail informado no navegador e verificações de leitura/bloqueio anônimo e cadastro público. `atlas-nuvem.html` aguarda os dados do Supabase antes de iniciar a interface e utiliza o editor com gravações assíncronas. Conteúdo pessoal é importado pelo usuário na sessão autenticada; não há backup pessoal no Git.

O script de banco autoriza um único UID de Authentication. A tabela integral é privada; visitantes leem uma projeção sem notas/metadados internos dos cartões. Escrita ocorre apenas por função que verifica UID e revisão; atualiza a projeção pública na mesma transação. A versão inicial preserva fotos incorporadas ao JSON no banco; extração para Storage pode ser realizada depois se o volume crescer. Fotos por links externos continuam dependendo das respectivas fontes.

Validação: sintaxe SQL (26 instruções e quatro corpos PL/pgSQL) analisada por pglast; browser com API simulada passou para público, login, escrita aguardada, metadados, segundo dispositivo e conflito. Preparação testada com respostas simuladas: SQL personalizado, cinco verificações e bloqueio do avanço se a base integral estiver exposta. SQL/RLS reais, login real, e-mail e DNS ainda não foram testados. O ambiente de execução bloqueia por política de saída o host do novo projeto; o checker faz as verificações no navegador do proprietário.

Não ativar a nuvem no index nem configurar o domínio antes de: configurar o projeto, confirmar as verificações, testar login/recuperação, importar e conferir o backup, e testar gravações autorizadas e bloqueio de outros usuários.


## Ativação da coleção compartilhada

Validações reais informadas pelo proprietário: login por e-mail habilitado e cadastro público desativado; leitura pública 200; base integral, leitura de edição e gravação anônima bloqueadas com 401; restauração autenticada realizada; visitante em janela anônima visualiza o conteúdo esperado. Essas validações foram realizadas no navegador do proprietário, pois o ambiente de execução continua sem acesso ao host Supabase. Não declarar recuperação de senha testada: ela ainda precisa de teste de entrega e URLs de retorno.

O index utiliza atlas-cloud-start.js e o editor com await. atlas-nuvem.html, atlas-01-v2.html e conceito-1.html redirecionam para ele preservando query e fragmento (incluindo retorno de recuperação). Dados físicos antigos do navegador não são removidos ou importados automaticamente. Não há CNAME de domínio próprio nesta etapa: aguarda preparação da zona DNS no Registro.br para evitar interromper o endereço GitHub Pages antes de o domínio estar pronto.

Domínio planejado: www.gabrielrodriguez.com.br. GitHub Pages publica da branch (workflow dinâmico pages-build-deployment), portanto CNAME no repositório é aplicável. Preparar a zona DNS primeiro, configurar o domínio no GitHub antes dos apontamentos, depois CNAME www → gabrielmpcr-ux.github.io e quatro A no domínio raiz para 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153. Confirmar propagação/HTTPS e acrescentar os endereços finais às URLs de recuperação do Supabase. Referência: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
