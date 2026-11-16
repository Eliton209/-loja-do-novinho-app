# Garimpador LDN — auditoria do fluxo de links de afiliado

Data da auditoria: 16/11/2026

## Decisão atual

O Plano A continua sendo a prioridade: obter links especiais de afiliado por um método disponibilizado e autorizado pelo Mercado Livre. O processamento será sequencial, um produto por vez. Não usar links comuns como se fossem links de afiliado e não considerar um URL válido apenas por abrir o produto.

## O que foi confirmado

- A Central de Afiliados documenta geração por meio do Gerador de Links e da Barra de Afiliados.
- O Gerador de Links funciona no Portal do Afiliado pelo computador.
- A Barra de Afiliados pode ser ativada nas configurações do portal e usada ao visualizar um produto.
- O fluxo documentado é operacional/manual. Na documentação pública consultada não foi localizado contrato de API pública para solicitar a geração de Links Especiais por código.
- A documentação pública não autoriza, por si só, automatizar a interface autenticada do portal. Não implementar robô de navegador, extensão, scraping do portal, automação de cliques ou reutilização de cookies/sessões sem autorização escrita do Mercado Livre.
- A geração individual é preferível para a fila: um item em processamento, resultado individual, erro individual e validação antes de passar ao próximo.

## Auditoria do estado encontrado

### Supabase

- Edge Function `garimpador-auto-search`: ativa, versão 8, `verify_jwt=false`.
- Essa função percorre páginas HTML de resultados do Mercado Livre para extrair IDs e, quando não encontra IDs, tenta a API pública de busca. Depois consulta dados públicos de itens e grava registros pendentes em `garimpador_products`.
- A função atual não gera Links Especiais de afiliado; grava `product_url` e deixa `affiliate_url` sem preenchimento.
- A validação manual de JWT na função consulta um projeto Supabase diferente do projeto de dados configurado por ambiente. Isso precisa ser corrigido e testado antes de expor ou depender dessa função para uso no painel.
- A tabela `garimpador_products` possui os campos necessários para separar `product_url` e `affiliate_url`, e tem RLS ativado. A política observada restringe acesso autenticado ao e-mail administrativo configurado.
- Na consulta realizada em 16/11/2026, a tabela `garimpador_products` estava vazia.
- A Edge Function `mercado-livre-oauth` está ativa apenas como resposta 410 de integração desativada. Não reativar sem identificar e confirmar um escopo oficial de OAuth que cubra o Programa de Afiliados.
- `mercado-livre-notifications` é atualmente um endpoint de confirmação sem processamento de eventos.

### GitHub / interface isolada

- A branch de trabalho é `garimpador-ldn-evolucao`; a branch `main` não deve ser alterada.
- O `garimpador/app.js` atual ainda usa uma fila local no navegador (`localStorage`) para ofertas inseridas manualmente, exigindo que o usuário cole um link HTTPS de afiliado.
- A tela atual explica que não cria links de afiliado automaticamente.
- A busca automática do Supabase ainda não está conectada a essa fila local da interface.

## Riscos e limites

1. A extração automatizada de resultados por HTML (scraping) encontrada em `garimpador-auto-search` não deve ser ampliada nem tratada como aprovada. A documentação/termos do programa precisam ser respeitados; se houver dúvida, solicitar confirmação escrita ao suporte do Mercado Livre.
2. A API pública de itens e busca de produtos não equivale a uma API de afiliados e não gera atribuição de comissão.
3. Não automatizar login, CAPTCHA, cliques, coleta de cookies ou extração de sessão do Portal/Barra de Afiliados.
4. Não armazenar senha, cookie de sessão ou token do Portal de Afiliados.
5. Não publicar nada na Wix sem confirmação individual do usuário.
6. Não fazer deploy ou alterar secrets nesta etapa.

## Próxima etapa antes de programar a geração

Solicitar ao suporte do Programa de Afiliados do Mercado Livre uma confirmação escrita sobre:
- existência de API, endpoint ou integração oficial disponível para a conta do afiliado gerar um Link Especial para uma URL de produto;
- possibilidade de executar a geração sequencial (um produto por requisição);
- requisitos de autenticação, limites, etiquetas e regras de uso;
- possibilidade de integração server-side sem automação de navegador.

Somente após resposta positiva e documentação verificável, implementar o adaptador server-side individual. Cada item deverá transitar por estados claros, por exemplo: `pending`, `processing`, `affiliate_link_created`, `needs_user_action`, `failed`, `approved`. O estado `affiliate_link_created` só poderá ser usado após receber o Link Especial pelo mecanismo oficial confirmado.

## Proteções mantidas

- Não modificar a vitrine Wix, coleções CMS, aplicativo cliente ou integrações operacionais.
- Não alterar a branch `main`.
- Não mudar para o Plano B sem conversar com o usuário.
- Não fazer deploy.
