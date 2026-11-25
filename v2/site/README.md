# V2 — reprodução progressiva da vitrine Loja do Novinho

Esta pasta contém a segunda versão isolada da vitrine. O trabalho ocorre somente na branch `v2-vitrine-seo`, dentro de `v2/site/`. Não substitui nem modifica o PWA original, o site Wix publicado, o CMS de afiliados ou as integrações Mercado Livre/Amazon.

## Referência visual recebida
Captura da vitrine Wix em celular enviada em 25/11/2026:
- Banner principal em largura total, com a arte/personagem da Loja do Novinho.
- Painel de apresentação claro sobre fundo azul, com cantos inferiores arredondados.
- Título centralizado: “Encontre seus próximos achadinhos!”
- Subtítulo: “Ofertas e novidades para facilitar suas escolhas.”
- Botões dourados, busca e seção “Explore por categoria”.
- Cartões em duas colunas no celular, com ícones, nomes e descrições da vitrine original.

## Implementado
- Banner principal usando a imagem original hospedada na Wix.
- Estrutura visual responsiva da página inicial.
- Nove cartões de categorias com os ícones e descrições conferidos no HTML publicado da Wix.
- Estilo dos cartões aproximado do original: profundidade 3D, fundo claro, detalhe dourado e layout responsivo.
- Busca por título, descrição, categoria e plataforma.
- Filtro por categoria; os produtos ficam ocultos na página inicial até uma categoria ser escolhida ou uma busca ser enviada.
- Cartões de produtos com imagem, nome, plataforma, preço quando preenchido, descrição e link “Ver oferta”.

## Catálogo Wix — somente leitura
- Coleção consultada: `AffiliateProducts` (Produtos de Afiliados).
- Total confirmado pela API Wix: **292 registros**.
- Permissão da coleção verificada: leitura `ANYONE`; inserção, atualização e remoção reservadas a `ADMIN`.
- O módulo `catalog.js` usa autenticação de visitante Wix e consulta somente `POST /wix-data/v2/items/query`.
- A consulta filtra `published = true`, pagina em lotes de 100 e lê os campos existentes sem gravar nada.
- Apenas URLs HTTPS são aceitas para imagens e links de afiliado na interface.
- Nenhum token administrativo ou segredo é colocado no frontend; o Client ID de visitante é público e é o mesmo já usado pelo site headless.

## Limitações e validação pendente
- O código de integração foi gravado na branch, mas a V2 ainda precisa ser executada em um ambiente de preview para validar autenticação no navegador, carregamento das três páginas e apresentação visual em celular/desktop.
- O preço é exibido quando o campo `price` existe; alguns registros podem não ter esse campo preenchido.
- Os nove cartões de categoria foram reproduzidos; cartões externos de parceiros que também aparecem na seção Wix não foram incluídos nesta etapa.
- A busca atual usa correspondência textual simples, ainda sem sinônimos ou relevância avançada.

## Regras de preservação
- Não editar arquivos na raiz do repositório nem a branch principal.
- Não publicar a V2 nem conectar domínio de produção sem autorização explícita.
- Não alterar Wix, CMS, PWA original, service worker original, integrações de afiliados ou configuração de produção.
- Trabalhar somente em `v2/site/` na branch `v2-vitrine-seo`.
- A V2 só deve ser considerada cópia fiel após comparar a página inteira e validar o comportamento real.
