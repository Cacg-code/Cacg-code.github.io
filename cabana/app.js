/* Reservas Cabaña Pinar — © Carlo · Dev (demo). Todo se guarda en el navegador. */
(function () {
  const L = window.CP, N = L.NEGOCIO;
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const hoy = L.hoyISO();
  const KEY = "cp_reservas";
  const leer = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  const guardar = r => { try { localStorage.setItem(KEY, JSON.stringify(r)); } catch (e) { /* modo privado */ } };
  const ocupadas = () => L.ocupadasDemo(hoy).concat(leer().filter(r => r.estado !== "cancelada").map(r => ({ ini: r.ini, fin: r.fin })));

  const S = { ini: null, fin: null, hue: 2, base: hoy.slice(0, 7) + "-01", medio: "Yape", pm: null, res: null };
  const MES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const mesDe = b => { const d = L.aDate(b); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; };
  const addMes = (b, n) => { const { y, m } = mesDe(b); return L.iso(new Date(Date.UTC(y, m + n, 1))); };

  /* ---------- Calendario ---------- */
  function pintaMes(b) {
    const { y, m } = mesDe(b), oc = ocupadas();
    const pri = new Date(Date.UTC(y, m, 1)), off = (pri.getUTCDay() + 6) % 7, nd = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    let h = `<div class="mes"><h3>${MES[m]} ${y}</h3><div class="sem">${["L", "M", "X", "J", "V", "S", "D"].map(d => `<span>${d}</span>`).join("")}</div><div class="dias">`;
    for (let i = 0; i < off; i++) h += `<button class="v" tabindex="-1" aria-hidden="true"></button>`;
    for (let d = 1; d <= nd; d++) {
      const s = L.iso(new Date(Date.UTC(y, m, d))), c = [];
      const ocupada = L.nocheOcupada(s, oc), pasada = s < hoy;
      const eligiendoSalida = S.ini && !S.fin && s > S.ini;
      const bloqueada = pasada || (eligiendoSalida ? !L.rangoLibre(S.ini, s, oc) : ocupada);
      if (pasada) c.push("pas"); else if (bloqueada) c.push("ocu");
      if (s === hoy) c.push("hoy");
      if (S.ini && S.fin && s > S.ini && s < S.fin) c.push("rng");
      if (s === S.ini) c.push("sel", "s1"); if (s === S.fin) c.push("sel", "s2");
      const precio = !bloqueada && !pasada && !c.includes("sel") ? `<small>${L.tarifaNoche(s)}</small>` : "";
      h += `<button class="${c.join(" ")}" data-d="${s}"${bloqueada ? " disabled" : ""} aria-label="${L.fmt(s)}${ocupada ? ", ocupado" : ""}">${d}${precio}</button>`;
    }
    return h + "</div></div>";
  }
  function pintaCal() {
    $("#meses").innerHTML = pintaMes(S.base) + pintaMes(addMes(S.base, 1));
    $("#prev").disabled = S.base <= hoy.slice(0, 7) + "-01";
    $("#next").disabled = S.base >= addMes(hoy.slice(0, 7) + "-01", 5);
    const a = mesDe(S.base), b = mesDe(addMes(S.base, 1));
    $("#rangoMes").textContent = `${MES[a.m]} – ${MES[b.m]} ${b.y}`;
  }
  function pulsa(d) {
    const oc = ocupadas(); $("#aviso").textContent = "";
    if (!S.ini || S.fin) { S.ini = d; S.fin = null; }
    else if (d <= S.ini) { S.ini = d; }
    else if (L.rangoLibre(S.ini, d, oc)) {
      const n = L.diasEntre(S.ini, d);
      if (n < N.minNoches) { $("#aviso").textContent = `Mínimo ${N.minNoches} noches: elige una salida más adelante.`; return; }
      S.fin = d;
    } else { S.ini = d; S.fin = null; $("#aviso").textContent = "Esas fechas incluyen noches ocupadas."; }
    todo();
  }
  $("#meses").addEventListener("click", e => { const b = e.target.closest("button[data-d]"); if (b && !b.disabled) pulsa(b.dataset.d); });
  $("#meses").addEventListener("pointerover", e => {
    const b = e.target.closest("button[data-d]"); if (!S.ini || S.fin || !b || b.disabled) return;
    $$("#meses .pre").forEach(x => x.classList.remove("pre"));
    $$("#meses button[data-d]").forEach(x => { if (x.dataset.d > S.ini && x.dataset.d < b.dataset.d) x.classList.add("pre"); });
  });
  $("#meses").addEventListener("pointerleave", () => $$("#meses .pre").forEach(x => x.classList.remove("pre")));
  $("#prev").onclick = () => { S.base = addMes(S.base, -1); pintaCal(); };
  $("#next").onclick = () => { S.base = addMes(S.base, 1); pintaCal(); };

  /* ---------- Resumen ---------- */
  let tw = 0;
  function cuenta(el, a) {
    const de = parseFloat(el.dataset.v || 0); el.dataset.v = a;
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) { el.textContent = L.soles(a); return; }
    cancelAnimationFrame(tw); const t0 = performance.now();
    (function f(t) { const k = Math.min(1, (t - t0) / 600), e = 1 - Math.pow(1 - k, 3); el.textContent = L.soles(Math.round(de + (a - de) * e)); if (k < 1) tw = requestAnimationFrame(f); })(t0);
  }
  function resumen() {
    const ok = S.ini && S.fin, p = ok ? L.precio({ ini: S.ini, fin: S.fin, huespedes: S.hue }) : null;
    $("#rLle").textContent = S.ini ? L.fmt(S.ini) : "—"; $("#rSal").textContent = S.fin ? L.fmt(S.fin) : "—";
    $("#bLle").textContent = S.ini ? L.fmt(S.ini) : "Elegir"; $("#bSal").textContent = S.fin ? L.fmt(S.fin) : "Elegir";
    $("#bHue").textContent = S.hue + (S.hue > 1 ? " personas" : " persona"); $("#hNum").textContent = S.hue;
    $("#hMenos").disabled = S.hue <= 1; $("#hMas").disabled = S.hue >= N.maxHuespedes;
    $("#continuar").disabled = !ok;
    if (!ok) {
      $("#rDet").innerHTML = `<p class="vacio">${S.ini ? "Ahora elige la salida." : "Elige llegada y salida en el calendario para ver el precio."}</p>`;
      $("#fSub").textContent = "Desde"; $("#fTxt").textContent = `S/ ${N.tarifa.semana} / noche`; $("#fBtn").textContent = "Ver fechas"; return;
    }
    $("#rDet").innerHTML = `
      ${p.semana ? `<div class="lin"><span>${p.semana} noche${p.semana > 1 ? "s" : ""} entre semana × S/ ${N.tarifa.semana}</span><span>${L.soles(p.semana * N.tarifa.semana)}</span></div>` : ""}
      ${p.finde ? `<div class="lin"><span>${p.finde} noche${p.finde > 1 ? "s" : ""} de fin de semana × S/ ${N.tarifa.finde}</span><span>${L.soles(p.finde * N.tarifa.finde)}</span></div>` : ""}
      ${p.extra ? `<div class="lin"><span>${p.extras} huésped${p.extras > 1 ? "es" : ""} extra</span><span>${L.soles(p.extra)}</span></div>` : ""}
      <div class="lin"><span>Limpieza</span><span>${L.soles(p.limpieza)}</span></div>
      <div class="lin t"><span>Total (${p.n} noches)</span><b id="vTot">${L.soles(p.total)}</b></div>
      <div class="adel"><small>Adelanto para reservar · ${N.adelantoPct} %</small><b id="vAdel">${L.soles(p.adelanto)}</b><span>Saldo al llegar: ${L.soles(p.saldo)}</span></div>`;
    $("#vTot").dataset.v = p.total; $("#vAdel").dataset.v = p.adelanto;
    if (S.pm !== p.total) { cuenta($("#vTot"), p.total); cuenta($("#vAdel"), p.adelanto); S.pm = p.total; }
    $("#fSub").textContent = `${p.n} noches · adelanto`; $("#fTxt").textContent = L.soles(p.adelanto); $("#fBtn").textContent = "Reservar";
  }
  function todo() { pintaCal(); resumen(); }
  $("#hMenos").onclick = () => { S.hue = Math.max(1, S.hue - 1); S.pm = null; resumen(); };
  $("#hMas").onclick = () => { S.hue = Math.min(N.maxHuespedes, S.hue + 1); S.pm = null; resumen(); };
  $("#barra").addEventListener("click", e => { if (e.target.closest("label")) { e.preventDefault(); $("#reservar").scrollIntoView({ behavior: "smooth" }); } });
  $("#fBtn").addEventListener("click", e => { if (S.ini && S.fin) { e.preventDefault(); abre(); } });

  /* ---------- Panel de pasos ---------- */
  const vela = $("#vela");
  function paso(n) {
    $$("[data-p]", vela).forEach(s => s.hidden = +s.dataset.p !== n);
    $$(".pbar i", vela).forEach((i, k) => i.classList.toggle("on", k < n));
    $(".panel", vela).scrollTop = 0;
  }
  function abre() {
    const p = L.precio({ ini: S.ini, fin: S.fin, huespedes: S.hue });
    $("#mFechas").textContent = `${L.fmt(S.ini)} → ${L.fmt(S.fin)} · ${S.hue} huésp.`; $("#mTotal").textContent = L.soles(p.total);
    vela.classList.add("on"); vela.setAttribute("aria-hidden", "false"); paso(1); setTimeout(() => $("#nom").focus(), 80);
  }
  function cierra() { vela.classList.remove("on"); vela.setAttribute("aria-hidden", "true"); }
  $("#continuar").onclick = abre; $("#cerrar").onclick = cierra;
  vela.addEventListener("click", e => { if (e.target === vela) cierra(); });
  addEventListener("keydown", e => { if (e.key === "Escape") cierra(); });

  const err = (id, mal) => $(id).classList.toggle("err", mal);
  $("#a1").onclick = () => {
    const a = L.nombreValido($("#nom").value), b = L.celularValido($("#cel").value);
    err("#cNom", !a); err("#cCel", !b); if (!a || !b) return;
    const p = L.precio({ ini: S.ini, fin: S.fin, huespedes: S.hue });
    $("#pMonto").textContent = L.soles(p.adelanto); $("#pNum").textContent = N.yape; $("#pTit2").textContent = N.titular;
    qr(`${S.medio}|${N.yape.replace(/\s/g, "")}|${p.adelanto}`); paso(2); setTimeout(() => $("#op").focus(), 80);
  };
  function qr(t) {
    const q = qrcode(0, "M"); q.addData(t); q.make(); const n = q.getModuleCount(); let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    $("#qr").innerHTML = `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" aria-label="Código QR de pago (demo)"><path d="${d}" fill="#1F3A2E"/></svg>`;
  }
  $$(".medios button").forEach(b => b.onclick = () => {
    S.medio = b.dataset.m; $$(".medios button").forEach(x => x.classList.toggle("on", x === b));
    const p = L.precio({ ini: S.ini, fin: S.fin, huespedes: S.hue }); qr(`${S.medio}|${N.yape.replace(/\s/g, "")}|${p.adelanto}`);
  });
  $("#b2").onclick = () => paso(1);
  $("#a2").onclick = () => {
    const op = $("#op").value.trim(), mal = !/^\d{6,}$/.test(op); err("#cOp", mal); if (mal) return;
    const p = L.precio({ ini: S.ini, fin: S.fin, huespedes: S.hue });
    const r = { id: "R" + Date.now().toString(36).toUpperCase(), nombre: $("#nom").value.trim(), cel: L.limpiaCel($("#cel").value), nota: $("#nota").value.trim(),
      ini: S.ini, fin: S.fin, huespedes: S.hue, medio: S.medio, op, total: p.total, adelanto: p.adelanto, estado: "pendiente", creada: new Date().toISOString() };
    const todas = leer(); todas.push(r); guardar(todas); S.res = r;
    $("#tkt").innerHTML = `<div><span>Reserva</span><b>${r.id}</b></div><div><span>Llegada</span><b>${L.fmt(r.ini)} · ${N.checkIn}</b></div><div><span>Salida</span><b>${L.fmt(r.fin)} · ${N.checkOut}</b></div><div><span>Huéspedes</span><b>${r.huespedes}</b></div><div><span>Adelanto (${r.medio})</span><b>${L.soles(r.adelanto)}</b></div><div><span>Saldo al llegar</span><b>${L.soles(p.saldo)}</b></div>`;
    $("#wa").href = L.waUrl(L.mensajeReserva(r)); paso(3);
    S.ini = S.fin = null; S.pm = null; todo(); sugerencias();
  };
  $("#ics").onclick = () => {
    const r = S.res; if (!r) return;
    const url = URL.createObjectURL(new Blob([L.icsEstancia(r)], { type: "text/calendar" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "estancia-cabana-pinar.ics" }); a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  /* ---------- Sugerencias de fechas libres ---------- */
  function sugerencias() {
    const oc = ocupadas(), r = []; let d = hoy;
    for (let i = 0; i < 90 && r.length < 4; i++, d = L.suma(d, 1)) {
      if (d < hoy || L.aDate(d).getUTCDay() !== 5) continue;
      const fin = L.suma(d, 2);
      if (L.rangoLibre(d, fin, oc)) r.push({ ini: d, fin, t: "Finde" });
    }
    const sem = (() => { let x = L.suma(hoy, 1); for (let i = 0; i < 60; i++, x = L.suma(x, 1)) { const f = L.suma(x, 3); if (!L.esFinde(x) && L.aDate(x).getUTCDay() !== 0 && L.rangoLibre(x, f, oc)) return { ini: x, fin: f, t: "3 noches" }; } return null; })();
    if (sem) r.push(sem);
    $("#sug").innerHTML = `<span>Fechas libres sugeridas</span>` + r.map(x => {
      const p = L.precio({ ini: x.ini, fin: x.fin, huespedes: S.hue });
      return `<button data-i="${x.ini}" data-f="${x.fin}">${L.fmt(x.ini)} → ${L.fmt(x.fin)}<small>${L.soles(p.total)}</small></button>`;
    }).join("");
  }
  $("#sug").addEventListener("click", e => {
    const b = e.target.closest("button[data-i]"); if (!b) return;
    S.ini = b.dataset.i; S.fin = b.dataset.f; S.base = S.ini.slice(0, 7) + "-01"; S.pm = null; $("#aviso").textContent = ""; todo();
  });
  $("#hola").href = L.waUrl("Hola Rosa, tengo una consulta sobre la Cabaña Pinar.");
  window.addEventListener("storage", () => { todo(); sugerencias(); });
  todo(); sugerencias();
})();
