# V2 — reprodução progressiva da vitrine Loja do Novinho

Esta pasta contém a segunda versão isolada da vitrine. O trabalho ocorre somente na branch `v2-vitrine-seo`, dentro de `v2/`. Não substitui nem modifica o PWA original, o site Wix publicado, o CMS de afiliados ou as integrações Mercado Livre/Amazon.

## Referência visual recebida
Captura da vitrine Wix em celular enviada em 25/11/2026. A composição visível orienta a implementação:
- Banner principal em largura total, com a arte/personagem da Loja do Novinho.
- Painel de apresentação claro sobre fundo azul, com cantos inferiores arredondados.
- Título centralizado: “Encontre seus próximos achadinhos!”
- Subtítulo: “Ofertas e novidades para facilitar suas escolhas.”
- Dois botões dourados largos: “Explorar categorias” e “↓ INSTALE O APLICATIVO”.
- Busca em caixa branca arredondada, lupa à esquerda e botão azul-escuro “Buscar”.
- Separador horizontal e seção “Explore por categoria”, com subtítulo “Variedade para facilitar sua busca.”
- Cartões de categoria em duas colunas no celular, com borda/detalhe dourado, fundo claro, ícone e nome.

## Implementado nesta etapa
- Reorganização do HTML para refletir a sequência visual da captura.
- Estilos responsivos iniciais para banner, painel, botões dourados, busca, separador e cartões em duas colunas.
- Categorias em cartões clicáveis com ícones ilustrativos.
- Botão de instalação com tratamento do evento `beforeinstallprompt` e orientação alternativa quando o navegador não oferece prompt.
- Busca e categorias ainda não operam sobre produtos reais.

## Pendências importantes
- **Banner:** conectado à imagem original “Banner Loja do Novinho - personagem masculino 3D.jpg”, localizada por busca somente-leitura na biblioteca de mídia Wix. A V2 carrega a imagem por URL pública estática; nenhum arquivo ou configuração foi alterado na Wix.
- **Ícones/categorias:** os ícones atuais são provisórios; devem ser comparados com os cartões completos da Wix.
- **Produtos:** não há cards reais conectados.
- **Busca/filtros:** aguardam integração com catálogo.
- **Comparação:** ainda falta captura da página mais abaixo (cards de produto) e, idealmente, uma captura em desktop para validar as demais larguras.
- **Integração Wix:** antes de consultar a coleção publicamente, validar autenticação segura somente-leitura. Não colocar token administrativo ou segredo no frontend.

## Regras de preservação
- Não editar arquivos na raiz do repositório nem a branch principal.
- Não publicar a V2 nem conectar domínio de produção sem autorização explícita.
- Não alterar Wix, CMS, PWA original, service worker original, integrações de afiliados ou configuração de produção.
- Trabalhar somente em `v2/` na branch `v2-vitrine-seo`.

A V2 ainda é uma implementação parcial; não declarar cópia fiel concluída até comparar a página inteira e validar os dados e comportamentos reais.
