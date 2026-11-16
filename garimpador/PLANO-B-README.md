# Garimpador LDN — Plano B assistido

Implementação isolada na branch `garimpador-plano-b-assistido`.

## O que esta etapa faz
1. Pesquisa ofertas no endpoint público de busca do Mercado Livre Brasil (`/sites/MLB/search`) com `sort=price_asc`, quando o navegador permite a chamada.
2. Mostra até 20 resultados retornados para a busca atual, com título, imagem, preço e link do anúncio.
3. Permite adicionar até 20 produtos à seleção local.
4. Também permite cadastrar manualmente um produto e seu endereço original.
5. Em cada cartão, o usuário abre o anúncio, gera o link no Portal de Afiliados e cola o link oficial no próprio Garimpador.
6. A oferta só pode ser aprovada depois de salvar um link HTTPS.
7. Somente ofertas aprovadas podem abrir a preparação de mensagem do WhatsApp. O envio continua sendo manual.

## Precisão de preço
- A busca pública é solicitada em ordem crescente de preço. Isso mostra os menores preços retornados para o termo, não prova o menor preço de todo o Mercado Livre.
- O usuário deve comparar produtos equivalentes, frete, variações, estado, vendedor e condições.
- O sistema não compara automaticamente modelos diferentes como se fossem equivalentes.

## Limites
- Não acessa a conta do usuário nem automatiza o Portal de Afiliados.
- Não gera, valida a comissão ou presume que um link é afiliado; apenas exige um endereço HTTPS inserido pelo usuário.
- Dados ficam no armazenamento local do navegador/aparelho; não sincronizam entre dispositivos.
- Se a chamada pública da API falhar por rede/CORS, abre a página pública de busca ordenada por preço para continuar manualmente.
- Sem publicação automática e sem deploy.
- Não altera vitrine Wix, aplicativo cliente, integrações existentes ou branch main.

## Arquivos
- `plano-b.html`
- `plano-b.css`
- `plano-b.js`
- `PLANO-B-README.md`

## Referência técnica
A ordenação `price_asc` é documentada pelo Mercado Livre para o recurso de busca de listagens. Isso não é uma autorização nem uma API de geração de links de afiliado; são funcionalidades distintas. Consulte a [documentação oficial de Itens e Buscas](https://developers.mercadolivre.com.br/pt_br/itens-e-buscas).
