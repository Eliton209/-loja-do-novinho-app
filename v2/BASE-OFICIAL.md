# V2 — Base oficial aprovada

Este arquivo identifica a referência aprovada pelo usuário para continuar o projeto Vitrine V2 da Loja do Novinho.

## Referência imutável de partida

- Repositório: `Eliton209/-loja-do-novinho-app`
- Branch aprovada: `v2-curadoria-marketplaces`
- Commit-base inicial aprovado: `5c3f1248df007dc5865fcae9b41a117322b493ad`
- **Última versão aprovada pelo usuário:** `0381d986f7adc8dcb351bf139e426d7893591cce`
- Preview correspondente: https://loja-do-novinho-v2-preview-42vxzeq9w-pereiraeliton811-1123.vercel.app
- Implantação Vercel: `dpl_6W3nym9CXDvG6QyEs9Nbi3hJgXac` (READY)

## Configurações aprovadas nesta versão

- Cartão inteiro do produto clicável: imagem, título, descrição, preço e área restante abrem o link de afiliado diretamente.
- O botão "Ver oferta" continua funcionando e não provoca abertura duplicada.
- A busca identifica o nicho correspondente e abre a visualização própria desse nicho.
- Na busca, exibe somente os produtos correspondentes dentro do nicho; não mostra uma segunda lista de resultados na parte inferior da vitrine.
- Ao voltar, fecha a visualização do nicho, limpa o termo de busca e retorna diretamente à área dos nichos, sem exibir o banner no percurso.
- O retorno direto aos nichos não bloqueia a navegação normal: o cliente pode continuar rolando a página para cima e para baixo e acessar as demais seções da loja.
- O botão de voltar do nicho e o botão voltar do aparelho fecham a visualização do nicho.
- Aprovado pelo usuário em 25/11/2026.

A versão aprovada mais recente acima passa a ser o ponto de partida para as próximas alterações. O commit-base inicial permanece registrado como histórico.

## Regras obrigatórias para continuar

1. Antes de editar, conferir o HEAD da branch e identificar o commit de referência aprovado.
2. Não confundir "último commit" com "última versão aprovada". Uma alteração posterior só vira referência depois de validação explícita do usuário.
3. Fazer novas mudanças em uma evolução isolada, preservando este commit como ponto de retorno.
4. Não alterar a Wix original, o PWA original, o cadastro de afiliados, o catálogo de origem, nem suas funções existentes.
5. Não entregar URL de preview como versão correta sem confirmar que a implantação corresponde ao código atualizado e foi testada.
6. Se a branch, o commit ou a implantação não puderem ser confirmados, interromper e informar a limitação em vez de adivinhar.

## Fluxo para cada próxima alteração

- Partir do commit aprovado acima (ou de uma evolução aprovada posteriormente).
- Registrar o que mudou e o commit resultante.
- Validar o comportamento solicitado e a implantação.
- Só atualizar esta referência após o usuário confirmar que a nova versão está correta.

Este documento é uma referência de projeto; ele não substitui a confirmação do usuário sobre a experiência visual e funcional.
