/* © 2026 Carlo Andre Chiuyare Guillen (Carlo · Dev). Efectos compartidos: texto partido, revelados, parallax, cursor, imanes, progreso. */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Parte el texto en palabras y letras (para la subida enmascarada)
  $$("[data-split]").forEach(el => {
    const nodes = [...el.childNodes]; let i = 0; el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    el.textContent = "";
    nodes.forEach(n => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { el.append(" "); return; }
          const w = document.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
          [...t].forEach(ch => { const l = document.createElement("span"); l.className = "l"; l.style.setProperty("--i", i++); l.textContent = ch; w.append(l) });
          el.append(w);
        });
      } else if (n.nodeType === 1) { // <br> o <em>: se parte su contenido igual
        if (n.tagName === "BR") { el.append(n); return }
        const c = n.cloneNode(false), w = document.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
        [...n.textContent].forEach(ch => { const l = document.createElement("span"); l.className = "l"; l.style.setProperty("--i", i++); l.textContent = ch === " " ? " " : ch; c.append(l) });
        w.append(c); el.append(w);
      }
    });
  });

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target) } }), { threshold: .15, rootMargin: "0px 0px -6% 0px" });
  const watch = () => $$(".rv:not(.on),[data-split]:not(.on)").forEach(el => reduce ? el.classList.add("on") : io.observe(el));
  window.fxWatch = watch; watch();

  // Parallax suave y progreso del scroll (un solo rAF)
  const pars = $$("[data-par]"), marqs = $$(".marq");
  let last = scrollY, vel = 0, tick = false, dirs = marqs.map(() => 0), pos = marqs.map(() => 0);
  function frame() {
    tick = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
    vel += (y - last - vel) * .12; last = y;
    if (!reduce) {
      pars.forEach(el => {
        const r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const k = +el.dataset.par, c = r.top + r.height / 2 - innerHeight / 2;
        el.style.translate = `0 ${(-c * k).toFixed(1)}px`;
      });
      marqs.forEach((m, i) => {
        const tr = m.firstElementChild, half = tr.scrollWidth / 2, dir = m.dataset.dir === "r" ? 1 : -1;
        pos[i] += dir * (1.1 + Math.abs(vel) * .35); if (dir < 0 && pos[i] <= -half) pos[i] += half; if (dir > 0 && pos[i] >= 0) pos[i] -= half;
        tr.style.transform = `translate3d(${pos[i]}px,0,0)`;
      });
    }
    if (!reduce && (Math.abs(vel) > .05 || marqs.length)) requestAnimationFrame(frame), tick = true;
  }
  marqs.forEach((m, i) => { if (m.dataset.dir === "r") pos[i] = -m.firstElementChild.scrollWidth / 2 });
  addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(frame) } }, { passive: true });
  addEventListener("resize", frame);
  frame();
  if (reduce) marqs.forEach(m => m.firstElementChild.style.transform = "none");

  // Cursor con etiqueta e imanes (solo con ratón)
  const cur = document.getElementById("cur");
  if (cur && matchMedia("(hover:hover) and (pointer:fine)").matches && !reduce) {
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener("pointermove", e => { x = e.clientX; y = e.clientY }, { passive: true });
    (function mover() { cx += (x - cx) * .2; cy += (y - cy) * .2; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(mover) })();
    document.addEventListener("pointerover", e => {
      const t = e.target.closest("[data-cur]");
      if (t) { cur.firstElementChild.textContent = t.dataset.cur; cur.classList.add("big") } else cur.classList.remove("big");
    });
    $$("[data-mag]").forEach(b => {
      b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect(); b.style.translate = `${(e.clientX - r.left - r.width / 2) * .22}px ${(e.clientY - r.top - r.height / 2) * .3}px` });
      b.addEventListener("pointerleave", () => { b.style.translate = "0 0" });
    });
  }
})();
