# Auditoria técnica do PWA original — 25/11/2026

## Escopo e segurança
Esta auditoria é somente de leitura da versão publicada na branch `main`. Nenhum arquivo de produção foi alterado. Todo o trabalho novo permanece na branch `v2-vitrine-seo`, dentro de `v2/`.

## Arquivos existentes na versão original
- `index.html`: página de apresentação, instalação e botão de entrada na loja.
- `styles.css`: identidade visual azul/branca, cartão central e botões.
- `app.js`: instalação PWA, instruções para navegadores, telemetria de eventos e navegação para a loja.
- `manifest.webmanifest`: nome, ícones, idioma e modo standalone.
- `sw.js`: cache offline e atualização do service worker.
- `assets/logo-principal.jpeg`, `assets/icon-192.png`, `assets/icon-512.png`: identidade visual e ícones.

## Comportamento constatado no código
1. O botão principal de instalação tenta usar o evento `beforeinstallprompt` e oferece instruções alternativas para iOS, Samsung Internet e Chrome.
2. O app registra eventos como abertura, clique para entrar na loja e confirmação de instalação por meio de uma função Supabase.
3. O botão “ENTRAR NA LOJA” abre um endereço Wix externo.
4. O service worker mantém os arquivos do app em cache e atualiza o conteúdo quando há nova versão.

## Divergência de endereço a resolver somente na V2
O link encontrado no `index.html` da branch principal aponta para:
`https://website-pereiraeliton811-0710.wix-site-host.com/`

O site Wix principal identificado e confirmado para a Loja do Novinho é:
`https://headless-omzdmjlmmox-pereiraeliton811-1410.wix-site-host.com/`

Não corrigir o link do PWA original neste projeto. A V2 deve consultar e reproduzir o site principal confirmado, e a divergência deve ser tratada como referência de navegação, não como autorização para alterar produção.

## Referência Wix identificada
- Nome: Loja do Novinho
- Site ID: `ced5eb51-bcea-4ba8-a667-bc098c3eb70b`
- URL publicada: `https://headless-omzdmjlmmox-pereiraeliton811-1410.wix-site-host.com/`
- O site foi aberto no painel de visualização Wix durante a investigação.

## Regras obrigatórias da V2
- Não alterar `main`, nem arquivos do PWA original.
- Não alterar o site Wix, CMS Afiliados, formulários ou integrações Mercado Livre/Amazon.
- Não publicar a V2 no domínio de produção nem conectar o CNAME atual.
- Criar arquivos próprios dentro de `v2/` e validar em ambiente de teste isolado.
- Manter fidelidade visual e funcional à vitrine Wix: páginas, categorias, cartões, busca, detalhes de produto e navegação.
- A V2 deve funcionar no navegador sem instalação; instalação PWA é complementar.
- Nenhuma sincronização de cadastro ou escrita no Wix/CMS deve ocorrer sem plano de testes e autorização específica.

## Próximos passos
1. Registrar capturas de referência da home, categorias, busca, cartões e detalhes do produto em desktop e celular.
2. Identificar a origem pública dos dados de produtos e as regras de apresentação sem modificar o CMS.
3. Definir banco e hospedagem isolados antes de implementar integração.
4. Implementar a interface em `v2/` e comparar visualmente com a referência Wix.
5. Testar links externos e responsividade; só então disponibilizar uma URL privada/de teste para aprovação.
