# Diagnóstico do catálogo Wix — 25/11/2026

## Fonte confirmada
Site: Loja do Novinho  
Site ID: `ced5eb51-bcea-4ba8-a667-bc098c3eb70b`  
Coleção CMS: `AffiliateProducts`  
Nome exibido: Produtos de Afiliados  
Tipo: NATIVE  
Leitura da coleção: `ANYONE`  
Escrita: `ADMIN` para inserir, atualizar e remover.

## Estrutura dos registros
| Campo | Tipo | Uso na V2 |
|---|---|---|
| `title` | TEXT | Nome/título do produto |
| `affiliateUrl` | URL | Destino externo do botão de oferta |
| `imageUrl` | IMAGE | Imagem do produto |
| `price` | TEXT | Preço exibido |
| `description` | TEXT | Descrição curta |
| `category` | TEXT | Filtro e navegação por nicho |
| `platform` | TEXT | Identificação da loja parceira |
| `published` | BOOLEAN | Só exibir registros publicados |

## Fotografia do catálogo em 25/11/2026
Consulta paginada, somente leitura, retornou 292 registros publicados.

| Categoria | Quantidade |
|---|---:|
| Informática | 35 |
| Cozinha | 38 |
| Cama, mesa e banho | 45 |
| Casa, móveis e decoração | 46 |
| Eletrônicos | 41 |
| Ofertas | 18 |
| Acessórios | 20 |
| Brinquedos e Diversão | 25 |
| Moda | 24 |
| **Total** | **292** |

Na amostra consultada, todos os 292 registros estavam identificados como Mercado Livre. Isso é uma fotografia do momento da consulta, não uma garantia de que a coleção não receberá produtos Amazon depois.

## Regras de apresentação para a V2
- Não exibir produtos com `published !== true`.
- Cada cartão deve usar `imageUrl`, `title`, `price`, `description` e `platform` quando disponíveis.
- O botão de oferta deve abrir `affiliateUrl` em nova aba/janela, com proteção `rel="noopener noreferrer"`.
- Categorias devem ser derivadas dos valores reais de `category`, sem inventar categorias nem reclassificar produtos.
- Busca deve pesquisar título e descrição; filtro de categoria deve ser aplicado antes da renderização.
- A página inicial deve respeitar o comportamento da vitrine Wix. Não assumir que a página inicial deve listar todos os itens sem comparar a referência visual.

## Integração: conclusão e bloqueio atual
A coleção informa permissão de leitura ANYONE, mas a API administrativa usada na auditoria autenticou como administrador. Isso não prova que uma chamada REST direta sem credenciais funcionará publicamente. O guia oficial Wix Headless recomenda um cliente com OAuth Client ID para consulta pelo SDK no navegador, com tokens de visitante; não se deve colocar client secret ou token administrativo no frontend.

Portanto, ainda não foi configurada integração ao vivo. Antes dela, precisamos confirmar o Headless Client/OAuth Client ID apropriado e implementar a consulta pública de visitante, ou definir uma camada intermediária segura de leitura. Nenhuma credencial foi solicitada, copiada ou publicada neste repositório.

## Evidências oficiais consultadas
- Query Data Items: https://dev.wix.com/docs/api-reference/business-solutions/cms/data-items/query-data-items
- Get Data Collection: https://dev.wix.com/docs/api-reference/business-solutions/cms/collection-management/data-collections/get-data-collection
- CMS Schema Management: https://dev.wix.com/docs/api-reference/business-solutions/cms/skills/cms-schema-management
- Wix Headless Data Quick Start: https://dev.wix.com/docs/go-headless/self-managed-headless/tutorials/java-script-sdk-tutorials/data-quick-start
- Visitor Authentication: https://dev.wix.com/docs/go-headless/authentication/visitors/about-visitor-authentication

## Próxima etapa segura
Registrar referências visuais da vitrine (home, categorias, busca, cartão de produto e detalhe) em desktop e celular. Depois disso, implementar os componentes visuais dentro de `v2/`, usando dados de teste locais até a conexão pública somente-leitura ser validada. Não publicar, não conectar domínio e não alterar Wix/PWA original.
