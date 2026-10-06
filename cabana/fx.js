/* Efectos — © Carlo · Dev. Sin librerías. Respeta prefers-reduced-motion. */
(function () {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

  // Títulos por palabras
  $$("[data-split]").forEach(el => {
    let i = 0;
    const wrap = n => {
      [...n.childNodes].forEach(c => {
        if (c.nodeType === 3) {
          const f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(t => {
            if (!t.trim()) { f.append(t); return; }
            const w = document.createElement("span"); w.className = "w";
            const s = document.createElement("span"); s.textContent = t; s.style.setProperty("--i", i++);
            w.append(s); f.append(w);
          });
          c.replaceWith(f);
        } else if (c.nodeType === 1) wrap(c);
      });
    };
    wrap(el);
  });

  // Revelados
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .15, rootMargin: "0px 0px -6% 0px" });
  $$(".rv,.rvi,[data-split]").forEach(el => io.observe(el));

  // Paralaje suave
  const par = $$("[data-par]");
  let tick = false;
  const onScroll = () => {
    if (tick) return; tick = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      if (!reduce) par.forEach(el => { el.style.translate = `0 ${(y * parseFloat(el.dataset.par)).toFixed(1)}px`; });
      const nav = $("#nav"); if (nav) nav.classList.toggle("oculto", y > 500 && y > (onScroll.l || 0)); onScroll.l = y;
      tick = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });

  // Botones magnéticos (solo con puntero fino)
  if (!reduce && matchMedia("(pointer:fine)").matches)
    $$("[data-mag]").forEach(b => {
      b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect(); b.style.translate = `${(e.clientX - r.left - r.width / 2) * .18}px ${(e.clientY - r.top - r.height / 2) * .3}px`; });
      b.addEventListener("pointerleave", () => { b.style.translate = ""; });
    });

  // Luciérnagas en la portada
  const cv = $("#luci");
  if (cv && !reduce) {
    const c = cv.getContext("2d"); let W, H, P = [];
    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); W = cv.width = r.width * d; H = cv.height = r.height * d; };
    size(); addEventListener("resize", size);
    const n = innerWidth < 760 ? 22 : 40;
    for (let i = 0; i < n; i++) P.push({ x: Math.random(), y: Math.random(), r: .8 + Math.random() * 2.2, v: .00006 + Math.random() * .00012, a: Math.random() * 6.28, f: .6 + Math.random() * 1.6 });
    let vis = true; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(cv);
    (function loop(t) {
      if (vis) {
        c.clearRect(0, 0, W, H);
        P.forEach(p => {
          p.a += .004; p.x += Math.cos(p.a) * p.v * 16; p.y += Math.sin(p.a * .8) * p.v * 16 - p.v * 3;
          if (p.y < -.05) p.y = 1.05; if (p.x < -.05) p.x = 1.05; if (p.x > 1.05) p.x = -.05;
          const al = (.35 + .65 * Math.abs(Math.sin(t / 1000 * p.f + p.a))) * .8, rr = p.r * (W / 900 + .6) * 3;
          const g = c.createRadialGradient(p.x * W, p.y * H, 0, p.x * W, p.y * H, rr * 4);
          g.addColorStop(0, `rgba(255,214,120,${al})`); g.addColorStop(.25, `rgba(244,186,80,${al * .35})`); g.addColorStop(1, "rgba(244,186,80,0)");
          c.fillStyle = g; c.beginPath(); c.arc(p.x * W, p.y * H, rr * 4, 0, 6.28); c.fill();
        });
      }
      requestAnimationFrame(loop);
    })(0);
  }

  // Visor de fotos
  const lb = $("#lb");
  if (lb) {
    $$(".bento img").forEach(i => i.addEventListener("click", () => { $("img", lb).src = i.src; $("img", lb).alt = i.alt; lb.classList.add("on"); }));
    lb.addEventListener("click", () => lb.classList.remove("on"));
    addEventListener("keydown", e => { if (e.key === "Escape") lb.classList.remove("on"); });
  }

  // Barra móvil: aparece tras la portada y se oculta en el calendario
  const fija = $("#fija"), res = $("#reservar");
  if (fija && res) {
    const h = () => { const r = res.getBoundingClientRect(); fija.classList.toggle("on", scrollY > innerHeight * .8 && !(r.top < innerHeight * .5 && r.bottom > innerHeight * .3)); };
    addEventListener("scroll", h, { passive: true }); h();
  }
})();
