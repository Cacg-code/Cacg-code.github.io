/* Lógica pura de Cabaña Pinar — © Carlo · Dev (demo). Sin DOM, se prueba con node --test. */
(function (g) {
  const NEGOCIO = { nombre: "Cabaña Pinar", wa: "51999999999", yape: "999 888 777", titular: "Rosa M. (demo)",
    checkIn: "15:00", checkOut: "11:00", maxHuespedes: 5, base: 2, minNoches: 2, adelantoPct: 30,
    tarifa: { semana: 180, finde: 240 }, limpieza: 40, extraHuesped: 25 };

  const pad = n => String(n).padStart(2, "0");
  const aDate = s => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const iso = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  const suma = (s, n) => { const d = aDate(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
  const hoyISO = (f = new Date()) => `${f.getFullYear()}-${pad(f.getMonth() + 1)}-${pad(f.getDate())}`;
  const diasEntre = (a, b) => Math.round((aDate(b) - aDate(a)) / 864e5);
  const esFinde = s => { const w = aDate(s).getUTCDay(); return w === 5 || w === 6; };

  // Cada noche de la estancia (la de salida no cuenta)
  function nochesDe(ini, fin) {
    const r = []; for (let d = ini; d < fin; d = suma(d, 1)) r.push(d); return r;
  }
  const tarifaNoche = s => (esFinde(s) ? NEGOCIO.tarifa.finde : NEGOCIO.tarifa.semana);

  function precio({ ini, fin, huespedes = 2 }) {
    const noches = nochesDe(ini, fin), n = noches.length;
    const finde = noches.filter(esFinde).length;
    const hospedaje = noches.reduce((t, d) => t + tarifaNoche(d), 0);
    const extras = Math.max(0, huespedes - NEGOCIO.base);
    const extra = extras * NEGOCIO.extraHuesped * n;
    const limpieza = n ? NEGOCIO.limpieza : 0;
    const total = hospedaje + extra + limpieza;
    const adelanto = Math.round(total * NEGOCIO.adelantoPct / 100);
    return { n, finde, semana: n - finde, hospedaje, extras, extra, limpieza, total, adelanto, saldo: total - adelanto };
  }

  // ocupadas: lista de {ini, fin} (fin = día de salida, esa noche queda libre)
  const nocheOcupada = (d, oc) => oc.some(o => d >= o.ini && d < o.fin);
  const rangoLibre = (ini, fin, oc) => !nochesDe(ini, fin).some(d => nocheOcupada(d, oc));

  function validaRango({ ini, fin, huespedes }, oc, hoy) {
    if (!ini || !fin) return "Elige llegada y salida";
    if (ini < hoy) return "La llegada ya pasó";
    const n = diasEntre(ini, fin);
    if (n < NEGOCIO.minNoches) return `Mínimo ${NEGOCIO.minNoches} noches`;
    if (n > 30) return "Máximo 30 noches";
    if (huespedes < 1 || huespedes > NEGOCIO.maxHuespedes) return `Hasta ${NEGOCIO.maxHuespedes} huéspedes`;
    if (!rangoLibre(ini, fin, oc)) return "Hay noches ocupadas en ese rango";
    return "";
  }

  // Reservas de ejemplo siempre relativas a hoy, para que la demo no caduque
  function ocupadasDemo(hoy) {
    return [[3, 6], [12, 15], [19, 21], [26, 31], [40, 44], [52, 55], [60, 66]]
      .map(([a, b]) => ({ ini: suma(hoy, a), fin: suma(hoy, b) }));
  }

  const limpiaCel = s => String(s || "").replace(/[\s\-().]/g, "").replace(/^\+?51/, "");
  const celularValido = s => /^9\d{8}$/.test(limpiaCel(s));
  const nombreValido = s => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]{3,60}$/.test(String(s || "").trim());

  const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const fmt = s => { const d = aDate(s); return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`; };
  const soles = n => "S/ " + n.toLocaleString("es-PE");

  function mensajeReserva({ nombre, ini, fin, huespedes, medio, op }) {
    const p = precio({ ini, fin, huespedes });
    return [`Hola, soy ${nombre}. Reservé en ${NEGOCIO.nombre}:`,
      `Llegada: ${fmt(ini)} (desde ${NEGOCIO.checkIn})`, `Salida: ${fmt(fin)} (hasta ${NEGOCIO.checkOut})`,
      `${p.n} noches · ${huespedes} huésped${huespedes > 1 ? "es" : ""}`, `Total: ${soles(p.total)}`,
      `Adelanto pagado por ${medio}: ${soles(p.adelanto)}${op ? ` (op. ${op})` : ""}`, `Saldo al llegar: ${soles(p.saldo)}`].join("\n");
  }

  function icsEstancia({ nombre, ini, fin, huespedes }, ahora = new Date()) {
    const d = s => s.replace(/-/g, "");
    const stamp = ahora.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Carlo Dev//Cabana Pinar//ES", "BEGIN:VEVENT",
      `UID:${d(ini)}-${d(fin)}@cabana-pinar.demo`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d(ini)}`, `DTEND;VALUE=DATE:${d(fin)}`,
      `SUMMARY:Estancia en ${NEGOCIO.nombre}`,
      `DESCRIPTION:${nombre} · ${huespedes} huéspedes. Check-in ${NEGOCIO.checkIn}, check-out ${NEGOCIO.checkOut}.`,
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  }

  const waUrl = t => `https://wa.me/${NEGOCIO.wa}?text=${encodeURIComponent(t)}`;

  const API = { NEGOCIO, iso, aDate, suma, hoyISO, diasEntre, esFinde, nochesDe, tarifaNoche, precio, nocheOcupada,
    rangoLibre, validaRango, ocupadasDemo, limpiaCel, celularValido, nombreValido, fmt, soles, mensajeReserva, icsEstancia, waUrl };
  if (typeof module !== "undefined" && module.exports) module.exports = API; else g.CP = API;
})(typeof window !== "undefined" ? window : globalThis);
