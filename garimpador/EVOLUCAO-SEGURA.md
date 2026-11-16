# Garimpador LDN — evolução isolada

## Proteção obrigatória

Esta evolução parte da branch preservada `pwa-installacao-independente` e deve permanecer isolada em `garimpador-ldn-evolucao`.

**Não modificar nesta etapa nem nas próximas sem autorização específica:**
- vitrine pública Wix e sua margem/layout;
- aplicativo cliente da Loja do Novinho (AP);
- cadastros, coleções CMS, produtos publicados ou categorias da loja;
- integrações Wix/Supabase já operacionais;
- arquivos fora de `garimpador/`, salvo se uma dependência nova for indispensável e aprovada.

Não fazer deploy, publicar no GitHub Pages, alterar domínio, workflows, variáveis ou segredos como parte desta evolução sem autorização explícita.

## Estado herdado

A versão preservada contém:
- snapshot local de 173 produtos publicados na coleção Wix;
- filtros por marketplace e nicho;
- preparação assistida de mensagens para WhatsApp;
- fila local de ofertas;
- pesquisa manual no Mercado Livre que abre a página de resultados;
- formulário manual para salvar oferta e link de afiliado.

Ela **ainda não** executa garimpagem automática, não gera links de afiliado automaticamente e não publica produtos na Wix.

## Escopo aprovado

1. Garimpagem automática de produtos relacionados aos nichos já usados na loja.
2. Mercado Livre como fonte principal, usando API e credenciais autorizadas.
3. Tentar integração com Magazine Luiza somente se houver API/acesso autorizado e condições técnicas verificáveis.
4. Exibir produtos encontrados em uma fila de revisão do Garimpador, com imagem, nome, preço, descrição, origem e link.
5. Preparar compartilhamento assistido para WhatsApp; não enviar mensagens automaticamente.
6. Disponibilizar ação individual **Publicar na Loja**. Antes de publicar, mostrar os dados para conferência e exigir clique de confirmação. Sem confirmação, o produto permanece somente no Garimpador.
7. Não incluir integração Shopee nesta etapa.
8. Não incluir Facebook/Meta.

## Requisitos técnicos antes de ativar APIs

- Nunca colocar client secret, access token, refresh token ou chave Supabase no JavaScript do navegador.
- As chamadas autenticadas devem passar por backend seguro (por exemplo, Edge Function existente, após inspeção e aprovação), com validação de sessão e autorização.
- Reutilizar integração existente somente depois de verificar seu código e contrato; não alterar OAuth nem sobrescrever funções operacionais.
- Não inventar disponibilidade de API, dados, preço ou link de afiliado. Se a API não permitir gerar link afiliado, mostrar claramente que a ação precisa de método oficial/assistido.
- A publicação Wix deve ser uma operação explícita, individual, idempotente e auditável. Não publicar em lote nem automaticamente.
- Separar produtos encontrados de produtos efetivamente publicados na loja.
- Manter o snapshot e a fila local herdados compatíveis até que a nova camada seja testada.

## Sequência de implementação

1. Auditar arquivos e dependências da branch preservada e identificar backend/integrações já existentes sem alterá-los.
2. Definir contratos de API e modelo de dados isolados do app cliente.
3. Implementar interface e busca em ambiente de teste, sem credenciais reais.
4. Implementar backend somente após confirmar a API e a autorização disponíveis.
5. Testar busca, deduplicação, classificação, fila e compartilhamento.
6. Testar publicação individual em ambiente seguro; exigir confirmação antes de qualquer gravação na coleção Wix.
7. Apresentar diff e resultado dos testes antes de solicitar autorização para deploy.

## Regra de segurança

Se uma mudança puder afetar a vitrine, a margem, o AP ou qualquer recurso existente da Loja do Novinho, interromper e pedir autorização antes de prosseguir.
