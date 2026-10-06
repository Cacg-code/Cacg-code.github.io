/* Invita — © Carlo · Dev (demo). Página de invitación: cambia de tema según el tipo de evento. */
(function () {
  const L = window.EV, $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const q = new URLSearchParams(location.search);
  let tipo = L.EVENTOS[q.get("e")] ? q.get("e") : "boda";
  const invId = q.get("i") || "";
  const K = t => ({ inv: "ev_inv_" + t, resp: "ev_resp_" + t });

  const leer = (k, def) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const invitados = t => {
    let a = leer(K(t).inv, null);
    if (!a) { a = L.INVITADOS[t].map(([id, nombre, pases]) => ({ id, nombre, pases })); guardar(K(t).inv, a); }
    return a;
  };
  const respuestas = t => {
    let a = leer(K(t).resp, null);
    if (!a) { a = L.SEMILLA[t].map(r => Object.assign({ fecha: Date.now() - 864e5 }, r)); guardar(K(t).resp, a); }
    return a;
  };

  const ICO = {
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
  };

  let toastT;
  function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2400); }

  function mapaSVG() {
    return `<svg viewBox="0 0 520 380" role="img" aria-label="Mapa ilustrativo del lugar"><rect width="520" height="380" fill="var(--papel)"/>
      <g fill="none" stroke="var(--linea)" stroke-width="14" stroke-linecap="round"><path d="M-10 90C120 80 220 140 330 120S500 60 540 90"/><path d="M60 -10C90 120 70 240 140 390"/><path d="M-10 280C150 250 300 300 540 240"/><path d="M400 -10C380 100 430 230 410 390"/></g>
      <g fill="none" stroke="var(--bg)" stroke-width="8" stroke-linecap="round"><path d="M-10 90C120 80 220 140 330 120S500 60 540 90"/><path d="M60 -10C90 120 70 240 140 390"/><path d="M-10 280C150 250 300 300 540 240"/><path d="M400 -10C380 100 430 230 410 390"/></g>
      <g fill="var(--ac2)" opacity=".22"><rect x="150" y="150" width="120" height="70" rx="16"/><circle cx="450" cy="320" r="46"/><rect x="20" y="300" width="90" height="56" rx="14"/><circle cx="90" cy="40" r="34"/></g>
      <circle cx="260" cy="190" r="56" fill="var(--ac)" opacity=".18"><animate attributeName="r" values="40;78;40" dur="3s" repeatCount="indefinite"/></circle>
      <g class="pin"><path d="M260 214s30-26 30-52a30 30 0 1 0-60 0c0 26 30 52 30 52z" fill="var(--ac)"/><circle cx="260" cy="162" r="11" fill="#fff"/></g></svg>`;
  }

  function seccion(ev, g, resp) {
    const pases = g ? g.pases : 2;
    const yaResp = g && resp.find(r => r.inv === g.id);
    const cr = ev.cronograma.map((p, i) => `<div class="paso rv" style="--d:${i}"><time>${p[0]}</time><i></i><div><b>${p[1]}</b><small>${p[2]}</small></div></div>`).join("");
    const nom = g ? g.nombre : "";
    return `
<header class="hero" id="inicio">
  <div class="deco"></div><canvas id="fx" aria-hidden="true"></canvas>
  <div class="txt">
    <span class="sello">${ev.tipo === "boda" ? "Nos casamos" : ev.tipo === "cumple" ? "Estás invitado" : "Solo para los de confianza"}</span>
    <h1>${ev.titulo}</h1>
    <p class="frase">${ev.frase}</p>
    <div class="cuando"><span>${ICO.cal}${L.fechaLarga(ev.fecha)}</span><span>${ICO.clock}${L.hora(ev.fecha)}</span><span>${ICO.pin}${ev.lugar}</span></div>
    <div class="cuenta" id="cuenta" aria-label="Cuenta regresiva"><div><b>0</b><small>días</small></div><div><b>0</b><small>horas</small></div><div><b>0</b><small>min</small></div><div><b>0</b><small>seg</small></div></div>
    <div class="acc"><a class="btn claro" href="#rsvp">${g ? "Confirmar mi asistencia" : "Confirmar asistencia"}</a><a class="btn suave" style="color:#fff;border-color:rgba(255,255,255,.5)" href="#lugar">Cómo llegar</a></div>
  </div><span class="baja" aria-hidden="true"></span>
</header>

<section><div class="wrap"><p class="mensaje rv">${ev.tipo === "boda" ? "Después de <em>siete años</em> juntos, decidimos celebrar con las personas que más queremos. Queremos <em>bailar</em> contigo." : ev.tipo === "cumple" ? "Treinta años se celebran <em>a lo grande</em>. Pasa por una noche de <em>música</em>, brindis y sorpresas." : "Nuestro amigo se casa. Antes de eso, una noche de <em>parrilla</em>, retos y <em>risas</em> que nadie olvidará."}</p></div></section>

<section style="padding-top:0"><div class="wrap">
  <div class="cab centro rv"><span class="kick">El plan</span><h2>Así será <em>la noche</em></h2></div>
  <div class="crono">${cr}</div>
</div></section>

<section id="lugar" style="padding-top:0"><div class="wrap lugar">
  <div class="mapa rv">${mapaSVG()}</div>
  <div class="rv" style="--d:1"><span class="kick">El lugar</span><h3>${ev.lugar}</h3><p>${ev.dir}</p>
    <p style="margin-top:.8rem">${L.fechaLarga(ev.fecha)}, ${L.hora(ev.fecha)}</p>
    <div class="acc"><a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.mapa)}">${ICO.pin}Abrir en Maps</a><button class="btn suave" id="bIcs">${ICO.cal}Agregar al calendario</button></div>
  </div>
</div></section>

<section style="padding-top:0"><div class="wrap"><div class="vest rv">
  <div><span class="kick">Vestimenta</span><h3>${ev.vestimenta}</h3><p>${ev.paletaNota}</p></div>
  <div class="paleta">${ev.paleta.map(c => `<span style="background:${c}" title="${c}"></span>`).join("")}</div>
</div></div></section>

<section class="rsvp" id="rsvp"><div class="wrap">
  <div class="cab centro rv"><span class="kick">Confirmación</span><h2>¿Cuento <em>contigo</em>?</h2></div>
  <div class="caja rv" id="caja">${yaResp ? gracias(ev, yaResp) : formulario(ev, g, pases, nom)}</div>
  <p class="cierre">${ev.cierre}</p>
</div></section>

<section><div class="wrap regalo">
  <div class="rv"><span class="kick">${ev.tipo === "despedida" ? "Cuota" : "Detalle"}</span><h2 style="font-size:clamp(2rem,4.4vw,3rem)">${ev.tipo === "despedida" ? "Aporte por <em>Yape</em>" : "Un <em>regalo</em>, si quieres"}</h2><p style="margin-top:1rem">${ev.regalo}</p></div>
  <div class="tarjeta rv" style="--d:1"><small>Yape · ${ev.titular}</small><b id="num">${ev.yape}</b><small>Toca para copiar el número</small><br><button class="btn" id="copia">Copiar número</button></div>
</div></section>

<section id="muro" style="padding-top:0"><div class="wrap">
  <div class="cab centro rv"><span class="kick">Libro de mensajes</span><h2>Lo que <em>dicen</em></h2></div>
  <div class="muro" id="notas"></div>
</div></section>

<footer><div class="wrap"><p>Invitación demo creada por <a href="../" >Carlo · Dev</a>. Los datos viven solo en este navegador.</p><p style="margin-top:.4rem">¿Quieres una así para tu evento? <a href="https://wa.me/51999999999?text=${encodeURIComponent("Hola Carlo, vi la demo de invitaciones y quiero una para mi evento")}" target="_blank" rel="noopener">Escríbeme por WhatsApp</a></p></div></footer>`;
  }

  function formulario(ev, g, pases, nom) {
    return `${g ? `<h3 class="saludo">Hola, <em>${L.esc(g.nombre)}</em></h3><span class="pases">Tu invitación es para ${g.pases} ${g.pases === 1 ? "persona" : "personas"}</span>` : `<h3 class="saludo">Cuéntanos si <em>vienes</em></h3><span class="pases">Invitación abierta · hasta ${pases} personas</span>`}
<form id="f" novalidate>
  ${g ? "" : `<label class="c">Tu nombre<input name="nombre" autocomplete="name" placeholder="Nombre y apellido" maxlength="60"><span class="err" data-e="nombre"></span></label>`}
  <div><div class="si-no" role="radiogroup" aria-label="¿Asistes?">
    <input type="radio" name="asiste" id="aSi" value="si"><label for="aSi"><span>🎉</span>¡Voy!</label>
    <input type="radio" name="asiste" id="aNo" value="no"><label for="aNo"><span>💌</span>No puedo</label></div><span class="err" data-e="asiste"></span></div>
  <div class="cond" id="cSi" hidden>
    <div class="dos"><label class="c">¿Cuántas personas?<small>Máximo ${pases}</small><select name="personas">${Array.from({ length: pases }, (_, i) => `<option>${i + 1}</option>`).join("")}</select><span class="err" data-e="personas"></span></label>
    <label class="c">Menú<select name="menu">${ev.menus.map(m => `<option>${m}</option>`).join("")}</select></label></div>
    <label class="c">Alergias o restricciones <small>(opcional)</small><input name="alergias" maxlength="80" placeholder="Ej.: sin gluten"></label>
    <label class="c">${ev.pregunta} <small>(opcional)</small><input name="extra" maxlength="80"></label>
    <label class="c">Tu celular <small>(opcional, por si hay cambios)</small><input name="cel" inputmode="numeric" autocomplete="tel" placeholder="9XX XXX XXX" maxlength="13"><span class="err" data-e="cel"></span></label>
  </div>
  <label class="c">Un mensaje para ${ev.anfitrion.indexOf(" y ") > 0 ? "los novios" : ev.anfitrion} <small>(opcional, aparecerá en el libro de mensajes)</small><textarea name="mensaje" maxlength="200"></textarea></label>
  <button class="btn" type="submit">Enviar confirmación</button>
</form>`;
  }

  function gracias(ev, r) {
    const si = r.asiste === "si";
    return `<div class="gracias"><div class="gran">${si ? "🎉" : "💌"}</div>
    <h3>${si ? "¡Nos vemos allí!" : "Gracias por avisar"}</h3>
    <p>${si ? `Reservamos ${r.personas} ${Number(r.personas) === 1 ? "lugar" : "lugares"} a nombre de <b>${L.esc(r.nombre)}</b>.` : `Te vamos a extrañar, ${L.esc(r.nombre)}.`}</p>
    <div class="acc">${si ? `<button class="btn" id="bIcs2">Agregar al calendario</button>` : ""}<a class="btn suave" target="_blank" rel="noopener" href="${L.waAnfitrion(ev, r)}">Avisar por WhatsApp</a><button class="btn suave" id="cambia">Cambiar respuesta</button></div></div>`;
  }

  function descargaIcs(ev) {
    const b = new Blob([L.ics(ev)], { type: "text/calendar;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = L.slug(ev.marca) + ".ics";
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast("Evento descargado: ábrelo para guardarlo en tu calendario");
  }

  function pintaNotas(resp) {
    const n = resp.filter(r => r.mensaje).slice().reverse();
    $("#notas").innerHTML = n.length ? n.map(r => `<div class="nota"><p>“${L.esc(r.mensaje)}”</p><b>— ${L.esc(r.nombre)}</b></div>`).join("") : `<p class="centro" style="color:var(--mut);grid-column:1/-1;text-align:center">Sé el primero en dejar un mensaje.</p>`;
  }

  function enlazaForm(ev, g, pases) {
    const f = $("#f"); if (!f) return;
    const cond = $("#cSi");
    $$('input[name="asiste"]', f).forEach(i => i.addEventListener("change", () => { cond.hidden = i.value !== "si" || !i.checked; $('[data-e="asiste"]', f).textContent = ""; }));
    f.addEventListener("submit", e => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(f));
      if (g) d.nombre = g.nombre;
      const er = L.validaRsvp(d, pases);
      $$("[data-e]", f).forEach(s => s.textContent = er[s.dataset.e] || "");
      const k = Object.keys(er)[0];
      if (k) { const el = f.elements[k] || $('[role="radiogroup"]', f); if (el && el.focus) el.focus(); return; }
      const r = { inv: g ? g.id : "abierta-" + Date.now().toString(36), nombre: d.nombre.trim(), asiste: d.asiste, personas: d.asiste === "si" ? Number(d.personas) : 0,
        menu: d.asiste === "si" ? d.menu : "", alergias: (d.alergias || "").trim(), cel: d.cel ? L.limpiaCel(d.cel) : "", extra: (d.extra || "").trim(), mensaje: (d.mensaje || "").trim(), fecha: Date.now() };
      const todas = respuestas(tipo).filter(x => x.inv !== r.inv); todas.push(r); guardar(K(tipo).resp, todas);
      if (!g) { const inv = invitados(tipo); inv.push({ id: r.inv, nombre: r.nombre, pases, abierta: true }); guardar(K(tipo).inv, inv); }
      $("#caja").innerHTML = gracias(ev, r); enlazaGracias(ev, g, pases, r); pintaNotas(todas);
      if (r.asiste === "si") rafaga();
      $("#caja").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  }
  function enlazaGracias(ev, g, pases, r) {
    const b = $("#bIcs2"); if (b) b.onclick = () => descargaIcs(ev);
    const c = $("#cambia"); if (c) c.onclick = () => { $("#caja").innerHTML = formulario(ev, g, pases, g ? g.nombre : ""); enlazaForm(ev, g, pases); };
  }

  /* Partículas de la portada: pétalos, confeti o chispas según el tema */
  let animFx = 0;
  function fx(ev) {
    cancelAnimationFrame(animFx);
    const cv = $("#fx"); if (!cv || reduce) return;
    const c = cv.getContext("2d"); let W, H, P = [];
    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); W = cv.width = r.width * d; H = cv.height = r.height * d; };
    size(); addEventListener("resize", size);
    const cols = ev.tipo === "boda" ? ["#F3E6D8", "#E8C9A0", "#fff", "#D9B88A"] : ev.tipo === "cumple" ? ["#FF4F9A", "#FFC83D", "#7B4DFF", "#27E0C0", "#fff"] : ["#F2542D", "#FFB347", "#FFE2A8"];
    const n = (innerWidth < 760 ? 26 : 46);
    const nueva = (y0) => ({ x: Math.random(), y: y0 == null ? Math.random() : y0, s: .5 + Math.random(), a: Math.random() * 6.28, v: .0003 + Math.random() * .0005, w: Math.random() * 2 - 1, col: cols[Math.floor(Math.random() * cols.length)] });
    for (let i = 0; i < n; i++) P.push(nueva());
    let vis = true; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(cv);
    function dibuja(p) {
      const d = W / 900 + .7, x = p.x * W, y = p.y * H;
      c.save(); c.translate(x, y); c.rotate(p.a); c.fillStyle = p.col; c.globalAlpha = .85;
      if (ev.tipo === "boda") { c.beginPath(); c.ellipse(0, 0, 9 * p.s * d, 5 * p.s * d, 0, 0, 6.28); c.fill(); }
      else if (ev.tipo === "cumple") c.fillRect(-5 * p.s * d, -3 * p.s * d, 10 * p.s * d, 6 * p.s * d);
      else { c.beginPath(); c.arc(0, 0, 2.6 * p.s * d, 0, 6.28); c.shadowColor = p.col; c.shadowBlur = 14; c.fill(); }
      c.restore();
    }
    (function loop() {
      if (vis) {
        c.clearRect(0, 0, W, H);
        P.forEach(p => {
          const sube = ev.tipo === "despedida";
          p.a += .02 * p.w; p.x += Math.sin(p.a) * .0006 + p.w * .0002; p.y += sube ? -p.v * 1.4 : p.v * 1.1;
          if (!sube && p.y > 1.05) { p.y = -.05; p.x = Math.random(); } if (sube && p.y < -.05) { p.y = 1.05; p.x = Math.random(); }
          dibuja(p);
        });
      }
      animFx = requestAnimationFrame(loop);
    })();
  }
  function rafaga() {
    if (reduce) return;
    const ev = L.EVENTOS[tipo], cv = document.createElement("canvas"); cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:90;pointer-events:none";
    const d = Math.min(devicePixelRatio || 1, 2), W = cv.width = innerWidth * d, H = cv.height = innerHeight * d; document.body.append(cv);
    const cols = ev.paleta.concat(["#fff"]), c = cv.getContext("2d");
    const P = Array.from({ length: 90 }, () => ({ x: W / 2, y: H * .7, vx: (Math.random() - .5) * 16 * d, vy: (-9 - Math.random() * 12) * d, a: Math.random() * 6, s: (5 + Math.random() * 7) * d, col: cols[Math.floor(Math.random() * cols.length)], vida: 1 }));
    (function paso() {
      c.clearRect(0, 0, W, H); let vivo = false;
      P.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .35 * d; p.a += .2; p.vida -= .009; if (p.vida > 0) { vivo = true; c.save(); c.translate(p.x, p.y); c.rotate(p.a); c.globalAlpha = Math.min(1, p.vida * 2); c.fillStyle = p.col; c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore(); } });
      vivo ? requestAnimationFrame(paso) : cv.remove();
    })();
  }

  /* Cuenta regresiva */
  let tCuenta;
  function cuenta(ev) {
    clearInterval(tCuenta);
    const el = $("#cuenta"); if (!el) return;
    const pinta = () => {
      const c = L.cuenta(ev.fecha);
      if (c.pasado) { el.innerHTML = `<div style="min-width:200px"><b style="font-size:1.6rem">¡Ya es hoy!</b></div>`; clearInterval(tCuenta); return; }
      const v = [c.d, c.h, c.m, c.s], b = $$("b", el);
      v.forEach((n, i) => { const t = String(n).padStart(2, "0"); if (b[i].textContent !== t) b[i].textContent = t; });
    };
    pinta(); tCuenta = setInterval(pinta, 1000);
  }

  /* Revelado al hacer scroll */
  let io;
  function revela() {
    if (io) io.disconnect();
    io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -5% 0px" });
    $$(".rv").forEach(el => io.observe(el));
  }

  function pinta() {
    const ev = L.EVENTOS[tipo];
    document.body.className = ev.clase; document.title = ev.marca + " · Invitación";
    $$("#demo button").forEach(b => { const on = b.dataset.t === tipo; b.classList.toggle("on", on); b.setAttribute("aria-selected", on); });
    $("#aAdmin").href = "admin.html?e=" + tipo;
    $("#fijaT").textContent = ev.tipo === "boda" ? "¿Nos acompañas?" : "¿Vienes?";
    const inv = invitados(tipo), g = inv.find(x => x.id === invId) || null, resp = respuestas(tipo);
    $("#app").innerHTML = seccion(ev, g, resp);
    const pases = g ? g.pases : 2;
    enlazaForm(ev, g, pases); enlazaGracias(ev, g, pases, g && resp.find(r => r.inv === g.id));
    pintaNotas(resp); fx(ev); cuenta(ev); revela();
    $("#bIcs").onclick = () => descargaIcs(ev);
    $("#copia").onclick = () => { const n = ev.yape.replace(/\s/g, ""); (navigator.clipboard ? navigator.clipboard.writeText(n) : Promise.reject()).then(() => toast("Número copiado"), () => toast("Número: " + ev.yape)); };
  }

  $$("#demo button").forEach(b => b.addEventListener("click", () => {
    if (b.dataset.t === tipo) return;
    tipo = b.dataset.t; const u = new URL(location.href); u.searchParams.set("e", tipo); u.searchParams.delete("i");
    history.replaceState(null, "", u); scrollTo(0, 0); pinta();
  }));

  /* Barra móvil y barra de demo */
  let ult = 0;
  addEventListener("scroll", () => {
    const y = scrollY, r = $("#rsvp"), f = $("#fija");
    if (r) { const b = r.getBoundingClientRect(); f.classList.toggle("on", y > innerHeight * .8 && !(b.top < innerHeight * .7 && b.bottom > innerHeight * .2)); }
    $("#demo").classList.toggle("oculto", y > 400 && y > ult); ult = y;
  }, { passive: true });

  pinta();
})();
