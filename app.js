const offlineNote = document.querySelector("#offline-note");
const installButton = document.querySelector("#install-button");
const installButtonLabel = document.querySelector("#install-button-label");
const installHelp = document.querySelector("#install-help");
const installHelpText = document.querySelector("#install-help-text");

const METRICS_ENDPOINT = "https://cwnkpbwnexzulutpnnoq.supabase.co/functions/v1/store-event-tracking-v2";

function deviceToken() {
  let token = localStorage.getItem("ldn_metrics_device");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("ldn_metrics_device", token);
  }
  return token;
}

async function trackEvent(eventType, tokenOverride = null) {
  try {
    const body = JSON.stringify({
      event_type: eventType,
      source: "app",
      device_token: tokenOverride || deviceToken(),
      path: location.pathname
    });
    const response = await fetch(METRICS_ENDPOINT, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true
    });
    if (!response.ok) return false;
    const result = await response.json().catch(() => null);
    return result?.accepted === true;
  } catch (_) {
    // Metrics must never interrupt app navigation or installation.
    return false;
  }
}

let deferredInstallPrompt = null;
let installationConfirmationPromise = null;
void trackEvent("store_open");

function updateConnectionMessage() {
  offlineNote.hidden = navigator.onLine;
}

function markAsInstalled() {
  installButtonLabel.textContent = "APLICATIVO INSTALADO";
  installButton.disabled = true;
  installButton.setAttribute("aria-label", "Aplicativo instalado");
  installHelp.hidden = true;
}

function prepareInstallationConfirmation() {
  const pendingKey = "ldn_install_confirmation_pending_v2";
  const confirmedKey = "ldn_install_confirmed_v2";
  try {
    if (!localStorage.getItem(pendingKey)) {
      localStorage.setItem(pendingKey, crypto.randomUUID());
    }
    localStorage.removeItem(confirmedKey);
  } catch (_) {
    // The confirmation function has a temporary-token fallback.
  }
  installationConfirmationPromise = null;
}

function confirmInstallationOnce() {
  if (installationConfirmationPromise) return installationConfirmationPromise;

  installationConfirmationPromise = (async () => {
    const key = "ldn_install_confirmed_v2";
    const pendingKey = "ldn_install_confirmation_pending_v2";
    let installToken = null;

    try {
      installToken = localStorage.getItem(pendingKey);
      if (!installToken) {
        if (localStorage.getItem(key) === "1") return;
        installToken = crypto.randomUUID();
        localStorage.setItem(pendingKey, installToken);
      }
    } catch (_) {
      // If browser storage is unavailable, still attempt this real confirmation.
      installToken = crypto.randomUUID();
    }

    const accepted = await trackEvent("install_confirmed", installToken);
    if (accepted) {
      try {
        localStorage.setItem(key, "1");
        localStorage.removeItem(pendingKey);
      } catch (_) {
        // The database deduplicates this installation token.
      }
    } else {
      installationConfirmationPromise = null;
    }
  })();

  return installationConfirmationPromise;
}

function showInstallHelp() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSamsung = /samsungbrowser/i.test(navigator.userAgent);

  if (isIOS) {
    installHelpText.textContent = "No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.";
  } else if (isSamsung) {
    installHelpText.textContent = "Abra o menu do Samsung Internet e escolha “Adicionar página a” ou “Instalar aplicativo”, se disponível.";
  } else {
    installHelpText.textContent = "No Chrome, toque nos três pontinhos (⋮) e escolha “Instalar app” ou “Adicionar à tela inicial”.";
  }

  installHelp.hidden = false;
}

const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
if (isStandalone) {
  markAsInstalled();
  void confirmInstallationOnce();
}

// Se o Chrome não puder ser aberto pelo link de intenção, o Android
// retorna à página no navegador de origem com este parâmetro de fallback.
if (new URLSearchParams(location.search).get("ldn_install_fallback") === "1") {
  installHelpText.textContent =
    "O Chrome não abriu automaticamente. No Facebook, toque no menu ⋯ e escolha " +
    "“Abrir no navegador” ou “Abrir no Chrome”. Depois, toque em INSTALAR APLICATIVO.";
  installHelp.hidden = false;
}

installButton.addEventListener("click", async () => {
  // O navegador interno do Facebook no Android normalmente não oferece
  // o evento beforeinstallprompt. Tenta abrir esta mesma página no Chrome.
  const isFacebookAndroid = /Android/i.test(navigator.userAgent) &&
    /(FBAN|FBAV|FB_IAB|Facebook)/i.test(navigator.userAgent);

  if (isFacebookAndroid) {
    const fallbackUrl = new URL(window.location.href);
    fallbackUrl.searchParams.set("ldn_install_fallback", "1");

    const chromeIntent =
      "intent://" + location.host + location.pathname + location.search + location.hash +
      "#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" +
      encodeURIComponent(fallbackUrl.toString()) + ";end";

    installHelpText.textContent =
      "Estamos tentando abrir esta página no Chrome para facilitar a instalação. " +
      "Se isso não acontecer, toque no menu ⋯ do Facebook e escolha “Abrir no navegador”.";
    installHelp.hidden = false;

    // A abertura externa é solicitada diretamente no toque do usuário.
    window.location.href = chromeIntent;
    return;
  }

  if (!deferredInstallPrompt) {
    showInstallHelp();
    return;
  }

  const installPrompt = deferredInstallPrompt;
  deferredInstallPrompt = null;
  try {
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    installHelp.hidden = true;

    if (choice?.outcome === "accepted") {
      // Aceitar o prompt não prova que a instalação terminou.
      // O evento appinstalled ou a próxima abertura em modo standalone
      // são as confirmações usadas para registrar a instalação real.
      installButtonLabel.textContent = "FINALIZANDO INSTALAÇÃO";
    } else {
      installButtonLabel.textContent = "INSTALAR APLICATIVO";
    }
  } catch (_) {
    installButtonLabel.textContent = "TENTAR INSTALAR NOVAMENTE";
    deferredInstallPrompt = null;
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  // A new installable browser session gets its own installation identifier.
  prepareInstallationConfirmation();
  deferredInstallPrompt = event;
  installButtonLabel.textContent = "INSTALAR APLICATIVO";
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  markAsInstalled();
  // Preserve the token created by beforeinstallprompt; create one if the
  // browser installed from its own menu without exposing that event.
  prepareInstallationConfirmation();
  void confirmInstallationOnce();
});

function retryPendingInstallationConfirmation() {
  if (!isStandalone) return;
  try {
    if (localStorage.getItem("ldn_install_confirmation_pending_v1") === "1" &&
        localStorage.getItem("ldn_install_confirmed_v1") !== "1") {
      void confirmInstallationOnce();
    }
  } catch (_) {
    // Storage may be unavailable in restricted browser contexts.
  }
}

window.addEventListener("online", () => {
  updateConnectionMessage();
  retryPendingInstallationConfirmation();
});
window.addEventListener("offline", updateConnectionMessage);
window.addEventListener("pageshow", retryPendingInstallationConfirmation);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") retryPendingInstallationConfirmation();
});
updateConnectionMessage();

document.querySelector(".store-button")?.addEventListener("click", () => {
  void trackEvent("enter_store_click");
});

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  let refreshingForUpdate = false;

  // Quando uma nova versão assume o controle, recarrega uma única vez
  // para que a tela passe a usar os arquivos recém-publicados.
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshingForUpdate) return;
    refreshingForUpdate = true;
    window.location.reload();
  });

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./sw.js", {
        updateViaCache: "none"
      });
      // Verifica atualizações ao abrir o app, sem exigir reinstalação.
      await registration.update();
    } catch (_) {
      // O app continua funcionando online se o navegador bloquear o service worker.
    }
  });
}
