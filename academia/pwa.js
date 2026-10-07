/* Cátedra — registro offline e instalación. © Carlo · Dev */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
let inst = null;
addEventListener("beforeinstallprompt", e => {
  e.preventDefault(); inst = e;
  const b = document.createElement("button"); b.className = "btn chico instala"; b.textContent = "⬇ Instalar app";
  b.onclick = () => { inst.prompt(); inst.userChoice.finally(() => b.remove()); };
  document.body.appendChild(b);
});
addEventListener("offline", () => { const t = document.getElementById("toast"); if (t) { t.textContent = "Sin conexión: sigues estudiando con lo guardado"; t.classList.add("on"); setTimeout(() => t.classList.remove("on"), 3000); } });
