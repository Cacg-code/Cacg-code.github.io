/* Jolgorio — © Carlo · Dev (demo). Panel de la organizadora: solicitudes, calendario y eventos. */
(function () {
  const J = window.JOL, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const leer = (k, def) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? def : v; } catch (e) { return def; } };
  const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const hoy = new Date(), esc = J.esc;
  let sols = leer("jol_sol", null); if (!Array.isArray(sols)) sols = J.semilla();
  let chk = leer("jol_chk", {}); if (!chk || typeof chk !== "object") chk = {};
  const guardaSols = () => guardar("jol_sol", sols), guardaChk = () => guardar("jol_chk", chk);
  let tt; const toast = m => { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2600); };
  const S = { vista: "sol", filtro: "todas", mes: hoy.getFullYear() * 12 + hoy.getMonth(), dia: null };
  const FIRMADO = s => s.estado === "reservado" || s.estado === "realizado";
  const celWa = s => `https://wa.me/51${s.cel}?text=${encodeURIComponent(J.waCliente(s))}`;
  const lista = id => { const s = sols.find(x => x.id === id); if (!chk[id]) chk[id] = J.checklistInicial(s.tipo, s.extras, s.pago); return chk[id]; };
  const choque = (s, f) => sols.some(x => x.id !== s.id && x.estado === "reservado" && x.fecha === f) || J.BLOQUEOS.includes(f);

  function cabecera() {
    const r = J.resumenPanel(sols);
    $("#lead").textContent = `Hoy es ${J.fechaLarga(J.isoDe(hoy))}. Tienes ${r.por.nuevo} ${r.por.nuevo === 1 ? "solicitud nueva" : "solicitudes nuevas"} y ${r.aCobrar} ${r.aCobrar === 1 ? "pago por confirmar" : "pagos por confirmar"}.`;
    $("#kpis").innerHTML = [
      ["Por atender", r.por.nuevo + r.por.cotizado, `${r.por.nuevo} nuevas · ${r.por.cotizado} cotizadas`, "var(--viol)"],
      ["Pagos por confirmar", r.aCobrar, "adelantos avisados", "var(--coral)"],
      ["Eventos reservados", r.por.reservado, `${r.por.realizado} ya realizados`, "var(--menta)"],
      ["Ventas firmadas", J.soles(r.ingresos), `${J.soles(r.pipeline)} en negociación`, "var(--oro)"]
    ].map(([t, v, s, c]) => `<div class="kpi" style="--c:${c}"><small>${t}</small><b>${v}</b><span>${s}</span></div>`).join("");
    $("#tabs").innerHTML = [["sol", "Solicitudes", r.por.nuevo], ["cal", "Calendario", 0], ["ev", "Eventos", r.por.reservado], ["pag", "Pagos", sols.filter(s => FIRMADO(s) && J.cobranza(s, hoy).estado === "vencido").length]].map(([id, n, c]) => `<button role="tab" data-v="${id}" class="${S.vista === id ? "on" : ""}" aria-selected="${S.vista === id}">${n}${c ? `<i>${c}</i>` : ""}</button>`).join("") + `<a class="btn sm suave dem" style="color:var(--ink);align-self:center" href="index.html#cotiza">+ Probar el cotizador</a>`;
    $$("#tabs button").forEach(b => b.onclick = () => { S.vista = b.dataset.v; pinta(); });
  }

  /* Solicitudes */
  function pintaSol() {
    const r = J.resumenPanel(sols), tot = Math.max(1, r.total), col = { nuevo: "#6B3FE0", cotizado: "#FFC53D", reservado: "#22C99A", realizado: "#9A93AE" };
    $("#pipe").innerHTML = J.ESTADOS.map(e => `<i style="width:${r.por[e] * 100 / tot}%;background:${col[e]}" title="${J.ESTADO_N[e]}: ${r.por[e]}"></i>`).join("");
    $("#filtros").innerHTML = [["todas", "Todas", r.total], ...J.ESTADOS.map(e => [e, J.ESTADO_N[e], r.por[e]])].map(([id, n, c]) => `<button data-f="${id}" class="${S.filtro === id ? "on" : ""}">${n} · ${c}</button>`).join("");
    $$("#filtros button").forEach(b => b.onclick = () => { S.filtro = b.dataset.f; pintaSol(); });
    const l = sols.filter(s => S.filtro === "todas" || s.estado === S.filtro).sort((a, b) => b.creada.localeCompare(a.creada));
    $("#lista").innerHTML = l.length ? l.map(s => { const t = J.TIPOS[s.tipo];
      return `<article class="sol" data-id="${s.id}"><div class="q"><span class="em">${t.emoji}</span><div><b>${esc(s.nombre)}</b><small>${s.id} · ${t.n} · ${J.fechaCorta(s.fecha)}</small><small>${s.invitados} invitados · ${esc(s.cel)}</small></div></div>
        <div><span class="m">${J.soles(s.total)}</span><small>Adelanto ${J.soles(s.adelanto)}</small><span class="pag ${s.pago ? "s" : s.aviso ? "a" : "n"}">${s.pago ? "Adelanto pagado" : s.aviso ? "Avisó que pagó" : "Sin pago"}</span></div>
        <div><span class="est ${s.estado}">${J.ESTADO_N[s.estado]}</span><br><label class="sr" style="font-size:.74rem;color:var(--mut)">Cambiar a <select data-est aria-label="Estado de ${esc(s.nombre)}">${J.ESTADOS.map(e => `<option value="${e}" ${e === s.estado ? "selected" : ""}>${J.ESTADO_N[e]}</option>`).join("")}</select></label></div>
        <div class="ac">${!s.pago && s.estado !== "realizado" ? `<button class="pri" data-a="paga">Confirmar adelanto</button>` : ""}<a target="_blank" rel="noopener" href="${celWa(s)}">WhatsApp</a><a target="_blank" rel="noopener" href="presupuesto.html?id=${s.id}">Presupuesto PDF</a><button data-a="del">Eliminar</button></div></article>`; }).join("")
      : `<div class="vacio-p">No hay solicitudes en este estado todavía.</div>`;
    $$("#lista .sol").forEach(el => { const s = sols.find(x => x.id === el.dataset.id);
      $("[data-est]", el).onchange = e => cambia(s, e.target.value);
      const p = $('[data-a="paga"]', el); if (p) p.onclick = () => { if (!FIRMADO(s) && choque(s, s.fecha)) return toast("Esa fecha ya está tomada por otro evento"); s.pago = true; s.aviso = true; if (!FIRMADO(s)) s.estado = "reservado"; guardaSols(); pinta(); toast(`Adelanto confirmado: ${s.id} reservado ✅`); };
      const d = $('[data-a="del"]', el); let arm = 0; d.onclick = () => { if (!arm) { arm = 1; d.textContent = "¿Seguro?"; d.style.cssText = "background:#d6304b;color:#fff;border-color:#d6304b"; return void setTimeout(() => { arm = 0; if (d.isConnected) { d.textContent = "Eliminar"; d.style.cssText = ""; } }, 3000); }
        sols = sols.filter(x => x.id !== s.id); delete chk[s.id]; guardaSols(); guardaChk(); pinta(); toast("Solicitud eliminada"); };
    });
  }
  function cambia(s, e) {
    if ((e === "reservado" || e === "realizado") && !FIRMADO(s) && choque(s, s.fecha)) { toast("Esa fecha ya está tomada por otro evento"); return pintaSol(); }
    s.estado = e; guardaSols(); pinta(); toast(`${s.id} pasó a ${J.ESTADO_N[e].toLowerCase()}`);
  }

  /* Calendario */
  function pintaCal() {
    const anio = Math.floor(S.mes / 12), m = S.mes % 12, mes = J.mes(anio, m, [], hoy), pors = {}; sols.forEach(s => { (pors[s.fecha] = pors[s.fecha] || []).push(s); });
    const hoyIso = J.isoDe(hoy);
    $("#calP").innerHTML = `<div class="cal-h"><button type="button" id="pP" aria-label="Mes anterior">‹</button><b>${mes.titulo}</b><button type="button" id="pN" aria-label="Mes siguiente">›</button></div>
      <div class="cal-g">${["L", "M", "M", "J", "V", "S", "D"].map(d => `<span class="dw">${d}</span>`).join("")}${mes.celdas.map(c => { if (c.vacio) return "<i></i>";
        const ev = (pors[c.iso] || []).filter(s => s.estado !== "nuevo" || true), fir = ev.find(FIRMADO), pend = ev.find(s => !FIRMADO(s)), bl = J.BLOQUEOS.includes(c.iso);
        const cls = fir ? `b${fir.estado === "realizado" ? " r" : ""}` : pend ? "b k" : bl ? "bl" : "";
        const nom = fir || pend; return `<button type="button" data-f="${c.iso}" class="${cls}${c.iso === S.dia ? " sel" : ""}${c.iso === hoyIso ? " hoy" : ""}" aria-label="${J.fechaLarga(c.iso)}${nom ? ", " + esc(nom.nombre) : bl ? ", ocupado por otro cliente" : ""}">${c.d}${nom ? `<small>${esc(nom.nombre.split(" ")[0])}</small>` : ""}</button>`; }).join("")}</div>
      <div class="leyenda" style="color:var(--mut);margin-top:.9rem"><span style="--x:1"><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:var(--ink);margin-right:.35rem"></i>Reservado</span><span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:var(--coral);margin-right:.35rem"></i>Pendiente</span><span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:var(--menta);margin-right:.35rem"></i>Realizado</span><span><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:#E8DDF8;margin-right:.35rem"></i>Otro cliente</span></div>`;
    $("#pP").onclick = () => { S.mes--; pintaCal(); }; $("#pN").onclick = () => { S.mes++; pintaCal(); };
    $$("#calP [data-f]").forEach(b => b.onclick = () => { S.dia = b.dataset.f; pintaCal(); pintaDia(pors); });
    pintaDia(pors);
  }
  function pintaDia(pors) {
    const el = $("#det"), f = S.dia;
    if (!f) { const prox = sols.filter(s => FIRMADO(s) && s.fecha >= J.isoDe(hoy)).sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 4);
      el.innerHTML = `<h3>Próximos eventos</h3>${prox.length ? prox.map(s => `<p style="margin-bottom:.7rem"><b style="color:var(--ink)">${J.TIPOS[s.tipo].emoji} ${esc(s.nombre)}</b><br>${J.fechaLarga(s.fecha)} · ${s.invitados} invitados</p>`).join("") : "<p>No hay eventos próximos reservados.</p>"}<p style="font-size:.85rem">Toca un día del calendario para ver el detalle.</p>`; return; }
    const ev = pors[f] || [], r = J.recargoFecha(f), bl = J.BLOQUEOS.includes(f);
    el.innerHTML = `<h3>${J.fechaLarga(f)}</h3>${ev.length ? ev.map(s => `<p style="margin-bottom:.9rem"><b style="color:var(--ink)">${J.TIPOS[s.tipo].emoji} ${esc(s.nombre)}</b> <span class="est ${s.estado}">${J.ESTADO_N[s.estado]}</span><br>${s.id} · ${s.invitados} invitados · ${J.soles(s.total)}</p>`).join("") : bl ? "<p>Ocupado por otro cliente (sin detalle en la demo).</p>" : `<p>Día libre. ${r.pct ? `Se cotiza con recargo de ${r.pct} % (${r.motivos.join(" + ")}).` : "Sin recargo: buen día para ofrecer descuento."}</p>`}`;
  }


  /* Pagos y cobranza */
  const PAG_E = { vencido: ["Vencido", "ven"], pronto: ["Vence pronto", "pro"], aldia: ["Al día", "ok"], pagado: ["Pagado", "ok"] };
  function pintaPag() {
    const cs = sols.filter(FIRMADO).map(s => [s, J.cobranza(s, hoy)]);
    const suma = (f, k) => cs.filter(f).reduce((t, [, c]) => t + c[k], 0);
    const cobrado = suma(() => true, "cobrado"), pend = suma(() => true, "pendiente");
    const venc = suma(([, c]) => c.estado === "vencido", "pendiente"), sem = suma(([, c]) => c.estado === "pronto", "pendiente");
    const meses = {}; cs.forEach(([s, c]) => { const m = meses[s.fecha.slice(0, 7)] || (meses[s.fecha.slice(0, 7)] = { c: 0, p: 0 }); m.c += c.cobrado; m.p += c.pendiente; });
    const ks = Object.keys(meses).sort(), max = Math.max(1, ...ks.map(k => meses[k].c + meses[k].p));
    const por = cs.filter(([, c]) => c.estado !== "pagado").sort((a, b) => a[1].vence.localeCompare(b[1].vence)), hechos = cs.filter(([, c]) => c.estado === "pagado");
    const cuando = d => d < 0 ? `venció hace ${-d} ${-d === 1 ? "día" : "días"}` : d === 0 ? "vence hoy" : `vence en ${d} ${d === 1 ? "día" : "días"}`;
    $("#pag").innerHTML = `<div class="pg-res"><div><small>Cobrado</small><b style="color:#1f7a55">${J.soles(cobrado)}</b></div><div><small>Por cobrar</small><b>${J.soles(pend)}</b></div><div class="${venc ? "alerta" : ""}"><small>Vencido</small><b>${J.soles(venc)}</b></div><div><small>Vence en 14 días</small><b>${J.soles(sem)}</b></div></div>
      <div class="pg-grid"><section class="pg-box"><h3>Ingresos por mes del evento</h3><div class="pg-bar">${ks.map(k => { const m = meses[k], [y, mo] = k.split("-"); return `<div class="col"><span class="v">${J.soles(m.c + m.p)}</span><div class="pila" style="height:${Math.max(6, (m.c + m.p) * 80 / max)}%"><i class="pe" style="flex:${m.p}"></i><i class="co" style="flex:${m.c}"></i></div><small>${J.MESES[Number(mo) - 1].slice(0, 3)} ${y.slice(2)}</small></div>`; }).join("")}</div><div class="leyenda" style="margin-top:.8rem;color:var(--mut)"><span><i class="dot" style="background:var(--menta)"></i>Cobrado</span><span><i class="dot" style="background:#FFB4A4"></i>Por cobrar</span></div></section>
      <section class="pg-box"><h3>Por cobrar</h3>${por.length ? por.map(([s, c]) => `<article class="pg-fila" data-id="${s.id}"><div><b>${J.TIPOS[s.tipo].emoji} ${esc(s.nombre)}</b><small>Evento ${J.fechaCorta(s.fecha)} · saldo ${cuando(c.dias)} (${J.fechaCorta(c.vence)})</small></div><div class="r"><b>${J.soles(c.pendiente)}</b><span class="etq pg-${PAG_E[c.estado][1]}">${PAG_E[c.estado][0]}</span></div><div class="ac"><a target="_blank" rel="noopener" href="https://wa.me/51${s.cel}?text=${encodeURIComponent(J.waCobro(s, hoy))}">💬 Recordar por WhatsApp</a><button data-saldo>Marcar saldo pagado</button></div></article>`).join("") : `<div class="vacio-p" style="padding:1.6rem">Todo cobrado 🎉 No hay saldos pendientes.</div>`}
        ${hechos.length ? `<details class="hechas"><summary>${hechos.length} evento${hechos.length > 1 ? "s" : ""} ya cobrado${hechos.length > 1 ? "s" : ""} por completo</summary>${hechos.map(([s]) => `<div class="pg-fila ok"><div><b>${J.TIPOS[s.tipo].emoji} ${esc(s.nombre)}</b><small>${J.fechaCorta(s.fecha)}</small></div><div class="r"><b>${J.soles(s.total)}</b><span class="etq pg-ok">Pagado</span></div></div>`).join("")}</details>` : ""}</section></div>`;
    $$("#pag .pg-fila[data-id]").forEach(el => { const s = sols.find(x => x.id === el.dataset.id);
      $("[data-saldo]", el).onclick = () => { s.pago = true; s.aviso = true; s.saldoOk = true; guardaSols(); pinta(); toast(`Saldo de ${s.nombre.split(" ")[0]} marcado como pagado ✅`); }; });
  }

  /* Eventos reservados */
  const C = 2 * Math.PI * 52;
  function aro(p) { return `<div class="aro"><svg viewBox="0 0 130 130" aria-hidden="true"><circle class="f" cx="65" cy="65" r="52"/><circle class="p" cx="65" cy="65" r="52" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - p / 100)).toFixed(1)}"/></svg><b>${p}%</b></div>`; }
  const abiertos = new Set();
  function pintaEv() {
    const evs = sols.filter(s => s.estado === "reservado").sort((a, b) => a.fecha.localeCompare(b.fecha));
    $("#evs").innerHTML = evs.length ? evs.map(s => { const t = J.TIPOS[s.tipo], l = lista(s.id), p = J.avance(l), op = abiertos.has(s.id);
      const hechas = l.filter(x => x.ok).length, sig = l.find(x => !x.ok);
      const dias = Math.round((J.aFecha(s.fecha) - new Date().setHours(0, 0, 0, 0)) / 864e5);
      const cuando = dias < 0 ? "ya pasó" : dias === 0 ? "es hoy" : dias === 1 ? "mañana" : `en ${dias} días`;
      const pend = l.map((x, i) => [x, i]).filter(([x]) => !x.ok), hechos = l.map((x, i) => [x, i]).filter(([x]) => x.ok);
      const fila = ([x, i]) => `<label><input type="checkbox" data-i="${i}" ${x.ok ? "checked" : ""}><span>${esc(x.t)}</span></label>`;
      return `<article class="ev${op ? " abre" : ""}" data-id="${s.id}">
        <button class="ev-cab" type="button" aria-expanded="${op}">${aro(p)}<span class="ev-tit"><h3>${t.emoji} ${esc(s.nombre)}</h3><span class="meta">${J.fechaCorta ? J.fechaCorta(s.fecha) : J.fechaLarga(s.fecha)} · ${cuando} · ${s.invitados} invitados</span></span>
          <span class="ev-est"><span class="etq ${s.pago ? "ok" : "pen"}">${s.pago ? "Adelanto ✅" : "Adelanto ⏳"}</span><span class="ev-mas">${op ? "Ocultar" : "Ver detalle"} <i>⌄</i></span></span></button>
        <div class="ev-sig">${sig ? `<span>Siguiente paso</span><b>${esc(sig.t)}</b>` : `<span>Todo listo</span><b>Solo falta marcar el evento como realizado 🎉</b>`}<em>${hechas}/${l.length}</em></div>
        <div class="ev-cuerpo"><div class="din"><span>Total <b>${J.soles(s.total)}</b></span><span>Adelanto <b>${J.soles(s.adelanto)}</b></span><span>Saldo <b>${J.soles(s.total - s.adelanto)}</b></span></div>
          <div class="chk">${pend.map(fila).join("")}</div>
          ${hechos.length ? `<details class="hechas"><summary>${hechos.length} tarea${hechos.length > 1 ? "s" : ""} hecha${hechos.length > 1 ? "s" : ""}</summary><div class="chk">${hechos.map(fila).join("")}</div></details>` : ""}
          <form class="nt"><input maxlength="80" placeholder="Agregar tarea…" aria-label="Nueva tarea"><button class="btn sm sec" type="submit">Agregar</button></form></div>
        <div class="ac"><a href="admin.html?e=${t.inv}">👥 Invitados</a><a href="invitacion.html?e=${t.inv}">💌 Invitación</a><a target="_blank" rel="noopener" href="${celWa(s)}">WhatsApp</a><button data-real>Marcar realizado</button></div></article>`; }).join("")
      : `<div class="vacio-p">Aún no hay eventos reservados. Confirma el adelanto de una solicitud y aparecerá aquí con su checklist.</div>`;
    $$("#evs .ev").forEach(el => { const s = sols.find(x => x.id === el.dataset.id);
      $(".ev-cab", el).onclick = () => { abiertos.has(s.id) ? abiertos.delete(s.id) : abiertos.add(s.id); pintaEv(); };
      $$(".chk input", el).forEach(i => i.onchange = () => { lista(s.id)[Number(i.dataset.i)].ok = i.checked; guardaChk(); pintaEv(); });
      $(".nt", el).onsubmit = e => { e.preventDefault(); const v = $("input", e.target).value.trim(); if (!v) return; lista(s.id).push({ t: v, ok: false }); guardaChk(); pintaEv(); };
      $("[data-real]", el).onclick = () => cambia(s, "realizado");
    });
  }

  function pinta() {
    cabecera(); $$(".vista").forEach(v => v.classList.toggle("on", v.id === "v-" + S.vista));
    if (S.vista === "sol") pintaSol(); else if (S.vista === "cal") pintaCal(); else if (S.vista === "pag") pintaPag(); else pintaEv();
  }
  $("#csv").onclick = () => { const b = new Blob([J.csv(sols)], { type: "text/csv;charset=utf-8" }), a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "solicitudes-jolgorio.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1500); };
  let armaB = 0; $("#borra").onclick = e => { if (!armaB) { armaB = 1; e.target.textContent = "¿Seguro? Toca otra vez"; return void setTimeout(() => { armaB = 0; e.target.textContent = "Restaurar datos de la demo"; }, 3000); }
    try { localStorage.removeItem("jol_sol"); localStorage.removeItem("jol_chk"); } catch (x) {} sols = J.semilla(); chk = {}; armaB = 0; e.target.textContent = "Restaurar datos de la demo"; pinta(); toast("Datos de la demo restaurados"); };
  const q = new URLSearchParams(location.search); if (["sol", "cal", "ev"].includes(q.get("v"))) S.vista = q.get("v");
  pinta();
})();
