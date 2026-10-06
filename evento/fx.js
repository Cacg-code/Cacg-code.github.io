/* Jolgorio — capa de animación compartida. © Carlo · Dev */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const quieto = matchMedia("(prefers-reduced-motion:reduce)").matches, tactil = matchMedia("(hover:none)").matches;
  /* barra de progreso de lectura */
  const bar = document.createElement("div"); bar.className = "progreso"; bar.setAttribute("aria-hidden", "true"); document.body.appendChild(bar);
  const prog = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.setProperty("--p", h > 0 ? Math.min(1, scrollY / h).toFixed(3) : 0); };
  addEventListener("scroll", prog, { passive: true }); prog();
  /* índice para entradas escalonadas */
  const indexa = raiz => $$(".sol,.ev,.chk label,.extras .ex,.tipos .tp", raiz).forEach(e => { if (!e.style.getPropertyValue("--i")) e.style.setProperty("--i", Math.min(10, [...e.parentNode.children].indexOf(e))); });
  $$(".bento,.paq,.casos,.pasos,.ops,.muestras,.lista-v,.faq").forEach(g => [...g.children].forEach((c, i) => { if (c.classList.contains("rv")) c.style.setProperty("--d", i); }));
  /* la línea de pasos se dibuja al entrar en pantalla */
  $$(".pasos").forEach(el => { if (!("IntersectionObserver" in window)) return el.classList.add("in"); new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { el.classList.add("in"); o.disconnect(); } }, { threshold: .3 }).observe(el); });
  /* brillo bajo el cursor */
  const SEL = ".srv,.pk,.ps,.caso,.kpi,.sol,.ev,.faq details,.op,.ex,.tp";
  function brillo(raiz) {
    if (tactil || quieto) return;
    $$(SEL, raiz).forEach(c => { if (c.querySelector(":scope>.glow")) return; if (getComputedStyle(c).position === "static") c.style.position = "relative"; const g = document.createElement("u"); g.className = "glow"; g.setAttribute("aria-hidden", "true"); c.appendChild(g); });
  }
  if (!tactil && !quieto) {
    document.addEventListener("pointermove", e => { const c = e.target.closest && e.target.closest(SEL); if (c) { const r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px"); } }, { passive: true });
    /* héroe: inclinación y paralaje */
    const vis = $(".vis"), hero = $(".hero");
    if (vis && hero) {
      hero.addEventListener("pointermove", e => { const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; vis.style.setProperty("--ry", (x * 7).toFixed(2) + "deg"); vis.style.setProperty("--rx", (-y * 6).toFixed(2) + "deg"); vis.style.setProperty("--px", x.toFixed(2)); vis.style.setProperty("--py", y.toFixed(2)); });
      hero.addEventListener("pointerleave", () => { vis.style.setProperty("--ry", "0deg"); vis.style.setProperty("--rx", "0deg"); vis.style.setProperty("--px", 0); vis.style.setProperty("--py", 0); });
    }
  }
  /* cifras del panel que cuentan hasta su valor */
  const kp = $("#kpis");
  if (kp) {
    const ant = [];
    const cuenta = () => $$(".kpi b", kp).forEach((b, i) => {
      const t = b.textContent, m = t.match(/[\d,]+/); if (!m) return; const fin = Number(m[0].replace(/,/g, "")); if (ant[i] === t) return; ant[i] = t;
      if (quieto) return; const ini = performance.now(), dur = 900;
      (function paso(n) { const k = Math.min(1, (n - ini) / dur), v = Math.round(fin * (1 - Math.pow(1 - k, 3))); b.textContent = t.replace(m[0], fin >= 1000 ? v.toLocaleString("en-US") : v); if (k < 1) requestAnimationFrame(paso); else b.textContent = t; })(ini);
    });
    new MutationObserver(cuenta).observe(kp, { childList: true }); cuenta();
  }
  /* contenido que se pinta dinámicamente: índices y brillo */
  const aplica = () => { indexa(document); brillo(document); };
  ["#lista", "#evs", "#extras", "#pasos", "#calP", "#det", "#bento", "#paq", "#kpis"].map(s => $(s)).filter(Boolean)
    .forEach(el => new MutationObserver(() => { clearTimeout(aplica.t); aplica.t = setTimeout(aplica, 30); }).observe(el, { childList: true, subtree: true }));
  aplica(); setTimeout(aplica, 400);
  /* el número de invitados "late" al cambiar */
  const out = $(".num output");
  if (out) new MutationObserver(() => { out.classList.add("tic"); setTimeout(() => out.classList.remove("tic"), 160); }).observe(out, { childList: true, characterData: true, subtree: true });
})();
