# Migração de dados para a nuvem

Estado: páginas de preparação e cópia conectável publicadas; o index principal NÃO foi alterado. Banco, administrador e permissões ainda precisam ser configurados pelo proprietário no Supabase. A chave do cliente é publicável; nenhuma senha ou chave administrativa é usada no código.

`preparar-nuvem.html` apresenta criação da conta de edição, SQL personalizado pelo e-mail informado no navegador e verificações de leitura/bloqueio anônimo e cadastro público. `atlas-nuvem.html` aguarda os dados do Supabase antes de iniciar a interface e utiliza o editor com gravações assíncronas. Conteúdo pessoal é importado pelo usuário na sessão autenticada; não há backup pessoal no Git.

O script de banco autoriza um único UID de Authentication. A tabela integral é privada; visitantes leem uma projeção sem notas/metadados internos dos cartões. Escrita ocorre apenas por função que verifica UID e revisão; atualiza a projeção pública na mesma transação. A versão inicial preserva fotos incorporadas ao JSON no banco; extração para Storage pode ser realizada depois se o volume crescer. Fotos por links externos continuam dependendo das respectivas fontes.

Validação: sintaxe SQL (26 instruções e quatro corpos PL/pgSQL) analisada por pglast; browser com API simulada passou para público, login, escrita aguardada, metadados, segundo dispositivo e conflito. Preparação testada com respostas simuladas: SQL personalizado, cinco verificações e bloqueio do avanço se a base integral estiver exposta. SQL/RLS reais, login real, e-mail e DNS ainda não foram testados. O ambiente de execução bloqueia por política de saída o host do novo projeto; o checker faz as verificações no navegador do proprietário.

Não ativar a nuvem no index nem configurar o domínio antes de: configurar o projeto, confirmar as verificações, testar login/recuperação, importar e conferir o backup, e testar gravações autorizadas e bloqueio de outros usuários.
