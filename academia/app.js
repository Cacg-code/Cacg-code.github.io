/* Cátedra — portada. © Carlo · Dev */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { CURSOS, UNIS } = DATOS, C = Cat, S = Store;
  const toast = t => { const e = $("#toast"); e.textContent = t; e.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("on"), 2600); };
  /* cifras reales desde los datos */
  const lecs = CURSOS.reduce((s, c) => s + C.lecciones(c).length, 0);
  $$("[data-n]").forEach(e => { const k = e.parentNode.querySelector("span").textContent; if (k.includes("lecciones")) e.dataset.n = lecs; if (k.includes("preguntas")) e.dataset.n = CURSOS.length * 5; if (k.includes("universidades")) e.dataset.n = UNIS.length; if (k.includes("cursos")) e.dataset.n = CURSOS.length; });
  $(".acc .btn.lin").textContent = "Ver los " + CURSOS.length + " cursos";
  /* menú */
  const bur = $(".burger"), menu = $("#menu");
  bur.onclick = () => { const on = menu.classList.toggle("on"); bur.setAttribute("aria-expanded", on); };
  $$("#menu a").forEach(a => a.addEventListener("click", () => menu.classList.remove("on")));
  /* catálogo */
  const areas = ["Todos", ...new Set(CURSOS.map(c => c.area))]; let area = "Todos";
  const pinta = () => {
    $("#filtro").innerHTML = areas.map(a => `<button type="button" class="${a === area ? "on" : ""}" data-a="${a}">${a}</button>`).join("");
    const u = S.usuario(), ins = u ? S.inscritos(u.email) : [];
    $("#lista").innerHTML = CURSOS.filter(c => area === "Todos" || c.area === area).map((c, i) => {
      const n = C.lecciones(c).length;
      return `<article class="curso rv in" style="--c:${c.color};--d:${i}"><div style="display:flex;gap:12px;align-items:center"><span class="ico" style="--c:${c.color}">${c.ico.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</span><div><h3>${c.nombre}</h3><small style="color:var(--gris)">${c.prof}</small></div></div>
      <p>${c.desc}</p><div class="meta"><span class="etq">${c.area}</span><span>${n} lecciones</span><span>${c.horas} h</span></div>
      <button class="btn ${ins.includes(c.id) ? "osc" : ""} chico" data-curso="${c.id}">${ins.includes(c.id) ? "Continuar" : "Ver y empezar"}</button></article>`;
    }).join("");
  };
  pinta();
  $("#filtro").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { area = b.dataset.a; pinta(); } });
  /* login */
  const fondo = $("#fondo"), form = $("#form"); let destino = "aula.html";
  $("#u").innerHTML += UNIS.map(u => `<option>${u}</option>`).join("");
  const abre = d => { destino = d || "aula.html"; const u = S.usuario(); if (u) { location.href = destino; return; } fondo.classList.add("on"); setTimeout(() => $("#u").focus(), 50); };
  const cierra = () => fondo.classList.remove("on");
  $$("[data-login]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); abre(); }));
  $$("[data-demo]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); abre(); relleno(); }));
  $("#lista").addEventListener("click", e => { const b = e.target.closest("[data-curso]"); if (b) { const u = S.usuario(); if (u) S.inscribir(u.email, b.dataset.curso); abre("aula.html#/curso/" + b.dataset.curso); if (!u) fondo.dataset.curso = b.dataset.curso; } });
  $(".x", fondo).onclick = cierra; fondo.addEventListener("click", e => { if (e.target === fondo) cierra(); }); addEventListener("keydown", e => { if (e.key === "Escape") cierra(); });
  const relleno = () => { $("#u").value = UNIS[0]; $("#em").value = "maria.condori@correo.com"; $("#co").value = "20241234"; $$(".err").forEach(x => x.textContent = ""); };
  $("#rell").onclick = relleno;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = { uni: $("#u").value, email: $("#em").value.trim(), codigo: $("#co").value.trim() }, er = C.validaLogin(d);
    $$(".err").forEach(x => x.textContent = er[x.dataset.e] || "");
    if (Object.keys(er).length) return;
    S.entrar({ ...d, nombre: C.nombreDeCorreo(d.email) });
    if (fondo.dataset.curso) S.inscribir(d.email, fondo.dataset.curso);
    location.href = destino;
  });
  $$("[data-wa]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); open("https://wa.me/51999999999?text=" + encodeURIComponent("Hola, quiero una propuesta de Cátedra para mi universidad."), "_blank", "noopener"); }));
  /* animaciones */
  const barras = el => $$("[data-w]", el).forEach(b => b.style.setProperty("--w", b.dataset.w));
  const cuenta = e => { const n = +e.dataset.n, t0 = performance.now(); const f = t => { const k = Math.min(1, (t - t0) / 1100); e.textContent = Math.round(n * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };
  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add("in"); barras(x.target); $$("[data-n]", x.target).forEach(cuenta); io.unobserve(x.target); } }), { threshold: .15 }) : null;
  $$(".rv").forEach(e => io ? io.observe(e) : e.classList.add("in"));
  $$(".tarjeta-h,.mini-panel").forEach(e => io ? io.observe(e) : barras(e));
  setTimeout(() => barras($(".tarjeta-h")), 500);
  const bar = $(".progreso"), prog = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.setProperty("--p", h > 0 ? Math.min(1, scrollY / h).toFixed(3) : 0); };
  addEventListener("scroll", prog, { passive: true }); prog();
  const u = S.usuario(); if (u) { const a = $("[data-login]"); a.textContent = "Mi aula"; }
})();
(function () {
  const ops = document.getElementById("ops"), res = document.getElementById("reco-res"); if (!ops) return;
  ops.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    ops.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
    const c = DATOS.CURSOS.find(x => x.id === Cat.recomienda({ interes: b.dataset.i }));
    res.innerHTML = `<span class="ico" style="--c:${c.color};font-size:1.6rem">${String(c.ico).replace(/</g, "&lt;")}</span><div style="flex:1;min-width:180px"><b style="font:700 1.2rem var(--serif)">${c.nombre}</b><br><small style="color:var(--gris)">Te lo recomendamos para empezar.</small></div><button class="btn osc chico" data-curso="${c.id}">Ver y empezar</button>`;
    res.classList.add("on");
  });
  res.addEventListener("click", e => { const b = e.target.closest("[data-curso]"); if (b) document.querySelector('#lista [data-curso="' + b.dataset.curso + '"]')?.click(); });
})();
