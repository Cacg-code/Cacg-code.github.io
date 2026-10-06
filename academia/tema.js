/* Cátedra — tema claro/oscuro. © Carlo · Dev */
(function () {
  let t = "claro";
  try { t = localStorage.getItem("ac_tema") || (matchMedia("(prefers-color-scheme:dark)").matches ? "oscuro" : "claro"); } catch (e) {}
  const ponTema = v => { t = v; document.documentElement.dataset.tema = v; try { localStorage.setItem("ac_tema", v); } catch (e) {} const b = document.querySelector(".tema"); if (b) { b.textContent = v === "oscuro" ? "☀" : "🌙"; b.setAttribute("aria-label", v === "oscuro" ? "Tema claro" : "Tema oscuro"); } };
  document.documentElement.dataset.tema = t;
  addEventListener("DOMContentLoaded", () => {
    const b = document.createElement("button"); b.type = "button"; b.className = "tema"; b.onclick = () => ponTema(t === "oscuro" ? "claro" : "oscuro");
    const yo = document.querySelector(".yo"), nav = document.querySelector(".nav nav");
    if (yo) yo.insertBefore(b, yo.querySelector(".quien") || yo.firstChild); else if (nav) nav.insertBefore(b, nav.lastElementChild);
    ponTema(t);
  });
})();
