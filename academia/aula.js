/* Cátedra — aula del alumno. © Carlo · Dev */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const { CURSOS, RUTAS } = DATOS, C = Cat, S = Store, u = S.usuario();
  if (!u) { location.replace("./"); return; }
  const em = u.email, app = $("#app");
  $("#yo-n").textContent = u.nombre; $("#yo-u").textContent = u.uni; $("#yo-a").textContent = u.nombre[0];
  $("#salir").onclick = () => { S.salir(); location.href = "./"; };
  const toast = t => { const e = $("#toast"); e.textContent = t; e.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("on"), 2600); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const anillo = (p, c) => `<span class="anillo" style="--p:${p};--c:${c}" data-t="${p}%"></span>`;
  let timer = null, ctl = null, vel = 1;
  const confeti = () => { const d = document.createElement("div"); d.className = "conf"; const col = ["#FFB703", "#2563EB", "#16A34A", "#E11D48", "#7C3AED"]; for (let i = 0; i < 70; i++) { const p = document.createElement("i"); p.style.cssText = `left:${Math.random() * 100}%;background:${col[i % 5]};animation-delay:${Math.random() * .8}s;animation-duration:${1.8 + Math.random() * 1.6}s`; d.appendChild(p); } document.body.appendChild(d); setTimeout(() => d.remove(), 4200); };

  /* ---------- inicio ---------- */
  function inicio() {
    clearInterval(timer);
    const ins = S.inscritos(em).map(S.cursoPorId).filter(Boolean), todo = S.todo(em);
    const hechas = CURSOS.reduce((s, c) => s + C.resumen(c, todo[c.id]).hechas, 0);
    const min = CURSOS.reduce((s, c) => s + C.resumen(c, todo[c.id]).minHechos, 0);
    const certs = S.certificados(em), dias = S.dias(em), racha = C.rachaDias(dias), meta = S.meta(em), ds = C.diasSemana(dias);
    const maxNota = Math.max(0, ...CURSOS.map(c => (todo[c.id] && todo[c.id].n) || 0));
    const ins6 = C.insignias({ hechas, racha, certs: certs.length, maxNota, metaOk: ds >= meta });
    const sig = ins.map(c => ({ c, l: C.proxima(c, todo[c.id]) })).find(x => x.l);
    const otros = CURSOS.filter(c => !ins.includes(c)), hm = C.heatmap(dias);
    const aprobados = CURSOS.filter(c => (todo[c.id] && todo[c.id].n || 0) >= 11).length;
    const puntos = C.xp({ hechas, certs: certs.length, aprobados, racha }), nv = C.nivel(puntos);
    const rk = C.ranking([["Valeria Soto", 410], ["Diego Huamán", 305], ["Camila Ríos", 240], ["Luis Mendoza", 150], ["Rosa Flores", 70]].map(x => ({ nombre: x[0], xp: x[1] })), { nombre: u.nombre, xp: puntos, yo: true });
    const pctMeta = Math.min(100, Math.round(ds / meta * 100));
    const hora = new Date().getHours(), saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";
    app.innerHTML = `<nav class="subnav" id="subnav" aria-label="Secciones"></nav><section class="sec" id="s-resumen" data-t="Resumen" data-i="🏠"><div class="saludo rv in"><span class="kick">${esc(u.uni)}</span><h1>${saludo}, ${esc(u.nombre.split(" ")[0])}</h1>
      <p style="color:var(--gris);margin-top:8px">${racha >= 2 ? `Llevas <b>${racha} días</b> seguidos. ¡No rompas la racha!` : hechas ? "Cada lección cuenta. Hoy es buen día para una más." : "Empieza con una lección de 10 minutos. Tu avance se guarda solo."}</p></div>
    <div class="kpis"><div class="kpi rv in"><b>${racha}</b><span>${racha === 1 ? "día" : "días"} de racha 🔥</span></div><div class="kpi rv in" style="--d:1"><b>${hechas}</b><span>lecciones vistas</span></div><div class="kpi rv in" style="--d:2"><b>${(min / 60).toFixed(1).replace(".", ",")}</b><span>horas de estudio</span></div><div class="kpi rv in" style="--d:3"><b>${certs.length}</b><span>certificados</span></div></div>
    ${sig ? `<div class="sigue"><div class="tx"><small>Continúa donde quedaste</small><h2 style="font-size:1.5rem;margin-top:4px">${esc(sig.l.t)}</h2><small>${sig.c.nombre} · ${sig.l.m} min</small></div><a class="btn" href="#/curso/${sig.c.id}">Seguir ▶</a></div>` : `<div class="sigue"><div class="tx"><h2 style="font-size:1.4rem">¡Terminaste todas tus lecciones!</h2><small>Rinde el examen final para tu certificado o inscríbete en otro curso.</small></div></div>`}
    </section><section class="sec" id="s-nivel" data-t="Nivel" data-i="⭐"><div class="sec-h"><span class="num">01</span><div><h2>Tu nivel y ranking</h2><p>Gana XP estudiando y compárate con tu universidad.</p></div></div><div class="bloque nivel rv in"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:baseline"><b>Nivel ${nv.n} · ${nv.nombre}</b><span class="xp">${puntos} XP</span></div><div class="barra" style="margin:10px 0 4px"><i id="nvb" style="--w:0%"></i></div><small style="color:var(--gris)">${nv.pct < 100 ? `Te faltan ${nv.fin - puntos} XP para el siguiente nivel` : "¡Nivel máximo!"} · +10 XP por lección, +40 por examen aprobado, +100 por certificado</small>
      <h3 style="margin:16px 0 8px;font-size:1rem">Ranking · ${esc(u.uni)}</h3><div class="rank">${rk.map(x => `<div class="${x.yo ? "yo" : ""}"><span>${x.pos}</span><b>${esc(x.nombre)}${x.yo ? " (Tú)" : ""}</b><i style="--w:${Math.round(x.xp / rk[0].xp * 100)}%"></i><small>${x.xp} XP</small></div>`).join("")}</div></div>
    </section><section class="sec" id="s-metas" data-t="Metas" data-i="🎯"><div class="sec-h"><span class="num">02</span><div><h2>Metas y logros</h2><p>Tu constancia semanal, tu actividad y las insignias.</p></div></div><div class="dos">
      <div class="bloque" style="margin:0"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><b>Meta de la semana</b><label style="font-size:.85rem;color:var(--gris)">Estudiar <select id="meta" class="mini">${[2, 3, 4, 5, 6, 7].map(n => `<option ${n === meta ? "selected" : ""}>${n}</option>`).join("")}</select> días</label></div>
        <div style="display:flex;align-items:center;gap:16px;margin:14px 0">${anillo(pctMeta, "var(--ok)")}<div><b style="font:800 1.6rem var(--serif)">${ds}/${meta}</b> días<br><small style="color:var(--gris)">${ds >= meta ? "¡Meta cumplida! 🎯" : `Te faltan ${meta - ds} ${meta - ds === 1 ? "día" : "días"}.`}</small></div></div>
        <div class="heat" aria-label="Actividad de las últimas 5 semanas">${["L", "M", "M", "J", "V", "S", "D"].map(d => `<small>${d}</small>`).join("")}${hm.map(x => `<i class="${x.on ? "on" : ""} ${x.futuro ? "fut" : ""}" title="${x.f}${x.on ? " · estudiaste" : ""}"></i>`).join("")}</div>
        <div class="recuerda"><small style="color:var(--gris)">Recordatorio diario</small><div style="display:flex;gap:8px;margin-top:6px"><input type="time" id="hora" class="mini" value="19:00" aria-label="Hora"><button class="btn chico lin" id="ics">📅 Añadir al calendario</button></div></div></div>
      <div class="bloque" style="margin:0"><b>Logros</b> <small style="color:var(--gris)">${ins6.filter(x => x.ok).length}/${ins6.length}</small>
        <div class="logros">${ins6.map(x => `<div class="logro ${x.ok ? "ok" : ""}" title="${x.desc}"><span>${x.ico}</span><b>${x.nombre}</b><small>${x.ok ? "¡Lo lograste!" : x.desc}</small></div>`).join("")}</div></div>
    </div>
    </section><section class="sec" id="s-rutas" data-t="Rutas" data-i="🧭"><div class="sec-h"><span class="num">03</span><div><h2>Rutas de aprendizaje</h2><p>Combina cursos para un objetivo profesional.</p></div></div><div class="rutas">${RUTAS.map(r => { const g = C.rutaProgreso(r, CURSOS, todo); return `<div class="ruta ${g.completa ? "ok" : ""}"><span class="ri">${r.ico}</span><b>${r.nombre}</b><small>${r.desc}</small><div class="rpasos">${r.cursos.map(id => { const k = S.cursoPorId(id), hecho = C.puedeCertificar(k, todo[id]); return `<a href="#/curso/${id}" class="${hecho ? "hecho" : ""}" title="${k.nombre}">${hecho ? "✓" : esc(k.ico)}</a>`; }).join("<i></i>")}</div><div class="barra"><i style="--w:${g.pct}%"></i></div><small>${g.completa ? "🏅 ¡Ruta completada!" : `${g.hechos}/${g.total} cursos · sigue con <b>${g.sig.nombre}</b>`}</small></div>`; }).join("")}</div>
    </section><section class="sec" id="s-cursos" data-t="Mis cursos" data-i="📚"><div class="sec-h"><span class="num">04</span><div><h2>Mis cursos</h2><p>Continúa donde lo dejaste.</p></div></div><div class="grid2">${ins.map(c => { const r = C.resumen(c, todo[c.id]), cert = certs.some(x => x.curso.id === c.id); return `<a class="mi-curso" href="#/curso/${c.id}" style="--c:${c.color}">${anillo(r.pct, c.color)}<div class="tx"><b>${c.nombre}</b><br><small>${r.hechas}/${r.total} lecciones · ${c.prof}</small></div>${cert ? `<span class="etq ok">Certificado</span>` : r.pct === 100 ? `<span class="etq al">Examen</span>` : ""}</a>`; }).join("") || `<p class="vacio">Aún no tienes cursos.</p>`}</div></section>
    ${certs.length ? `<section class="sec" id="s-certs" data-t="Certificados" data-i="🎓"><div class="sec-h"><span class="num">05</span><div><h2>Mis certificados</h2><p>Verificables con código QR.</p></div></div><div class="grid2">${certs.map(x => `<a class="mi-curso" href="${url(x)}" target="_blank" rel="noopener"><span class="ico" style="--c:${x.curso.color}">🎓</span><div class="tx"><b>${x.curso.nombre}</b><br><small>Nota ${x.n}/20 · ${x.f}</small></div><span class="etq ok">Ver PDF</span></a>`).join("")}</div></section>` : ""}
    ${otros.length ? `<section class="sec" id="s-mas" data-t="Explorar" data-i="🔎"><div class="sec-h"><span class="num">06</span><div><h2>Explorar más cursos</h2><p>Suma otro curso a tu plan.</p></div></div><div class="grid2">${otros.map(c => `<div class="mi-curso"><span class="ico" style="--c:${c.color}">${esc(c.ico)}</span><div class="tx"><b>${c.nombre}</b><br><small>${C.lecciones(c).length} lecciones · ${c.horas} h</small></div><button class="btn chico" data-ins="${c.id}">Inscribirme</button></div>`).join("")}</div></section>` : ""}
    <p style="margin:34px 0 60px;color:var(--gris);font-size:.86rem">Demo: tu avance se guarda solo en este navegador. <a href="#" id="reinicia">Reiniciar mi progreso</a> · <a href="panel.html">Ver panel de coordinación</a></p>`;
    $$("[data-ins]").forEach(b => b.onclick = () => { S.inscribir(em, b.dataset.ins); toast("Inscrito ✓"); inicio(); });
    $("#meta").onchange = e => { S.ponMeta(em, +e.target.value); inicio(); };
    $("#ics").onclick = () => { const l = document.createElement("a"); l.href = URL.createObjectURL(new Blob([C.ics($("#hora").value || "19:00")], { type: "text/calendar" })); l.download = "recordatorio-estudio.ics"; l.click(); toast("Recordatorio descargado ✓"); };
    $("#reinicia").onclick = e => { e.preventDefault(); if (confirm("¿Borrar todo tu avance de esta demo?")) { S.reinicia(em); S.entrar(u); inicio(); } };
    requestAnimationFrame(() => requestAnimationFrame(() => $("#nvb") && $("#nvb").style.setProperty("--w", nv.pct + "%")));
    NavSec.build(app, $("#subnav"));
    animaAnillos();
  }
  const animaAnillos = () => $$(".anillo").forEach(a => { const v = a.style.getPropertyValue("--p"); a.style.setProperty("--p", 0); requestAnimationFrame(() => requestAnimationFrame(() => a.style.setProperty("--p", v))); });
  const url = x => `certificado.html?c=${x.curso.id}&e=${encodeURIComponent(em)}&n=${encodeURIComponent(u.nombre)}&f=${x.f}&nt=${x.n}&u=${encodeURIComponent(u.uni)}`;

  /* ---------- curso ---------- */
  function curso(id, key) {
    clearInterval(timer);
    const c = S.cursoPorId(id); if (!c) return inicio();
    S.inscribir(em, id);
    const ls = C.lecciones(c), p = S.prog(em, id), r = C.resumen(c, p);
    const act = key === "examen" || key === "repaso" ? null : (ls.find(l => l.key === key) || C.proxima(c, p) || ls[0]);
    const listo = r.pct === 100;
    const lateral = c.mods.map((m, i) => `<div class="mod-t">Módulo ${i + 1} · ${esc(m.t)}</div>` + ls.filter(l => l.mod === i).map(l => `<button class="lec ${p.l[l.key] ? "hecha" : ""} ${act && act.key === l.key ? "on" : ""}" data-k="${l.key}"><span class="pt"></span><span>${esc(l.t)}<small>${l.k === "video" ? "▶ Video" : "📖 Lectura"} · ${l.m} min</small></span></button>`).join("")).join("") +
      `<div class="mod-t">Cierre</div><button class="lec" data-k="repaso"><span class="pt" style="background:var(--ambar);border-color:var(--ambar)">↻</span><span>Repaso rápido<small>Tarjetas con lo que ya viste</small></span></button><button class="lec ex ${key === "examen" ? "on" : ""}" data-k="examen" ${listo ? "" : "disabled"}><span class="pt">${listo ? "★" : "🔒"}</span><span>Examen final<small>${listo ? (p.n != null ? "Tu mejor nota: " + p.n + "/20" : "5 preguntas · nota sobre 20") : "Completa todas las lecciones"}</small></span></button>`;
    app.innerHTML = `<p style="padding-top:18px"><a href="#/">← Mis cursos</a></p>
    <div class="vista"><aside class="lateral"><h3>${c.nombre}</h3><div style="display:flex;align-items:center;gap:10px;padding:4px 8px 6px"><div class="barra"><i id="bg" style="--w:0%"></i></div><small id="bgt">${r.pct} %</small></div>${lateral}</aside><section id="centro"></section></div>`;
    requestAnimationFrame(() => $("#bg").style.setProperty("--w", r.pct + "%"));
    $$(".lec").forEach(b => b.onclick = () => { if (!b.disabled) location.hash = `#/curso/${id}/${b.dataset.k}`; });
    ctl = null;
    if (key === "examen") examen(c, p); else if (key === "repaso") repaso(c, ls, p); else leccion(c, act, ls);
  }

  function leccion(c, l, ls) {
    const p = S.prog(em, c.id), hecha = !!p.l[l.key], idx = ls.findIndex(x => x.key === l.key), sig = ls[idx + 1];
    const dur = 7000; let t0 = 0, acum = 0, jugando = false;
    const prev = ls[idx - 1];
    $("#centro").innerHTML = `<div class="escena" style="--c:${c.color}"><span class="glifo">${esc(c.ico)}</span><span class="kick" style="color:var(--ambar)">${l.k === "video" ? "▶ Video · " : "📖 Lectura · "}Módulo ${l.mod + 1}</span><h2>${esc(l.t)}</h2><ul>${l.p.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="mando"><button class="pp" id="pp" aria-label="Reproducir">▶</button><div class="barra"><i id="pb" style="--w:${hecha ? 100 : 0}%;transition:none"></i></div><span class="t" id="tm">${hecha ? "Vista ✓" : "0:00 / " + l.m + ":00"}</span><div class="vel" role="group" aria-label="Velocidad">${[1, 1.5, 2].map(v => `<button type="button" data-v="${v}" class="${v === vel ? "on" : ""}">${v}x</button>`).join("")}</div></div>
    <p class="atajos"><kbd>Espacio</kbd> reproducir · <kbd>←</kbd> <kbd>→</kbd> cambiar lección · <kbd>/</kbd> buscar</p>
    <div class="acciones"><button class="btn" id="ok" ${hecha ? "disabled" : ""}>${hecha ? "✓ Lección vista" : "Marcar como vista"}</button>${sig ? `<button class="btn lin" id="nx">Siguiente: ${esc(sig.t.length > 28 ? sig.t.slice(0, 26) + "…" : sig.t)} →</button>` : ""}</div>
    <div class="bloque"><b>Mis apuntes</b><small style="color:var(--gris)"> (se guardan solos)</small><textarea id="ap" placeholder="Escribe lo que quieras recordar…">${esc(S.apunte(em, l.key))}</textarea></div>
    <div class="bloque"><b>Dudas de la clase</b><div id="dudas">${dudas(l.key)}</div><div style="display:flex;gap:8px;margin-top:10px"><input id="dq" class="mini" style="flex:1" placeholder="Escribe tu duda…" maxlength="160"><button class="btn chico" id="dsend">Preguntar</button></div></div>`;
    const lis = $$(".escena li"), pb = $("#pb"), tm = $("#tm"), pp = $("#pp");
    const muestra = f => lis.forEach((x, i) => x.classList.toggle("v", f >= (i + .3) / lis.length - .15 || hecha));
    muestra(hecha ? 1 : 0); if (hecha) lis.forEach(x => x.classList.add("v"));
    const fin = () => { jugando = false; clearInterval(timer); pp.textContent = "▶"; if (!S.prog(em, c.id).l[l.key]) marca(); };
    const marca = () => {
      S.marca(em, c.id, l.key); toast("Lección completada ✓"); pb.style.transition = ""; pb.style.setProperty("--w", "100%"); tm.textContent = "Vista ✓"; lis.forEach(x => x.classList.add("v"));
      const b = $("#ok"); b.disabled = true; b.textContent = "✓ Lección vista";
      const r = C.resumen(c, S.prog(em, c.id)); $("#bg").style.setProperty("--w", r.pct + "%"); $("#bgt").textContent = r.pct + " %";
      $$(".lec").forEach(x => { if (x.dataset.k === l.key) x.classList.add("hecha"); });
      if (r.pct === 100) { confeti(); const e = $('.lec[data-k="examen"]'); e.disabled = false; e.querySelector(".pt").textContent = "★"; e.querySelector("small").textContent = "5 preguntas · nota sobre 20"; toast("¡Terminaste las lecciones! Ya puedes rendir el examen"); }
    };
    pp.onclick = () => {
      if (hecha || S.prog(em, c.id).l[l.key]) return toast("Ya viste esta lección");
      if (jugando) { jugando = false; acum += (performance.now() - t0) * vel; clearInterval(timer); pp.textContent = "▶"; return; }
      jugando = true; t0 = performance.now(); pp.textContent = "❚❚";
      timer = setInterval(() => { const ms = acum + (performance.now() - t0) * vel, f = Math.min(1, ms / dur); pb.style.transition = "none"; pb.style.setProperty("--w", f * 100 + "%"); const seg = Math.round(f * l.m * 60); tm.textContent = Math.floor(seg / 60) + ":" + String(seg % 60).padStart(2, "0") + " / " + l.m + ":00"; muestra(f); if (f >= 1) fin(); }, 80);
    };
    $$(".vel button").forEach(b => b.onclick = () => { if (jugando) { acum += (performance.now() - t0) * vel; t0 = performance.now(); } vel = +b.dataset.v; $$(".vel button").forEach(x => x.classList.toggle("on", x === b)); });
    ctl = { toggle: () => pp.click(), next: () => sig && (location.hash = `#/curso/${c.id}/${sig.key}`), prev: () => prev && (location.hash = `#/curso/${c.id}/${prev.key}`) };
    $("#dsend").onclick = () => { const v = $("#dq").value.trim(); if (!v) return; const q = leeD(l.key); q.push(v); try { localStorage.setItem("ac_q_" + l.key, JSON.stringify(q)); } catch (e) {} $("#dq").value = ""; $("#dudas").innerHTML = dudas(l.key); toast("Duda enviada ✓"); };
    $("#ok").onclick = marca;
    if ($("#nx")) $("#nx").onclick = () => { location.hash = `#/curso/${c.id}/${sig.key}`; };
    $("#ap").oninput = e => S.guardaApunte(em, l.key, e.target.value);
    if (innerWidth < 900) $("#centro").scrollIntoView({ block: "start" });
  }

  function examen(c, p) {
    const cen = $("#centro"); clearInterval(timer);
    cen.innerHTML = `<div class="preg resul"><span class="kick">Evaluación · ${esc(c.nombre)}</span><h3 style="font-family:var(--serif);font-size:1.6rem;margin:6px 0 16px">¿Cómo quieres practicar?</h3>
    <div class="modos"><button class="modo" id="ex-real"><span>⏱</span><b>Examen final</b><small>${c.examen.length} preguntas · 5 minutos · cuenta para tu certificado</small></button><button class="modo" id="ex-sim"><span>🧪</span><b>Simulacro</b><small>Sin cronómetro ni nota. Ves la explicación de cada respuesta al instante.</small></button></div></div>`;
    $("#ex-real").onclick = () => examenReal(c, p); $("#ex-sim").onclick = () => simulacro(c);
  }
  function simulacro(c) {
    const cen = $("#centro"); let i = 0, ok = 0, vista = false;
    const pinta = () => {
      const q = c.examen[i];
      cen.innerHTML = `<div class="preg"><span class="kick">Simulacro · pregunta ${i + 1} de ${c.examen.length} · aciertos ${ok}</span><div class="barra" style="margin:6px 0 14px"><i style="--w:${i / c.examen.length * 100}%;transition:none"></i></div><h3>${esc(q.q)}</h3>${q.o.map((o, j) => `<button class="opc" data-j="${j}">${String.fromCharCode(65 + j)}. ${esc(o)}</button>`).join("")}<div id="expl"></div></div>`;
      vista = false;
      $$(".opc", cen).forEach(b => b.onclick = () => {
        if (vista) return; vista = true; const j = +b.dataset.j, bien = j === q.c; if (bien) ok++;
        $$(".opc", cen).forEach((x, k) => { x.classList.toggle("bien", k === q.c); x.classList.toggle("mal", k === j && !bien); x.disabled = true; });
        $("#expl").innerHTML = `<div class="explica ${bien ? "ok" : "no"}"><b>${bien ? "¡Correcto!" : "Casi"}</b><p>${esc(q.e)}</p></div><div class="acciones"><button class="btn" id="sg">${i < c.examen.length - 1 ? "Siguiente →" : "Ver resultado"}</button></div>`;
        $("#sg").onclick = () => { if (i < c.examen.length - 1) { i++; pinta(); } else { cen.innerHTML = `<div class="preg resul"><span class="kick">Simulacro terminado</span><div class="gran">${ok}<small style="font-size:1.4rem;color:var(--gris)">/${c.examen.length}</small></div><p style="color:var(--gris);margin:8px 0 18px">${ok === c.examen.length ? "¡Perfecto! Estás listo para el examen final." : ok >= 3 ? "Vas muy bien. Repite el simulacro y rinde el examen final." : "Repasa las lecciones y las tarjetas, y vuelve a intentarlo."}</p><div class="acciones" style="justify-content:center"><button class="btn" id="again">Repetir simulacro</button><button class="btn lin" id="real">Ir al examen final</button></div></div>`; if (ok === c.examen.length) confeti(); $("#again").onclick = () => simulacro(c); $("#real").onclick = () => examenReal(c, S.prog(em, c.id)); } };
      });
    };
    pinta();
  }
  function examenReal(c, p) {
    const cen = $("#centro"), resp = []; let i = 0, iniciado = false, resta = 300;
    const crono = () => { const e = $("#crono"); if (e) { e.textContent = "⏱ " + Math.floor(resta / 60) + ":" + String(resta % 60).padStart(2, "0"); e.classList.toggle("urge", resta <= 60); } };
    const pinta = () => {
      if (!iniciado) { iniciado = true; resta = 300; clearInterval(timer); timer = setInterval(() => { resta--; crono(); if (resta <= 0) { clearInterval(timer); toast("Se acabó el tiempo"); fin(); } }, 1000); }
      const q = c.examen[i];
      cen.innerHTML = `<div class="preg"><span class="kick">Examen final · pregunta ${i + 1} de ${c.examen.length} <span id="crono" class="crono"></span></span><div class="barra" style="margin:6px 0 14px"><i style="--w:${i / c.examen.length * 100}%;transition:none"></i></div><h3>${esc(q.q)}</h3>${q.o.map((o, j) => `<button class="opc ${resp[i] === j ? "sel" : ""}" data-j="${j}">${String.fromCharCode(65 + j)}. ${esc(o)}</button>`).join("")}<div class="acciones">${i > 0 ? `<button class="btn lin" id="at">← Anterior</button>` : ""}<button class="btn" id="av" ${resp[i] == null ? "disabled" : ""}>${i === c.examen.length - 1 ? "Terminar examen" : "Siguiente →"}</button></div></div>`;
      $$(".opc", cen).forEach(b => b.onclick = () => { resp[i] = +b.dataset.j; pinta(); });
      if ($("#at")) $("#at").onclick = () => { i--; pinta(); };
      $("#av").onclick = () => { if (i < c.examen.length - 1) { i++; pinta(); } else fin(); };
    };
    const fin = () => {
      clearInterval(timer);
      const r = C.nota(resp, c.examen); S.nota(em, c.id, r.nota);
      const q = S.prog(em, c.id), cert = C.puedeCertificar(c, q); if (r.aprobado) confeti();
      cen.innerHTML = `<div class="preg resul"><span class="kick">${r.aprobado ? "¡Aprobado!" : "Aún no alcanza"}</span><div class="gran" style="color:${r.aprobado ? "var(--ok)" : "var(--mal)"}">${r.nota}<small style="font-size:1.4rem;color:var(--gris)">/20</small></div><p style="color:var(--gris);margin:8px 0 18px">${r.ok} de ${r.total} respuestas correctas. ${r.aprobado ? "Tu certificado está listo." : "Necesitas 11 o más. Repasa las lecciones y vuelve a intentarlo."}</p>
      <div style="text-align:left;margin:18px 0">${c.examen.map((p, k) => `<p style="margin:8px 0;font-size:.92rem">${resp[k] === p.c ? "✅" : "❌"} ${esc(p.q)}${resp[k] === p.c ? "" : `<br><small style="color:var(--gris)">Correcta: ${esc(p.o[p.c])}. ${esc(p.e)}</small>`}</p>`).join("")}</div>
      <div class="acciones" style="justify-content:center">${cert ? `<a class="btn" target="_blank" rel="noopener" href="${url({ curso: c, f: q.f, n: q.n })}">🎓 Descargar certificado PDF</a>` : ""}<button class="btn lin" id="re">Repetir examen</button><a class="btn lin" href="#/">Mis cursos</a></div></div>`;
      $("#re").onclick = () => { resp.length = 0; i = 0; iniciado = false; pinta(); };
    };
    if (p.n != null && C.puedeCertificar(c, p)) { cen.innerHTML = `<div class="preg resul"><span class="kick">Curso aprobado</span><div class="gran" style="color:var(--ok)">${p.n}<small style="font-size:1.4rem;color:var(--gris)">/20</small></div><p style="color:var(--gris);margin:8px 0 18px">Ya tienes tu certificado. Puedes rendir de nuevo para subir la nota.</p><div class="acciones" style="justify-content:center"><a class="btn" target="_blank" rel="noopener" href="${url({ curso: c, f: p.f, n: p.n })}">🎓 Descargar certificado PDF</a><button class="btn lin" id="ri">Rendir otra vez</button></div></div>`; $("#ri").onclick = pinta; } else pinta();
  }

  function repaso(c, ls, p) {
    const vistas = ls.filter(l => p.l[l.key]), est = S.repaso(em, c.id); let i = 0;
    const cen = $("#centro");
    $$(".lec").forEach(b => b.classList.toggle("on", b.dataset.k === "repaso"));
    if (!vistas.length) { cen.innerHTML = `<div class="preg vacio"><h3>Aún no hay tarjetas</h3><p>Mira al menos una lección y aquí aparecerán para repasar.</p></div>`; return; }
    const pinta = () => {
      const l = vistas[i], sabe = vistas.filter(x => est[x.key] === 1).length;
      cen.innerHTML = `<div class="preg"><span class="kick">Repaso rápido · ${i + 1} de ${vistas.length}</span><div class="barra" style="margin:6px 0"><i style="--w:${sabe / vistas.length * 100}%;transition:none"></i></div><small style="color:var(--gris)">Las sabes: ${sabe}/${vistas.length}. Toca la tarjeta para ver la respuesta.</small>
      <div class="tarjeta-rep" id="tr" tabindex="0" role="button" aria-label="Girar tarjeta"><div><div class="c"><span class="kick">${esc(c.nombre)} · Módulo ${l.mod + 1}</span><h3 style="font-family:var(--serif);font-size:1.5rem">¿Qué recuerdas de «${esc(l.t)}»?</h3></div><div class="c atras"><b>${esc(l.t)}</b><ul>${l.p.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div></div></div>
      <div class="acciones" style="justify-content:center"><button class="btn lin" id="no">Repasar de nuevo</button><button class="btn" id="si">Ya la sé ✓</button></div></div>`;
      const tr = $("#tr"); tr.onclick = () => tr.classList.toggle("vuelta"); tr.onkeydown = e => { if (e.key === "Enter") tr.click(); };
      const sig = v => { est[l.key] = v; S.ponRepaso(em, c.id, est); i = (i + 1) % vistas.length; pinta(); };
      $("#si").onclick = () => sig(1); $("#no").onclick = () => sig(0);
    };
    pinta();
  }

  /* ---------- dudas por lección ---------- */
  const SEMILLA = [["Mateo (tutor)", "Revisa el resumen de la lección y luego intenta el ejemplo tú mismo; si sigue la duda, pregunta aquí."], ["Ana, alumna", "A mí me ayudó repetir el ejemplo a mano antes de ver la solución."]];
  const leeD = k => { try { return JSON.parse(localStorage.getItem("ac_q_" + k)) || []; } catch (e) { return []; } };
  const dudas = k => [...SEMILLA.map(x => ({ a: x[0], t: x[1], s: 1 })), ...leeD(k).map(t => ({ a: u.nombre.split(" ")[0] + " (Tú)", t }))].map(x => `<div class="duda ${x.s ? "" : "mia"}"><b>${esc(x.a)}</b><p>${esc(x.t)}</p></div>`).join("");
  /* ---------- modo enfoque (pomodoro) ---------- */
  const pom = document.createElement("div"); pom.className = "pomo"; pom.innerHTML = `<button type="button" id="pomb" aria-label="Modo enfoque">🍅 <span id="pomt">Enfoque 25:00</span></button>`; document.body.appendChild(pom);
  let pi = null, pr = 1500;
  const pf = () => { const m = String(Math.floor(pr / 60)).padStart(2, "0"), s = String(pr % 60).padStart(2, "0"); $("#pomt").textContent = (pi ? "Enfocado " : "Enfoque ") + m + ":" + s; };
  $("#pomb").onclick = () => { if (pi) { clearInterval(pi); pi = null; pr = 1500; pom.classList.remove("on"); document.body.classList.remove("enfoque"); pf(); return; } pom.classList.add("on"); document.body.classList.add("enfoque"); pi = setInterval(() => { pr--; pf(); if (pr <= 0) { clearInterval(pi); pi = null; pr = 1500; pom.classList.remove("on"); document.body.classList.remove("enfoque"); pf(); toast("¡Pomodoro completo! Descansa 5 minutos 🍅"); confeti(); } }, 1000); pf(); };
  /* ---------- buscador global ---------- */
  const bus = document.createElement("div"); bus.className = "buscador"; bus.innerHTML = `<div role="dialog" aria-label="Buscar"><input id="q" placeholder="Busca un tema: derivada, IGV, APA, bucles…" autocomplete="off"><div id="rb" style="margin-top:8px"></div></div>`; document.body.appendChild(bus);
  const abreBus = () => { bus.classList.add("on"); $("#q").value = ""; $("#rb").innerHTML = `<p class="vacio">Escribe al menos 2 letras.</p>`; setTimeout(() => $("#q").focus(), 30); };
  const cierraBus = () => bus.classList.remove("on");
  bus.onclick = e => { if (e.target === bus) cierraBus(); };
  $("#q").oninput = e => { const r = C.busca(CURSOS, e.target.value); $("#rb").innerHTML = r.length ? r.map(x => `<button class="res-b" data-h="#/curso/${x.c.id}/${x.l.key}"><span class="ico" style="--c:${x.c.color}">${esc(x.c.ico)}</span><span><b>${esc(x.l.t)}</b><small>${esc(x.c.nombre)} · ${x.l.m} min</small></span></button>`).join("") : `<p class="vacio">Sin resultados para «${esc(e.target.value)}».</p>`; };
  $("#rb").onclick = e => { const b = e.target.closest("[data-h]"); if (b) { location.hash = b.dataset.h; cierraBus(); } };
  const bb = document.createElement("button"); bb.className = "btn-buscar"; bb.innerHTML = `🔍 <span>Buscar</span> <kbd>/</kbd>`; bb.onclick = abreBus; $(".yo").insertBefore(bb, $(".yo").firstChild);
  addEventListener("keydown", e => {
    const t = e.target.tagName; if (e.key === "Escape") return cierraBus();
    if (/INPUT|TEXTAREA|SELECT/.test(t)) return;
    if (e.key === "/" || (e.ctrlKey && e.key.toLowerCase() === "k")) { e.preventDefault(); return abreBus(); }
    if (!ctl) return;
    if (e.key === " ") { e.preventDefault(); ctl.toggle(); } else if (e.key === "ArrowRight") ctl.next(); else if (e.key === "ArrowLeft") ctl.prev();
  });

  function ruta() {
    const h = location.hash.replace(/^#\/?/, "").split("/");
    if (h[0] === "curso" && h[1]) curso(h[1], h.slice(2).join("/")); else inicio();
    scrollTo(0, 0);
  }
  addEventListener("hashchange", ruta); ruta();
})();
