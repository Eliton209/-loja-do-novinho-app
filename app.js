const offlineNote = document.querySelector("#offline-note");

function updateConnectionMessage() {
  offlineNote.hidden = navigator.onLine;
}

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
