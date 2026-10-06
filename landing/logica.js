/* La Marea: lógica pura (horarios, reservas, mensajes de WhatsApp). Sin DOM, para poder probarla con node:test. */
(function (g) {
  const HORAS = { 0: [12, 17], 1: null, 2: [12, 17], 3: [12, 17], 4: [12, 17], 5: [12, 18], 6: [12, 18] }; // [abre, cierra] por día (0 = domingo)
  const DN = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const SEMANA = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  const fmtH = t => `${String(Math.floor(t)).padStart(2, "0")}:${t % 1 ? "30" : "00"}`;
  const diaDe = iso => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d).getDay(); };
  const dmas = (iso, n) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };

  // Fecha y hora actuales en Lima: {fecha:"YYYY-MM-DD", h: 13.5, d: 0-6}
  function ahoraLima(date = new Date()) {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(date).map(x => [x.type, x.value]));
    const fecha = `${p.year}-${p.month}-${p.day}`;
    return { fecha, h: (+p.hour % 24) + (+p.minute) / 60, d: diaDe(fecha) };
  }

  // Texto del estado "Abierto ahora / Cerrado ahora" para el día d (0-6) y la hora h (decimal)
  function textoEstado(d, h) {
    const hoy = HORAS[d];
    if (hoy && h >= hoy[0] && h < hoy[1]) {
      const f = hoy[1] - h;
      let hh = Math.floor(f), mm = Math.round((f - hh) * 60);
      if (mm === 60) { hh++; mm = 0; }
      return { abierto: true, texto: `Abierto ahora · cierra en ${hh ? hh + " h " : ""}${mm} min` };
    }
    for (let i = 0; i <= 7; i++) {
      const dd = (d + i) % 7, hr = HORAS[dd];
      if (hr && (i > 0 || h < hr[0])) {
        return { abierto: false, texto: `Cerrado ahora · abrimos ${i === 0 ? "hoy" : i === 1 ? "mañana" : "el " + DN[dd]} a las ${hr[0]}:00` };
      }
    }
    return { abierto: false, texto: "Cerrado ahora" };
  }

  // Horas reservables de una fecha (última mesa 1 h antes de cerrar). motivo: "" | "sinFecha" | "cerrado" | "sinHorarios"
  function slotsDelDia(iso, ya, max) {
    if (!iso || iso < ya.fecha || iso > max) return { slots: [], motivo: "sinFecha" };
    const hr = HORAS[diaDe(iso)];
    if (!hr) return { slots: [], motivo: "cerrado" };
    const slots = [];
    for (let t = hr[0]; t <= hr[1] - 1; t += .5) if (iso !== ya.fecha || t > ya.h + .5) slots.push(fmtH(t));
    return { slots, motivo: slots.length ? "" : "sinHorarios" };
  }

  // Mensaje de error de la fecha ("" si está bien)
  function errorFecha(iso, ya, max, slots) {
    if (!iso) return "Elige la fecha de tu visita.";
    if (iso < ya.fecha) return "Esa fecha ya pasó. Elige hoy o un día futuro.";
    if (iso > max) return "Puedes reservar hasta con 60 días de anticipación.";
    if (!HORAS[diaDe(iso)]) return "Los " + DN[diaDe(iso)] + " estamos cerrados. Elige otro día.";
    if (!slots.length) return "Hoy ya no quedan horarios. Elige otro día.";
    return "";
  }

  const errorNombre = n => (n || "").trim().length < 2 ? "Escribe tu nombre (mínimo 2 letras)." : "";

  function mensajeReserva({ nombre, fecha, hora, personas, nota }) {
    const [y, m, d] = fecha.split("-");
    return ["Hola La Marea,", "Quiero reservar una mesa.", "", `*Nombre:* ${nombre.trim()}`, `*Fecha:* ${DN[diaDe(fecha)]} ${d}/${m}/${y}`, `*Hora:* ${hora}`, `*Personas:* ${personas}`, nota && nota.trim() ? `*Nota:* ${nota.trim()}` : null, "", "_Reserva desde la web_"].filter(x => x !== null).join("\n");
  }

  const mensajePedido = (plato, precio) => `Hola La Marea,\nQuiero pedir:\n*${plato}* (S/ ${precio})\n\n_Pedido desde la web_`;
  const urlWhatsApp = (numero, texto) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

  const L = { HORAS, DN, SEMANA, fmtH, diaDe, dmas, ahoraLima, textoEstado, slotsDelDia, errorFecha, errorNombre, mensajeReserva, mensajePedido, urlWhatsApp };
  if (typeof module !== "undefined" && module.exports) module.exports = L; else g.Marea = L;
})(typeof globalThis !== "undefined" ? globalThis : this);
