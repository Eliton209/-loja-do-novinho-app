# V2 TESTE SEO — READY | cópia isolada para Cloudflare Pages

Esta pasta raiz é uma cópia estática isolada da V2, baseada no commit
`98e55a3dfd7ed3d67ff4326fd0bc7cf6b8976843` da branch
`v2-pwa-vitrine-home-2026-11-26`.

## Arquivos incluídos
- `index.html`, `manifest.webmanifest` e `sw.js`: página, instalação PWA e cache.
- `v2/site/app.js`, `v2/site/catalog.js` e `v2/site/styles.css`: funcionamento e aparência da vitrine.
- `assets/icon-192.png` e `assets/icon-512.png`: ícones utilizados.

## Dependências verificadas
- O catálogo é consultado diretamente na Wix, na coleção pública somente-leitura `AffiliateProducts`.
- Os arquivos carregados pela página não fazem chamadas à Supabase.
- O arquivo antigo `app.js` da raiz, que contém um endpoint de métricas Supabase, não é carregado pelo `index.html` desta V2 nem pelo service worker; por isso foi deixado fora desta cópia.
- Nenhuma tabela ou função Supabase foi copiada, pois não há dependência ativa comprovada da V2 atual.

## Publicação
Projeto estático, sem etapa de compilação. Para Cloudflare Pages via Git:
- Build command: vazio / sem comando.
- Build output directory: `.` (raiz deste branch).
- Não configurar domínio de produção nesta etapa.

## Segurança e preservação
- Esta cópia não inclui o diretório separado do Garimpador, o arquivo CNAME nem o código antigo de telemetria.
- Não contém credenciais administrativas da Wix ou da Supabase.
- A Wix continua sendo a origem do catálogo.
- Esta branch não altera a V2 de teste original, o app oficial, o domínio, a Wix ou qualquer projeto Supabase.
- Criar a branch não publica o site. A publicação exige configurar o projeto na conta Cloudflare e testar a URL de preview.
