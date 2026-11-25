# Loja do Novinho — V2 da vitrine

## Objetivo
Construir uma segunda versão independente da experiência atual, transformando o PWA em uma loja pública completa, acessível pelo navegador e instalável como PWA.

## Regra de preservação
- Não alterar a branch principal (`main`).
- Não alterar o PWA atualmente publicado.
- Não alterar Wix, CMS Afiliados, cadastro atual ou integrações Mercado Livre/Amazon.
- Não publicar esta branch nem associá-la ao domínio de produção.
- Todo desenvolvimento da V2 deve ficar isolado neste diretório/branch até aprovação explícita.

## Auditoria inicial do repositório
A versão atual encontrada na branch de trabalho contém:
- `index.html`, `styles.css`, `app.js`: página de apresentação/instalação.
- `manifest.webmanifest` e `sw.js`: instalação e cache do PWA.
- O botão “ENTRAR NA LOJA” encaminha para a Wix.
- O JavaScript atual envia eventos de métricas para uma função Supabase.
- O arquivo `CNAME` contém o domínio de produção. Portanto, esta branch não deve ser publicada no GitHub Pages nem conectada ao domínio atual.

## Arquitetura pretendida
1. Front-end da vitrine em diretório próprio, sem substituir os arquivos atuais.
2. Banco de dados próprio na nuvem, independente do CMS Wix.
3. Catálogo público com páginas individuais por produto e categoria.
4. Renderização no servidor ou pré-renderização para que o conteúdo principal esteja presente no HTML entregue ao Google.
5. Sitemap XML, canonical, metadados, links internos rastreáveis e dados estruturados adequados aos produtos.
6. PWA instalável como opção; a loja também deve funcionar no navegador sem instalação.
7. Integração futura do cadastro para publicar uma vez no banco próprio e sincronizar com Wix e V2, sem mudar a lógica atual antes de testes e autorização.

## Critérios de fidelidade visual
A vitrine Wix atual é a referência visual obrigatória. Não redesenhar nem simplificar a interface. Antes de implementar o catálogo, obter e registrar capturas/referências da página inicial, categorias, cartões, busca e detalhes dos produtos. A validação visual deve comparar desktop e celular.

## Próximos passos
- Registrar a referência pública exata da vitrine Wix e capturas atuais.
- Auditar assets e comportamento atual sem alterar a versão publicada.
- Escolher a infraestrutura do banco próprio e a estratégia de renderização/hosting.
- Implementar a V2 em arquivos próprios, com testes isolados.
- Só depois avaliar a sincronização do cadastro de afiliados.
