// Loja do Novinho V2 — acesso público somente-leitura ao CMS Wix.
// Esta coleção permite leitura ANYONE e reserva escrita a ADMIN.
// Nenhuma operação de inserção, atualização ou remoção existe neste módulo.

const WIX_CLIENT_ID = "1b146849-2f68-4e15-91ed-fe9284bcabd6";
const COLLECTION_ID = "AffiliateProducts";
const API_BASE = "https://www.wixapis.com";
const TOKEN_KEY = "ldn-v2-wix-visitor-" + WIX_CLIENT_ID;
let cachedToken = null;
let pendingToken = null;

async function getVisitorToken() {
  if (cachedToken && cachedToken.expiresAt - 60000 > Date.now()) {
    return cachedToken.accessToken;
  }

  if (!pendingToken) {
    pendingToken = (async () => {
      let saved = null;
      try {
        saved = JSON.parse(localStorage.getItem(TOKEN_KEY) || "null");
      } catch {
        saved = null;
      }

      if (saved?.accessToken && saved?.refreshToken && saved.expiresAt - 60000 > Date.now()) {
        cachedToken = saved;
        return saved.accessToken;
      }

      if (saved?.refreshToken) {
        try {
          const refreshed = await fetch(API_BASE + "/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientId: WIX_CLIENT_ID,
              grantType: "refresh_token",
              refreshToken: saved.refreshToken
            })
          });
          if (refreshed.ok) {
            const data = await refreshed.json();
            const tokens = {
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
              expiresAt: Date.now() + data.expires_in * 1000
            };
            cachedToken = tokens;
            try { localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens)); } catch {}
            return tokens.accessToken;
          }
        } catch {}
      }

      const response = await fetch(API_BASE + "/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: WIX_CLIENT_ID, grantType: "anonymous" })
      });
      if (!response.ok) throw new Error("Não foi possível autenticar a leitura pública do catálogo.");
      const data = await response.json();
      const tokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + data.expires_in * 1000
      };
      cachedToken = tokens;
      try { localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens)); } catch {}
      return tokens.accessToken;
    })().finally(() => {
      pendingToken = null;
    });
  }

  return pendingToken;
}

async function queryPage(offset, accessToken) {
  const response = await fetch(API_BASE + "/data/v2/items/query", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      dataCollectionId: COLLECTION_ID,
      query: {
        filter: { published: true },
        sort: [{ fieldName: "_createdDate", order: "DESC" }],
        paging: { limit: 100, offset }
      },
      returnTotalCount: true
    })
  });

  if (!response.ok) {
    throw new Error("A consulta pública do catálogo falhou (" + response.status + ").");
  }
  return response.json();
}

export async function loadPublishedProducts() {
  const accessToken = await getVisitorToken();
  const all = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const page = await queryPage(offset, accessToken);
    const items = Array.isArray(page.dataItems) ? page.dataItems : [];
    const pageTotal = page.pagingMetadata?.total;
    if (Number.isFinite(pageTotal)) total = pageTotal;

    for (const record of items) {
      const data = record?.data || {};
      if (data.published !== true) continue;
      all.push({
        id: data._id || record.id || "",
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        platform: data.platform || "",
        price: data.price || "",
        imageUrl: data.imageUrl || "",
        affiliateUrl: data.affiliateUrl || ""
      });
    }

    if (!items.length) break;
    offset += items.length;
  }

  return all;
}
