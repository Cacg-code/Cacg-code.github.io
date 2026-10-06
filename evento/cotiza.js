/* Lógica pura de Jolgorio (cotizador, calendario, panel) — © Carlo · Dev (demo). Sin DOM, se prueba con node --test. */
(function (g) {
  const TIPOS = {
    boda: { id: "boda", n: "Boda", emoji: "💍", base: 2800, def: 120, min: 30, inv: "boda", d: "Ceremonia, recepción y baile con cronograma al minuto.", sug: ["local", "deco", "dj", "catering", "foto"] },
    quince: { id: "quince", n: "Quinceañera", emoji: "👑", base: 2200, def: 100, min: 30, inv: "cumple", d: "El vals, la entrada y una noche que no se olvida.", sug: ["deco", "dj", "catering", "foto", "postres"] },
    cumple: { id: "cumple", n: "Cumpleaños", emoji: "🎂", base: 900, def: 40, min: 10, inv: "cumple", d: "Desde la reunión íntima hasta la fiesta grande.", sug: ["deco", "dj", "postres", "barra"] },
    despedida: { id: "despedida", n: "Despedida", emoji: "🍻", base: 700, def: 20, min: 8, inv: "despedida", d: "Retos, parrilla y movilidad. Tú solo llegas.", sug: ["show", "catering", "movil"] },
    corp: { id: "corp", n: "Corporativo", emoji: "🏢", base: 1800, def: 80, min: 20, inv: "boda", d: "Aniversarios, lanzamientos y fiestas de fin de año.", sug: ["local", "catering", "dj", "foto"] }
  };

  const EXTRAS = {
    local: { id: "local", n: "Local con ambientes", d: "Salón o hacienda para tu evento", modo: "fijo", precio: 1800, ic: "🏛️" },
    catering: { id: "catering", n: "Catering", d: "Entrada, fondo y bebidas, por persona", modo: "persona", precio: 58, ic: "🍽️" },
    barra: { id: "barra", n: "Barra de tragos", d: "Bartenders, insumos y coctelería, por persona", modo: "persona", precio: 28, ic: "🍸" },
    deco: { id: "deco", n: "Decoración y ambientación", d: "Mesas, flores, luces y backdrop", modo: "fijo", precio: 1100, ic: "🌸" },
    dj: { id: "dj", n: "DJ y sonido", d: "Equipo, luces y música a tu medida", modo: "fijo", precio: 750, ic: "🎧" },
    foto: { id: "foto", n: "Foto y video", d: "Cobertura completa y galería online", modo: "fijo", precio: 950, ic: "📸" },
    postres: { id: "postres", n: "Torta y mesa de postres", d: "Dulces y torta personalizada, por persona", modo: "persona", precio: 9, ic: "🍰" },
    show: { id: "show", n: "Animación y show", d: "Animador, juegos y sorpresa en vivo", modo: "fijo", precio: 650, ic: "🎤", solo: ["cumple", "quince", "despedida", "corp"] },
    movil: { id: "movil", n: "Movilidad", d: "Transporte de ida y vuelta para tus invitados", modo: "fijo", precio: 480, ic: "🚌" }
  };

  const PAQUETES = {
    esencial: { id: "esencial", n: "Esencial", extras: ["deco", "dj"], dto: 0, d: "Lo básico bien hecho: ambiente y música." },
    completo: { id: "completo", n: "Completo", extras: ["deco", "dj", "catering", "foto"], dto: 5, d: "Comida, recuerdos y fiesta. El más pedido." },
    premium: { id: "premium", n: "Premium", extras: ["local", "deco", "dj", "catering", "barra", "foto", "postres"], dto: 8, d: "Llegas tú y listo: local, comida, tragos y todo." }
  };

  const ESTADOS = ["nuevo", "cotizado", "reservado", "realizado"];
  const ESTADO_N = { nuevo: "Nuevo", cotizado: "Cotizado", reservado: "Reservado", realizado: "Realizado" };
  const ADELANTO = 0.3;

  const pad = n => String(n).padStart(2, "0");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const soles = n => "S/ " + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const aFecha = iso => { const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };
  const isoDe = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "setiembre", "octubre", "noviembre", "diciembre"];
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const fechaLarga = iso => { const d = aFecha(iso); return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`; };
  const fechaCorta = iso => { const d = aFecha(iso); return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`; };

  function extrasValidos(tipo, ids) {
    return [...new Set(ids || [])].filter(id => EXTRAS[id] && (!EXTRAS[id].solo || EXTRAS[id].solo.includes(tipo)));
  }

  function recargoFecha(iso) {
    if (!iso) return { pct: 0, motivos: [] };
    const d = aFecha(iso), dow = d.getDay(), motivos = []; let pct = 0;
    if (dow === 6) { pct += 10; motivos.push("sábado"); } else if (dow === 5 || dow === 0) { pct += 5; motivos.push(dow === 5 ? "viernes" : "domingo"); }
    if (d.getMonth() === 11) { pct += 8; motivos.push("temporada de diciembre"); }
    return { pct, motivos };
  }

  function paqueteAplicable(extras) {
    let mejor = null;
    Object.values(PAQUETES).forEach(p => { if (p.dto > 0 && p.extras.every(e => extras.includes(e)) && (!mejor || p.dto > mejor.dto)) mejor = p; });
    return mejor;
  }

  function presupuesto({ tipo, invitados, fecha, extras }) {
    const t = TIPOS[tipo]; if (!t) return null;
    const n = Math.max(0, Math.round(Number(invitados) || 0));
    const ex = extrasValidos(tipo, extras), lineas = [];
    lineas.push({ id: "base", n: "Organización y coordinación", det: `Planificación completa de tu ${t.n.toLowerCase()}`, monto: t.base });
    const staff = Math.max(1, Math.ceil(n / 40));
    lineas.push({ id: "staff", n: "Staff de apoyo", det: `${staff} ${staff === 1 ? "persona" : "personas"} × ${soles(140)}`, monto: staff * 140 });
    ex.forEach(id => {
      const e = EXTRAS[id];
      lineas.push({ id, n: e.n, det: e.modo === "persona" ? `${soles(e.precio)} × ${n} invitados` : "Servicio completo", monto: e.modo === "persona" ? e.precio * n : e.precio });
    });
    lineas.push({ id: "invitacion", n: "Invitación digital con RSVP", det: "Link por invitado y panel de confirmaciones", monto: 0, incluido: true });
    const subtotal = lineas.reduce((s, l) => s + l.monto, 0);
    const paq = paqueteAplicable(ex);
    const descuento = paq ? Math.round(subtotal * paq.dto / 100) : 0;
    const rec = recargoFecha(fecha);
    const recargo = Math.round((subtotal - descuento) * rec.pct / 100);
    const total = subtotal - descuento + recargo;
    return { tipo, invitados: n, extras: ex, lineas, subtotal, paquete: paq ? paq.id : null, paqueteN: paq ? paq.n : null, descuento, recargo, recargoPct: rec.pct, recargoMotivo: rec.motivos.join(" + "), total, adelanto: Math.round(total * ADELANTO), saldo: total - Math.round(total * ADELANTO), porPersona: n ? Math.round(total / n) : 0 };
  }

  const estaOcupada = (iso, ocupadas) => (ocupadas || []).includes(iso);
  const celularValido = c => /^9\d{8}$/.test(String(c || "").replace(/\D/g, ""));
  const limpiaCel = c => String(c || "").replace(/\D/g, "").slice(-9);

  function valida(d, ocupadas, hoy = new Date()) {
    const e = {}, t = TIPOS[d.tipo];
    if (!t) e.tipo = "Elige el tipo de evento.";
    const n = Number(d.invitados);
    if (t && (!Number.isInteger(n) || n < t.min || n > 500)) e.invitados = `Entre ${t.min} y 500 invitados.`;
    if (!d.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)) e.fecha = "Elige una fecha en el calendario.";
    else if (aFecha(d.fecha) < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 7)) e.fecha = "Necesitamos al menos 7 días de anticipación.";
    else if (estaOcupada(d.fecha, ocupadas)) e.fecha = "Esa fecha ya está reservada. Elige otra.";
    return e;
  }
  function validaContacto(d) {
    const e = {};
    if (!d.nombre || d.nombre.trim().length < 3) e.nombre = "Escribe tu nombre.";
    if (!celularValido(d.cel)) e.cel = "Celular de 9 dígitos que empiece con 9.";
    return e;
  }

  /* Calendario del mes: lunes primero */
  function mes(anio, m, ocupadas, hoy = new Date()) {
    const primero = new Date(anio, m, 1), vacios = (primero.getDay() + 6) % 7, dias = new Date(anio, m + 1, 0).getDate(), minimo = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 7);
    const celdas = []; for (let i = 0; i < vacios; i++) celdas.push({ vacio: true });
    for (let d = 1; d <= dias; d++) { const iso = `${anio}-${pad(m + 1)}-${pad(d)}`; celdas.push({ d, iso, ocupada: estaOcupada(iso, ocupadas), pasado: aFecha(iso) < minimo, dow: new Date(anio, m, d).getDay() }); }
    return { titulo: `${MESES[m][0].toUpperCase()}${MESES[m].slice(1)} ${anio}`, celdas };
  }

  /* Solicitudes y panel */
  const BLOQUEOS = ["2026-10-31", "2026-11-07", "2026-11-21", "2026-12-12", "2026-12-19", "2026-12-26", "2027-01-09", "2027-02-20"];
  const ocupadasDe = (sols, bloqueos = BLOQUEOS) => [...new Set([...bloqueos, ...sols.filter(s => s.estado === "reservado" || s.estado === "realizado").map(s => s.fecha)])].sort();

  function nuevaSolicitud(d, sols, ahora = new Date()) {
    const num = sols.reduce((m, s) => Math.max(m, Number(String(s.id).replace(/\D/g, "")) || 0), 1000) + 1;
    const p = presupuesto(d);
    return { id: "JOL-" + num, creada: ahora.toISOString(), nombre: d.nombre.trim(), cel: limpiaCel(d.cel), tipo: d.tipo, invitados: p.invitados, fecha: d.fecha, extras: p.extras, total: p.total, adelanto: p.adelanto, estado: "nuevo", pago: false, aviso: false, nota: d.nota || "" };
  }

  /* Cobranza: el saldo vence 7 días antes del evento; en eventos realizados se da por pagado. */
  const saldoPagado = s => s.estado === "realizado" || !!s.saldoOk;
  function cobranza(s, hoy = new Date()) {
    const saldo = s.total - s.adelanto, ok = saldoPagado(s), cobrado = (s.pago ? s.adelanto : 0) + (ok ? saldo : 0);
    const vence = isoDe(new Date(aFecha(s.fecha).getTime() - 7 * 86400000)), dias = Math.round((aFecha(vence) - new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())) / 86400000);
    return { saldo, cobrado, pendiente: s.total - cobrado, vence, dias, saldoOk: ok, estado: ok && s.pago ? "pagado" : dias < 0 ? "vencido" : dias <= 14 ? "pronto" : "aldia" };
  }
  const waCobro = (s, hoy, yape = "999 888 777") => { const c = cobranza(s, hoy), pide = !s.pago ? c.pendiente : c.saldo;
    return `Hola ${s.nombre.split(" ")[0]} 👋 Te escribe Jolgorio. Te recordamos que ${!s.pago ? "falta el adelanto" : "el saldo"} de ${soles(pide)} de tu ${TIPOS[s.tipo].n.toLowerCase()} del ${fechaLarga(s.fecha)} ${c.dias < 0 ? "ya venció" : "vence el " + fechaLarga(c.vence)}. Puedes pagarlo por Yape/Plin al ${yape}. ¡Gracias! 🎉`; };

  function resumenPanel(sols) {
    const por = {}; ESTADOS.forEach(e => { por[e] = sols.filter(s => s.estado === e).length; });
    const firmados = sols.filter(s => s.estado === "reservado" || s.estado === "realizado");
    return {
      por, total: sols.length,
      ingresos: firmados.reduce((t, s) => t + s.total, 0),
      cobrado: firmados.reduce((t, s) => t + (s.pago ? s.adelanto : 0) + (saldoPagado(s) ? s.total - s.adelanto : 0), 0),
      aCobrar: sols.filter(s => s.aviso && !s.pago && s.estado !== "realizado").length,
      pipeline: sols.filter(s => s.estado === "nuevo" || s.estado === "cotizado").reduce((t, s) => t + s.total, 0)
    };
  }

  function checklistInicial(tipo, extras, pagado) {
    const lista = [["Firmar contrato y cobrar adelanto", !!pagado], ["Reunión de ideas con el cliente", false], ["Enviar invitación digital a los invitados", false]];
    (extras || []).forEach(id => { if (EXTRAS[id]) lista.push([`Confirmar: ${EXTRAS[id].n.toLowerCase()}`, false]); });
    if (tipo === "boda" || tipo === "quince") lista.push(["Ensayo de ceremonia y vals", false]);
    lista.push(["Cerrar lista de asistentes (RSVP)", false], ["Cronograma final y briefing con el staff", false], ["Cobrar saldo y entregar recuerdos", false]);
    return lista.map(([t, ok]) => ({ t, ok }));
  }
  const avance = lista => lista.length ? Math.round(lista.filter(x => x.ok).length * 100 / lista.length) : 0;

  const waCliente = (s, empresa = "Jolgorio") => `Hola ${s.nombre.split(" ")[0]} 👋 Te escribe ${empresa}. Recibimos tu solicitud ${s.id} para ${TIPOS[s.tipo].n.toLowerCase()} el ${fechaLarga(s.fecha)} (${s.invitados} invitados). Tu presupuesto estimado es ${soles(s.total)}; con ${soles(s.adelanto)} de adelanto reservamos tu fecha. ¿Conversamos?`;
  const waEmpresa = (s, numero) => `https://wa.me/${numero}?text=${encodeURIComponent(`Hola Jolgorio, soy ${s.nombre}. Envié la solicitud ${s.id}: ${TIPOS[s.tipo].n.toLowerCase()} el ${fechaLarga(s.fecha)}, ${s.invitados} invitados. Total estimado ${soles(s.total)}. ${s.pago ? "Ya pagué el adelanto por Yape." : "Quiero coordinar el adelanto."}`)}`;

  function ics(s, ahora = new Date()) {
    const t = TIPOS[s.tipo], d = s.fecha.replace(/-/g, ""), sig = isoDe(new Date(aFecha(s.fecha).getTime() + 86400000)).replace(/-/g, "");
    const st = `${ahora.getUTCFullYear()}${pad(ahora.getUTCMonth() + 1)}${pad(ahora.getUTCDate())}T${pad(ahora.getUTCHours())}${pad(ahora.getUTCMinutes())}${pad(ahora.getUTCSeconds())}Z`;
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Carlo Dev//Jolgorio//ES", "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `UID:${s.id}@jolgorio-demo`, `DTSTAMP:${st}`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${sig}`,
      `SUMMARY:${t.n} con Jolgorio (${s.id})`, `DESCRIPTION:Fecha apartada con Jolgorio. Adelanto ${soles(s.adelanto)}. Total estimado ${soles(s.total)}.`, "BEGIN:VALARM", "TRIGGER:-P7D", "ACTION:DISPLAY", "DESCRIPTION:Falta una semana", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  }

  const csvCelda = x => { let t = String(x == null ? "" : x); if (/^[=+\-@]/.test(t)) t = "'" + t; return `"${t.replace(/"/g, '""')}"`; };
  const csv = sols => "﻿" + [["Código", "Cliente", "Celular", "Evento", "Fecha", "Invitados", "Total", "Adelanto", "Estado", "Adelanto pagado"],
    ...sols.map(s => [s.id, s.nombre, s.cel, TIPOS[s.tipo].n, s.fecha, s.invitados, s.total, s.adelanto, ESTADO_N[s.estado], s.pago ? "Sí" : "No"])].map(f => f.map(csvCelda).join(",")).join("\r\n");

  function semilla(ahora = new Date("2026-10-06T09:00:00")) {
    const mk = (id, dias, nombre, cel, tipo, invitados, fecha, extras, estado, pago, aviso) => {
      const p = presupuesto({ tipo, invitados, fecha, extras });
      return { id, creada: new Date(ahora.getTime() - dias * 86400000).toISOString(), nombre, cel, tipo, invitados, fecha, extras: p.extras, total: p.total, adelanto: p.adelanto, estado, pago, aviso, nota: "" };
    };
    return [
      mk("JOL-1030", 40, "Colegio San Martín", "987123456", "corp", 70, "2026-09-19", ["local", "catering", "dj", "foto"], "realizado", true, true),
      mk("JOL-1042", 22, "Valeria Rojas", "999111222", "boda", 120, "2027-02-13", ["local", "deco", "dj", "catering", "barra", "foto", "postres"], "reservado", true, true),
      mk("JOL-1051", 14, "Sofía Torres", "988222333", "cumple", 60, "2026-12-05", ["deco", "dj", "barra", "postres", "show"], "reservado", true, true),
      mk("JOL-1058", 9, "Marco Pérez", "955444333", "despedida", 25, "2026-11-14", ["show", "catering", "movil"], "reservado", true, true),
      mk("JOL-1063", 5, "Rosa Medina · Textil Andina", "977333444", "corp", 90, "2026-11-28", ["local", "catering", "dj", "foto"], "cotizado", false, false),
      mk("JOL-1066", 2, "Camila Ruiz", "966555666", "quince", 110, "2027-01-23", ["deco", "dj", "catering", "foto", "postres", "barra"], "nuevo", false, true),
      mk("JOL-1067", 1, "Luis Quispe", "933777888", "cumple", 35, "2026-10-24", ["deco", "dj"], "nuevo", false, false)
    ];
  }

  const API = { TIPOS, EXTRAS, PAQUETES, ESTADOS, ESTADO_N, ADELANTO, BLOQUEOS, esc, soles, aFecha, isoDe, MESES, fechaLarga, fechaCorta, extrasValidos, recargoFecha, paqueteAplicable, presupuesto, estaOcupada, celularValido, limpiaCel, valida, validaContacto, mes, ocupadasDe, nuevaSolicitud, resumenPanel, saldoPagado, cobranza, waCobro, checklistInicial, avance, waCliente, waEmpresa, ics, csv, semilla };
  if (typeof module !== "undefined" && module.exports) module.exports = API; else g.JOL = API;
})(typeof window !== "undefined" ? window : globalThis);
