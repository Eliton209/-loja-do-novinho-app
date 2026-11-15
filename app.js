const offlineNote = document.querySelector("#offline-note");
const installButton = document.querySelector("#install-button");
const installButtonLabel = document.querySelector("#install-button-label");
const installHelp = document.querySelector("#install-help");
const installHelpText = document.querySelector("#install-help-text");

const METRICS_ENDPOINT = "https://cwnkpbwnexzulutpnnoq.supabase.co/functions/v1/store-event";

function deviceToken() {
  let token = localStorage.getItem("ldn_metrics_device");
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem("ldn_metrics_device", token);
  }
  return token;
}

async function trackEvent(eventType) {
  try {
    const body = JSON.stringify({
      event_type: eventType,
      source: "app",
      device_token: deviceToken(),
      path: location.pathname
    });
    const response = await fetch(METRICS_ENDPOINT, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true
    });
    return response.ok;
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

function confirmInstallationOnce() {
  if (installationConfirmationPromise) return installationConfirmationPromise;

  installationConfirmationPromise = (async () => {
    const key = "ldn_install_confirmed_v1";
    try {
      if (localStorage.getItem(key) === "1") return;
    } catch (_) {
      // The server also deduplicates installation confirmations by device.
    }

    const accepted = await trackEvent("install_confirmed");
    if (accepted) {
      try {
        localStorage.setItem(key, "1");
      } catch (_) {
        // The database-side deduplication remains the source of truth.
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

installButton.addEventListener("click", async () => {
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
  deferredInstallPrompt = event;
  installButtonLabel.textContent = "INSTALAR APLICATIVO";
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  markAsInstalled();
  void confirmInstallationOnce();
});

window.addEventListener("online", updateConnectionMessage);
window.addEventListener("offline", updateConnectionMessage);
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
