/* Cátedra — animaciones de la portada. © Carlo · Dev */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  /* palabra que cambia en el título */
  const em = $(".hero h1 em");
  if (em && !reduce) {
    const frases = ["a tu ritmo", "desde el celular", "sin estrés", "con certificado"]; let i = 0;
    em.style.display = "inline-block";
    setInterval(() => { em.classList.add("sale"); setTimeout(() => { i = (i + 1) % frases.length; em.textContent = frases[i]; em.classList.remove("sale"); em.classList.add("entra-p"); setTimeout(() => em.classList.remove("entra-p"), 450); }, 350); }, 3200);
  }
  /* cinta de materias */
  const cifras = $(".cifras"); 
  if (cifras) {
    const t = ["Cálculo I", "Estadística", "Python", "Contabilidad", "Excel", "Tesis y APA", "Examen con nota /20", "Certificado con QR", "Racha diaria", "Funciona sin conexión"];
    const m = document.createElement("div"); m.className = "cinta"; m.setAttribute("aria-hidden", "true");
    m.innerHTML = `<div>${[...t, ...t].map(x => `<span>${x}</span>`).join("")}</div>`;
    cifras.parentElement.before(m);
  }
  /* inclinación 3D de tarjetas */
  if (!reduce && matchMedia("(hover:hover)").matches) {
    const tilt = (el, k) => { el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(700px) rotateY(${x * k}deg) rotateX(${-y * k}deg) translateY(-6px)`; }); el.addEventListener("pointerleave", () => { el.style.transform = ""; }); };
    $$(".tarjeta-h").forEach(e => tilt(e, 10));
    document.addEventListener("pointerover", e => { const c = e.target.closest(".plan,.curso"); if (c && !c._t) { c._t = 1; tilt(c, 6); } });
    const hero = $(".hero");
    if (hero) hero.addEventListener("pointermove", e => { const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5; $$(".glifo", hero).forEach((g, i) => g.style.translate = `${x * (20 + i * 12)}px ${y * (20 + i * 12)}px`); });
  }
  /* menú que resalta la sección actual */
  const links = $$('.nav nav a[href^="#"]');
  if (links.length && "IntersectionObserver" in window) {
    const mapa = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting && mapa.has(x.target.id)) { links.forEach(l => l.classList.remove("act")); mapa.get(x.target.id).classList.add("act"); } }), { rootMargin: "-40% 0px -55% 0px" });
    mapa.forEach((a, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }
  /* botón volver arriba */
  const up = document.createElement("button"); up.className = "arriba"; up.type = "button"; up.setAttribute("aria-label", "Volver arriba"); up.textContent = "↑"; document.body.appendChild(up);
  up.onclick = () => scrollTo({ top: 0, behavior: "smooth" });
  addEventListener("scroll", () => up.classList.toggle("on", scrollY > 700), { passive: true });
})();
