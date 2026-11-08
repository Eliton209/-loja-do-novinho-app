const offlineNote = document.querySelector("#offline-note");
const installButton = document.querySelector("#install-button");
const installButtonLabel = document.querySelector("#install-button-label");
const installHelp = document.querySelector("#install-help");
const installHelpText = document.querySelector("#install-help-text");

let deferredInstallPrompt = null;

function updateConnectionMessage() {
  offlineNote.hidden = navigator.onLine;
}

function markAsInstalled() {
  installButtonLabel.textContent = "APLICATIVO INSTALADO";
  installButton.disabled = true;
  installButton.setAttribute("aria-label", "Aplicativo instalado");
  installHelp.hidden = true;
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

if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
  markAsInstalled();
}

installButton.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    showInstallHelp();
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installButtonLabel.textContent = "INSTALAÇÃO SOLICITADA";
  installHelp.hidden = true;
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installButtonLabel.textContent = "INSTALAR APLICATIVO";
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  markAsInstalled();
});

window.addEventListener("online", updateConnectionMessage);
window.addEventListener("offline", updateConnectionMessage);
updateConnectionMessage();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // A PWA continua funcionando online se o navegador bloquear o service worker.
    });
  });
}
