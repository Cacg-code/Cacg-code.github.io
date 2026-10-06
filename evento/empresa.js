/* Jolgorio — © Carlo · Dev (demo). Web de la organizadora: animaciones y cotizador. */
(function () {
  const J = window.JOL, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const NUM = "51999999999", YAPE = "999 888 777", TITULAR = "Jolgorio Eventos (demo)";
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const leer = (k, def) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const getSols = () => { const s = leer("jol_sol", null); return Array.isArray(s) ? s : J.semilla(); };
  let tt; const toast = m => { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2600); };
  const wa = t => `https://wa.me/${NUM}?text=${encodeURIComponent(t)}`;
  $("#wa").href = wa("Hola Jolgorio, quiero información para organizar un evento"); $("#waFinal").href = wa("Hola Jolgorio, quiero cotizar mi evento");

  /* Navegación */
  const nav = $("#nav"), burger = $("#burger"), menu = $("#menu");
  addEventListener("scroll", () => nav.classList.toggle("fondo", scrollY > 30), { passive: true }); nav.classList.toggle("fondo", scrollY > 30);
  burger.onclick = () => { const o = menu.classList.toggle("on"); burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Cerrar menú" : "Abrir menú"); };
  $$("#menu a").forEach(a => a.addEventListener("click", () => { menu.classList.remove("on"); burger.setAttribute("aria-expanded", "false"); }));

  /* Revelar al hacer scroll */
  let io;
  function revela() {
    if (!("IntersectionObserver" in window)) return $$(".rv").forEach(e => e.classList.add("in"));
    io = io || new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -5% 0px" });
    $$(".rv:not(.in)").forEach(el => io.observe(el));
  }

  /* Cifras que cuentan */
  function cuentaCifras() {
    const el = $(".cifras"); if (!el) return;
    const corre = () => $$("b[data-n]", el).forEach(b => {
      const meta = Number(b.dataset.n), dec = b.dataset.dec ? 1 : 0, mas = b.dataset.mas ? "+" : "", t0 = performance.now(), dur = 1400;
      const paso = t => { const k = Math.min(1, (t - t0) / dur), v = meta * (1 - Math.pow(1 - k, 3)); b.textContent = v.toFixed(dec) + (k === 1 ? mas : ""); if (k < 1) requestAnimationFrame(paso); };
      reduce ? b.textContent = meta.toFixed(dec) + mas : requestAnimationFrame(paso);
    });
    new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { corre(); o.disconnect(); } }, { threshold: .5 }).observe(el);
  }

  /* Confeti de la portada */
  function confeti() {
    const c = $("#conf"); if (!c || reduce) return; const x = c.getContext("2d"), col = ["#FF5A3C", "#FFC53D", "#6B3FE0", "#FF7AB6", "#22C99A", "#fff"];
    let w, h, ps = [], vivo = true, raf;
    const mide = () => { const d = Math.min(devicePixelRatio || 1, 2); w = c.clientWidth; h = c.clientHeight; c.width = w * d; c.height = h * d; x.setTransform(d, 0, 0, d, 0, 0); };
    const nueva = (y0) => ({ x: Math.random() * w, y: y0 ?? Math.random() * h, w: 6 + Math.random() * 8, h: 3 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - .5) * .08, vy: .35 + Math.random() * .8, vx: (Math.random() - .5) * .4, c: col[Math.random() * col.length | 0], a: .35 + Math.random() * .5 });
    mide(); ps = Array.from({ length: innerWidth < 760 ? 26 : 48 }, () => nueva());
    addEventListener("resize", mide);
    const dibuja = () => { x.clearRect(0, 0, w, h); ps.forEach(p => { p.y += p.vy; p.x += p.vx + Math.sin(p.y / 60) * .3; p.r += p.vr; if (p.y > h + 20) Object.assign(p, nueva(-20)); x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.globalAlpha = p.a; x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore(); }); if (vivo) raf = requestAnimationFrame(dibuja); };
    new IntersectionObserver(es => { vivo = es[0].isIntersecting; if (vivo) { cancelAnimationFrame(raf); dibuja(); } }, { threshold: 0 }).observe($("#inicio"));
  }

  /* Servicios y paquetes */
  const ORDEN = ["boda", "quince", "cumple", "despedida", "corp"];
  $("#bento").innerHTML = ORDEN.map((id, i) => { const t = J.TIPOS[id], desde = J.presupuesto({ tipo: id, invitados: t.min, extras: [] }).total;
    return `<a class="srv rv" style="--d:${i}" href="#cotiza" data-tipo="${id}"><span class="em" aria-hidden="true">${t.emoji}</span><h3>${t.n}</h3><p>${t.d}</p><div class="go"><b>Desde ${J.soles(desde)}</b><span>Cotizar →</span></div></a>`; }).join("");
  $("#paq").innerHTML = Object.values(J.PAQUETES).map((p, i) => {
    const ej = J.presupuesto({ tipo: "cumple", invitados: 60, fecha: null, extras: p.extras });
    return `<div class="pk rv${p.id === "completo" ? " top" : ""}" style="--d:${i}">${p.id === "completo" ? '<span class="tag">⭐ El más pedido</span>' : ""}<h3>${p.n}${p.dto ? `<span class="ahorro">−${p.dto} %</span>` : ""}</h3><p class="d">${p.d}</p><div class="pr">${J.soles(ej.total)}</div><div class="pr-n">Ejemplo: cumpleaños de 60 invitados</div>
      <ul><li>Organización y staff de apoyo</li>${p.extras.map(e => `<li>${J.EXTRAS[e].n}</li>`).join("")}<li>Invitación digital con RSVP</li></ul><a class="btn${p.id === "completo" ? "" : " sec"}" href="#cotiza" data-paquete="${p.id}">Elegir ${p.n}</a></div>`; }).join("");

  /* ---------- Cotizador ---------- */
  const hoy = new Date();
  const S = { paso: 1, max: 1, hecho: false, tipo: null, invitados: null, invTocado: false, fecha: null, extras: [], tocado: false, nombre: "", cel: "", nota: "", mes: 0, sol: null };
  const NOMBRES = ["Evento", "Fecha", "Servicios", "Tus datos"];
  const ocupadas = () => J.ocupadasDe(getSols());
  const min = () => S.tipo ? J.TIPOS[S.tipo].min : 10;
  const pres = () => S.tipo ? J.presupuesto({ tipo: S.tipo, invitados: S.invitados || J.TIPOS[S.tipo].def, fecha: S.fecha, extras: S.extras }) : null;

  function irAlCotizador() { const p = $(".panel-c"), y = p.getBoundingClientRect().top + scrollY - 84; if (Math.abs(scrollY - y) > 40 && (p.getBoundingClientRect().top < 0 || p.getBoundingClientRect().top > innerHeight * .6)) scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" }); }
  function vaA(n, desplaza = true) { S.paso = n; S.max = Math.max(S.max, n); pintaProg(); $$(".paso-c").forEach(p => p.classList.toggle("on", Number(p.dataset.p) === n)); pintaPaso(n); pintaBarra(); if (desplaza) irAlCotizador(); }

  function pintaProg() {
    $("#prog").style.display = S.hecho ? "none" : "";
    $("#prog").innerHTML = NOMBRES.map((n, i) => `<button type="button" data-p="${i + 1}" class="${S.paso === i + 1 ? "on" : i + 1 < S.paso ? "ok" : ""}" ${i + 1 > S.max ? "disabled" : ""} aria-label="Paso ${i + 1}: ${n}"><b>Paso ${i + 1}</b>${n}</button>`).join("");
    $$("#prog button").forEach(b => b.onclick = () => vaA(Number(b.dataset.p)));
  }

  function armaPasos() {
    $("#pasos").innerHTML = `
    <div class="paso-c" data-p="1"><h3>¿Qué vamos a celebrar?</h3><p>Elige el tipo de evento. Después afinamos todo.</p><div class="tipos" id="tipos"></div><div class="nav-c"><span></span><button class="btn" type="button" data-sig>Siguiente →</button></div></div>
    <div class="paso-c" data-p="2"><h3>¿Cuándo y cuántos?</h3><p>Las fechas tachadas ya están reservadas.</p><div class="fi"><div><div class="cal" id="cal"></div><div class="leyenda"><span class="o">Reservada</span><span class="s">Tu fecha</span><span class="f">Fin de semana (recargo)</span></div><div id="fechaOk"></div></div>
      <div><span class="lbl">Invitados</span><div class="num"><button type="button" id="menos" aria-label="Menos invitados">−</button><output id="invO" for="inv">0</output><button type="button" id="mas" aria-label="Más invitados">+</button></div><input type="range" id="inv" min="10" max="500" step="1" aria-label="Número de invitados"><p class="nota-p" id="invN" style="margin-top:.7rem"></p><div class="err" id="eInv"></div></div></div>
      <div class="err" id="eFecha" style="margin-top:.6rem"></div><div class="nav-c"><button class="btn suave" type="button" data-atras>← Atrás</button><button class="btn" type="button" data-sig>Siguiente →</button></div></div>
    <div class="paso-c" data-p="3"><h3>Arma tu paquete</h3><p>Parte de uno o elige servicio por servicio. El total cambia al instante.</p><div class="atajos" id="atajos"></div><div class="extras" id="extras"></div><div class="nav-c"><button class="btn suave" type="button" data-atras>← Atrás</button><button class="btn" type="button" data-sig>Siguiente →</button></div></div>
    <div class="paso-c" data-p="4"><h3>Último paso: ¿a nombre de quién?</h3><p>Con esto apartamos tu fecha. No hacemos ningún cobro automático.</p><form class="f-c" id="fc" novalidate>
      <label>Tu nombre<input name="nombre" autocomplete="name" maxlength="60" placeholder="Nombre y apellido"><span class="err" id="eN"></span></label>
      <label>Celular (WhatsApp)<input name="cel" inputmode="numeric" autocomplete="tel" maxlength="12" placeholder="987 654 321"><span class="err" id="eC"></span></label>
      <label>¿Algo que debamos saber? <span style="font-weight:400;color:#B9AEDB">(opcional)</span><textarea name="nota" maxlength="240" placeholder="Temática, lugar que tienes en mente, alergias…"></textarea></label>
      <p class="nota-p">Al reservar, tu fecha queda apartada 48 horas mientras pagas el adelanto del 30 %.</p></form>
      <div class="nav-c"><button class="btn suave" type="button" data-atras>← Atrás</button><button class="btn" type="button" id="reservar">Reservar mi fecha 🔒</button></div></div>
    <div class="paso-c" data-p="5" id="hecho"></div>`;
    $$("[data-sig]").forEach(b => b.onclick = siguiente); $$("[data-atras]").forEach(b => b.onclick = () => vaA(S.paso - 1));
    $("#tipos").innerHTML = ORDEN.map(id => { const t = J.TIPOS[id]; return `<button type="button" class="tp" data-id="${id}" aria-pressed="false"><span>${t.emoji}</span><b>${t.n}</b><small>Desde ${t.min} personas</small></button>`; }).join("");
    $$(".tp").forEach(b => b.onclick = () => { eligeTipo(b.dataset.id); setTimeout(() => { if (S.paso === 1) vaA(2); }, 380); });
    $("#reservar").onclick = reservar;
    $("#fc").addEventListener("submit", e => { e.preventDefault(); reservar(); });
    $("#fc").addEventListener("input", () => { S.nombre = $("#fc").nombre.value; S.cel = $("#fc").cel.value; S.nota = $("#fc").nota.value; });
    $("#inv").oninput = e => { S.invitados = Number(e.target.value); S.invTocado = true; actInv(); pintaRes(); };
    $("#menos").onclick = () => cambiaInv(-5); $("#mas").onclick = () => cambiaInv(5);
  }

  function eligeTipo(id) {
    S.tipo = id; const t = J.TIPOS[id];
    if (!S.invTocado || S.invitados < t.min) S.invitados = Math.max(t.min, S.invTocado ? S.invitados : t.def);
    if (!S.tocado) S.extras = t.sug.slice(); else S.extras = J.extrasValidos(id, S.extras);
    $$(".tp").forEach(b => { const on = b.dataset.id === id; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    pintaRes(); pintaBarra();
  }
  const cambiaInv = d => { S.invitados = Math.min(500, Math.max(min(), (S.invitados || J.TIPOS[S.tipo].def) + d)); S.invTocado = true; actInv(); pintaRes(); };
  function actInv() {
    const r = $("#inv"), n = S.invitados || (S.tipo ? J.TIPOS[S.tipo].def : 50);
    r.min = min(); r.value = n; $("#invO").textContent = n; r.style.background = `linear-gradient(90deg,var(--oro) ${(n - r.min) * 100 / (500 - r.min)}%,rgba(255,255,255,.18) 0)`;
    $("#invN").textContent = n >= 200 ? "¡Una fiesta grande! Sumamos más staff automáticamente." : `Mínimo ${min()} para este tipo de evento.`; $("#eInv").textContent = "";
  }

  function pintaPaso(n) {
    if (n === 2) { if (!S.tipo) return vaA(1); pintaCal(); actInv(); pintaFechaOk(); }
    if (n === 3) { if (!S.tipo) return vaA(1); pintaExtras(); }
    if (n === 4) { const f = $("#fc"); f.nombre.value = S.nombre; f.cel.value = S.cel; f.nota.value = S.nota; }
  }

  function pintaCal() {
    const base = new Date(hoy.getFullYear(), hoy.getMonth() + S.mes, 1), m = J.mes(base.getFullYear(), base.getMonth(), ocupadas(), hoy);
    $("#cal").innerHTML = `<div class="cal-h"><button type="button" id="cPrev" aria-label="Mes anterior" ${S.mes === 0 ? "disabled" : ""}>‹</button><b>${m.titulo}</b><button type="button" id="cNext" aria-label="Mes siguiente" ${S.mes >= 18 ? "disabled" : ""}>›</button></div>
      <div class="cal-g">${["L", "M", "M", "J", "V", "S", "D"].map(d => `<span class="dw">${d}</span>`).join("")}${m.celdas.map(c => c.vacio ? "<i></i>" :
        `<button type="button" data-f="${c.iso}" class="${c.ocupada ? "oc" : ""}${c.pasado && !c.ocupada ? " pas" : ""}${c.iso === S.fecha ? " sel" : ""}${c.dow === 6 || c.dow === 5 ? " fin" : ""}" ${c.ocupada || c.pasado ? "disabled" : ""} aria-label="${J.fechaLarga(c.iso)}${c.ocupada ? ", reservada" : ""}" aria-pressed="${c.iso === S.fecha}">${c.d}</button>`).join("")}</div>`;
    $("#cPrev").onclick = () => { S.mes--; pintaCal(); }; $("#cNext").onclick = () => { S.mes++; pintaCal(); };
    $$("#cal [data-f]").forEach(b => b.onclick = () => { S.fecha = b.dataset.f; $("#eFecha").textContent = ""; pintaCal(); pintaFechaOk(); pintaRes(); });
  }
  function pintaFechaOk() {
    const el = $("#fechaOk"); if (!S.fecha) { el.innerHTML = ""; return; }
    const r = J.recargoFecha(S.fecha);
    el.innerHTML = `<div class="fecha-ok"><b>${J.fechaLarga(S.fecha)}</b><br>${r.pct ? `Recargo de ${r.pct} % (${r.motivos.join(" + ")}).` : "Día de semana: sin recargo 👌"}</div>`;
  }

  function pintaExtras() {
    const t = J.TIPOS[S.tipo], ids = Object.keys(J.EXTRAS).filter(id => J.extrasValidos(S.tipo, [id]).length), mismo = (a, b) => a.length === b.length && a.every(x => b.includes(x));
    const atajos = [["sug", `Sugerido para ${t.n.toLowerCase()}`, t.sug], ...Object.values(J.PAQUETES).map(p => [p.id, p.n, p.extras]), ["nada", "Ninguno", []]];
    $("#atajos").innerHTML = atajos.map(([id, n, ex]) => `<button type="button" data-a="${id}" class="${mismo(S.extras, J.extrasValidos(S.tipo, ex)) ? "on" : ""}">${n}</button>`).join("");
    $$("#atajos button").forEach(b => b.onclick = () => { const a = atajos.find(x => x[0] === b.dataset.a); S.extras = J.extrasValidos(S.tipo, a[2]); S.tocado = true; pintaExtras(); pintaRes(); });
    $("#extras").innerHTML = ids.map(id => { const e = J.EXTRAS[id], on = S.extras.includes(id);
      return `<button type="button" class="ex${on ? " on" : ""}" data-e="${id}" aria-pressed="${on}"><span class="i">${e.ic}</span><span><b>${e.n}</b><small>${e.d}</small></span><span class="p">${e.modo === "persona" ? J.soles(e.precio) + " c/u" : J.soles(e.precio)}</span></button>`; }).join("");
    $$("#extras .ex").forEach(b => b.onclick = () => { const id = b.dataset.e; S.extras = S.extras.includes(id) ? S.extras.filter(x => x !== id) : [...S.extras, id]; S.tocado = true; const on = S.extras.includes(id); b.classList.toggle("on", on); b.setAttribute("aria-pressed", on);
      $$("#atajos button").forEach(a => a.classList.remove("on")); pintaRes(); });
  }

  /* Resumen en vivo */
  let tw = 0; const anima = (el, a) => { const de = Number(el.dataset.v || 0); el.dataset.v = a; if (reduce || de === a) { el.textContent = J.soles(a); return; } cancelAnimationFrame(tw); const t0 = performance.now(); const f = t => { const k = Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - k, 3); el.textContent = J.soles(de + (a - de) * e); if (k < 1) tw = requestAnimationFrame(f); }; tw = requestAnimationFrame(f); };
  function pintaRes() {
    const p = pres(), r = $("#res");
    if (!p) { r.innerHTML = `<small class="t">Tu presupuesto</small><h4>Empieza eligiendo</h4><p class="vacio">Elige el tipo de evento y verás aquí cuánto cuesta, línea por línea.</p><div class="tot"><span>Total</span><b>S/ 0</b></div>`; pintaBarra(); return; }
    const t = J.TIPOS[S.tipo];
    r.innerHTML = `<small class="t">Tu presupuesto</small><h4>${t.emoji} ${t.n}</h4><div class="sub">${S.fecha ? J.fechaLarga(S.fecha) : "Elige una fecha"} · ${p.invitados} invitados</div>
      ${p.lineas.map(l => `<div class="ln${l.incluido ? " inc" : ""}"><span>${J.esc(l.n)}<small>${J.esc(l.det)}</small></span><span>${l.incluido ? "Incluida" : J.soles(l.monto)}</span></div>`).join("")}
      ${p.descuento ? `<div class="ln dto"><span>Descuento paquete ${p.paqueteN}<small>−${J.PAQUETES[p.paquete].dto} % por combo</small></span><span>−${J.soles(p.descuento)}</span></div>` : ""}
      ${p.recargo ? `<div class="ln"><span>Recargo por fecha<small>${J.esc(p.recargoMotivo)} (+${p.recargoPct} %)</small></span><span>${J.soles(p.recargo)}</span></div>` : ""}
      <div class="tot"><span>Total</span><b id="totV" data-v="0">${J.soles(lastTot)}</b></div><div class="ad">Con <b>${J.soles(p.adelanto)}</b> (30 %) reservas tu fecha 🔒</div><div class="pp">≈ ${J.soles(p.porPersona)} por invitado</div><div class="aviso">Precios referenciales de la demo</div>`;
    const tv = $("#totV"); tv.dataset.v = lastTot; anima(tv, p.total); lastTot = p.total; pintaBarra();
  }
  let lastTot = 0;

  function pintaBarra() {
    const p = pres(); $("#bmV").textContent = p ? J.soles(p.total) : "S/ 0";
    $("#bmB").textContent = S.hecho ? "Listo ✓" : S.paso === 4 ? "Reservar 🔒" : "Continuar →";
  }
  $("#bmB").onclick = e => { e.preventDefault(); if (S.hecho) return; S.paso === 4 ? reservar() : siguiente(); };
  new IntersectionObserver(es => $("#barraM").classList.toggle("on", es[0].isIntersecting && !S.hecho), { threshold: .08 }).observe($("#cotiza"));

  function siguiente() {
    if (S.paso === 1) { if (!S.tipo) return toast("Elige primero qué vas a celebrar"); return vaA(2); }
    if (S.paso === 2) {
      const e = J.valida({ tipo: S.tipo, invitados: S.invitados, fecha: S.fecha }, ocupadas(), hoy);
      $("#eFecha").textContent = e.fecha || ""; $("#eInv").textContent = e.invitados || "";
      if (e.fecha || e.invitados) return toast(e.fecha || e.invitados); return vaA(3);
    }
    if (S.paso === 3) return vaA(4);
  }

  function reservar() {
    const f = $("#fc"); S.nombre = f.nombre.value; S.cel = f.cel.value; S.nota = f.nota.value;
    const e = J.validaContacto({ nombre: S.nombre, cel: S.cel }); $("#eN").textContent = e.nombre || ""; $("#eC").textContent = e.cel || "";
    if (e.nombre || e.cel) return (e.nombre ? f.nombre : f.cel).focus();
    const v = J.valida({ tipo: S.tipo, invitados: S.invitados, fecha: S.fecha }, ocupadas(), hoy);
    if (v.fecha || v.invitados) { toast(v.fecha || v.invitados); return vaA(2); }
    const sols = getSols(), s = J.nuevaSolicitud({ nombre: S.nombre, cel: S.cel, tipo: S.tipo, invitados: S.invitados, fecha: S.fecha, extras: S.extras, nota: S.nota }, sols);
    guardar("jol_sol", [...sols, s]); S.sol = s; S.hecho = true; pintaHecho(); vaA(5);
    if (!reduce) lluvia();
  }

  function pintaHecho() {
    const s = S.sol, t = J.TIPOS[s.tipo];
    $("#hecho").innerHTML = `<div class="hecho"><div class="gran">🎉</div><h3>¡Casi listo, ${J.esc(s.nombre.split(" ")[0])}!</h3><p style="color:#C9BFE6">Recibimos tu solicitud. Tu fecha queda apartada 48 h mientras pagas el adelanto.</p><div class="cod">${s.id}</div>
      <p><b>${t.emoji} ${t.n}</b> · ${J.fechaLarga(s.fecha)} · ${s.invitados} invitados</p>
      <div class="pago"><div class="qr" id="qr" role="img" aria-label="Código QR de pago (demo)"></div><div><span>Adelanto del 30 % por Yape o Plin</span><b>${J.soles(s.adelanto)}</b><span>${YAPE} · ${TITULAR}</span><button class="btn sm claro" style="margin-top:.7rem" type="button" id="copia">Copiar número</button></div></div>
      <div class="acc"><button class="btn" type="button" id="yaPague">Ya pagué el adelanto ✓</button><a class="btn suave" target="_blank" rel="noopener" href="${J.waEmpresa(s, NUM)}">Avisar por WhatsApp</a></div>
      <div class="acc" style="margin-top:.7rem"><button class="btn suave sm" type="button" id="bIcs">📅 Agregar al calendario</button><a class="btn suave sm" href="invitacion.html?e=${t.inv}">💌 Ver invitación de muestra</a><button class="btn suave sm" type="button" id="nueva">Nueva cotización</button></div>
      <p class="nota-p" style="margin-top:1.2rem">La organizadora verá tu solicitud en su <a href="panel.html" style="color:var(--oro)">panel</a> y confirmará el pago.</p></div>`;
    const q = qrcode(0, "M"); q.addData(`yape|${YAPE.replace(/\s/g, "")}|${s.adelanto}|${s.id}`); q.make(); const n = q.getModuleCount(); let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    $("#qr").innerHTML = `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><path d="${d}" fill="#17112B"/></svg>`;
    $("#copia").onclick = () => (navigator.clipboard ? navigator.clipboard.writeText(YAPE.replace(/\s/g, "")) : Promise.reject()).then(() => toast("Número copiado"), () => toast("Número: " + YAPE));
    $("#yaPague").onclick = e => { const sols = getSols(), x = sols.find(k => k.id === s.id); if (x) { x.aviso = true; guardar("jol_sol", sols); } e.target.textContent = "Avisamos a la organizadora ✓"; e.target.disabled = true; toast("¡Gracias! Confirmaremos tu pago pronto"); };
    $("#bIcs").onclick = () => { const b = new Blob([J.ics(s)], { type: "text/calendar" }), a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `jolgorio-${s.id}.ics`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1500); };
    $("#nueva").onclick = () => { Object.assign(S, { paso: 1, max: 1, hecho: false, tipo: null, invitados: null, invTocado: false, fecha: null, extras: [], tocado: false, nombre: "", cel: "", nota: "", sol: null }); lastTot = 0; armaPasos(); pintaRes(); vaA(1); };
  }

  function lluvia() {
    const caja = $(".panel-c"); caja.style.position = "relative";
    for (let i = 0; i < 36; i++) { const p = document.createElement("i"); p.style.cssText = `position:absolute;top:-10px;left:${Math.random() * 100}%;width:8px;height:14px;border-radius:2px;background:${["#FF5A3C", "#FFC53D", "#6B3FE0", "#FF7AB6", "#22C99A"][i % 5]};pointer-events:none;z-index:5;transition:transform ${1.6 + Math.random() * 1.4}s cubic-bezier(.3,.6,.4,1),opacity 2.8s;`; caja.appendChild(p);
      requestAnimationFrame(() => { p.style.transform = `translate(${(Math.random() - .5) * 160}px,${caja.clientHeight + 40}px) rotate(${Math.random() * 720}deg)`; p.style.opacity = "0"; }); setTimeout(() => p.remove(), 3200); }
  }

  /* Entradas desde otras secciones */
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-tipo]"), p = e.target.closest("[data-paquete]"); if (!t && !p) return;
    e.preventDefault();
    if (S.hecho) { $("#nueva").click(); }
    if (p) { S.extras = J.PAQUETES[p.dataset.paquete].extras.slice(); S.tocado = true; toast(`Paquete ${J.PAQUETES[p.dataset.paquete].n} cargado: ajústalo a tu gusto`); }
    if (t) eligeTipo(t.dataset.tipo);
    pintaRes(); vaA(t ? 2 : S.tipo ? 3 : 1, false); $("#cotiza").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });

  armaPasos(); pintaProg(); pintaRes(); vaA(1, false);
  const q = new URLSearchParams(location.search);
  if (J.TIPOS[q.get("tipo")]) { eligeTipo(q.get("tipo")); vaA(2, false); }
  revela(); cuentaCifras(); confeti();
})();
