/* Lógica pura de Invita — © Carlo · Dev (demo). Sin DOM, se prueba con node --test. */
(function (g) {
  const EVENTOS = {
    boda: {
      tipo: "boda", clase: "t-boda", marca: "Valeria & Diego", titulo: "Valeria <em>&</em> Diego", frase: "Nos casamos y queremos que estés ahí.",
      fecha: "2027-02-13T17:00", fin: "2027-02-14T02:00", lugar: "Hacienda Los Olivos", dir: "Km 9 Carretera a Chancay, Huaral", mapa: "Hacienda Los Olivos Huaral",
      vestimenta: "Formal de tarde", paleta: ["#C9A27E", "#F3E6D8", "#6E7F5E", "#3A2E2A"], paletaNota: "Evita el blanco y el verde muy intenso.",
      cronograma: [["17:00", "Ceremonia", "En el jardín de los olivos"], ["18:00", "Cóctel y fotos", "Pisco sour y piqueos"], ["19:30", "Cena", "Plato de fondo a elegir"], ["21:00", "Vals y baile", "La pista se abre"], ["01:00", "Hora loca", "Hasta que se acabe la energía"]],
      menus: ["Lomo en salsa de vino", "Trucha al limón", "Vegetariano"], pregunta: "¿Qué canción no puede faltar?",
      regalo: "Tu presencia es lo más importante. Si deseas obsequiarnos algo, nos ayudas con nuestra luna de miel.", yape: "999 888 777", titular: "Valeria R. (demo)",
      anfitrion: "Valeria y Diego", wa: "51999999999", cierre: "Confirma antes del 10 de enero", limite: "2027-01-10"
    },
    cumple: {
      tipo: "cumple", clase: "t-cumple", marca: "Los 30 de Sofi", titulo: "Sofi cumple <em>30</em>", frase: "Una noche de música, tragos y mucho baile.",
      fecha: "2026-12-05T20:00", fin: "2026-12-06T03:00", lugar: "Terraza Mirador 360", dir: "Av. Larco 1250, piso 14, Miraflores", mapa: "Av. Larco 1250 Miraflores",
      vestimenta: "Brillos y color", paleta: ["#FF4F9A", "#FFC83D", "#7B4DFF", "#13111F"], paletaNota: "Cuanto más brillo, mejor.",
      cronograma: [["20:00", "Recepción", "Primer trago de bienvenida"], ["21:00", "Brindis", "Palabras y torta"], ["22:00", "DJ en vivo", "Reggaetón, salsa y pop"], ["00:00", "Show sorpresa", "No contamos más"], ["03:00", "Fin", "Taxi seguro para todos"]],
      menus: ["Piqueo clásico", "Piqueo vegetariano", "Sin comida, solo tragos"], pregunta: "¿Qué canción te hace bailar sí o sí?",
      regalo: "¿Quieres regalarme algo? Estoy juntando para un viaje a Cusco.", yape: "987 654 321", titular: "Sofía T. (demo)",
      anfitrion: "Sofi", wa: "51999999999", cierre: "Confirma antes del 25 de noviembre", limite: "2026-11-25"
    },
    despedida: {
      tipo: "despedida", clase: "t-desp", marca: "Despedida de Andrés", titulo: "La <em>última</em> noche de Andrés", frase: "Sin esposas, sin reglas y con muchas anécdotas.",
      fecha: "2026-11-14T16:00", fin: "2026-11-15T05:00", lugar: "Casa de campo El Rincón", dir: "Cieneguilla, Lima", mapa: "Cieneguilla Lima",
      vestimenta: "Polo negro del equipo", paleta: ["#F2542D", "#F5DFBB", "#0E9594", "#127475"], paletaNota: "Te damos el polo oficial al llegar.",
      cronograma: [["16:00", "Llegada", "Piscina y parrilla"], ["19:00", "Parrillada", "Carnes, chelas y juegos"], ["22:00", "Retos", "Los del novio, claro"], ["00:00", "Karaoke", "Sin vergüenza"], ["05:00", "Retorno", "Movilidad incluida"]],
      menus: ["Parrilla completa", "Vegetariano"], pregunta: "Cuéntanos una anécdota que Andrés no quiere que se sepa",
      regalo: "Cuota de la despedida: S/ 120 por persona (movilidad, comida y trago).", yape: "955 444 333", titular: "Marco P. (demo)",
      anfitrion: "Marco", wa: "51999999999", cierre: "Cierra la lista el 7 de noviembre", limite: "2026-11-07"
    }
  };

  const INVITADOS = {
    boda: [["fam-rojas", "Familia Rojas", 4], ["tia-lucia", "Tía Lucía", 2], ["carlos-m", "Carlos Mendoza", 2], ["ana-paz", "Ana Paz", 1], ["equipo-bell", "Equipo de la oficina", 6]],
    cumple: [["lu-vega", "Lucía Vega", 2], ["los-primos", "Los primos", 5], ["jorge-r", "Jorge Ramos", 1], ["maru", "Maru y Piero", 2]],
    despedida: [["tito", "Tito", 1], ["el-flaco", "El Flaco", 2], ["panchito", "Panchito", 1], ["los-del-barrio", "Los del barrio", 4]]
  };

  const pad = n => String(n).padStart(2, "0");
  const slug = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function cuenta(destino, ahora = new Date()) {
    const ms = new Date(destino) - ahora;
    if (ms <= 0) return { pasado: true, d: 0, h: 0, m: 0, s: 0 };
    const t = Math.floor(ms / 1000);
    return { pasado: false, d: Math.floor(t / 86400), h: Math.floor(t % 86400 / 3600), m: Math.floor(t % 3600 / 60), s: t % 60 };
  }

  const celularValido = c => /^9\d{8}$/.test(String(c).replace(/\D/g, ""));
  const limpiaCel = c => String(c).replace(/\D/g, "").slice(-9);

  function validaRsvp(d, pases) {
    const e = {};
    if (!d.nombre || d.nombre.trim().length < 3) e.nombre = "Escribe tu nombre.";
    if (d.asiste !== "si" && d.asiste !== "no") e.asiste = "Cuéntanos si vienes.";
    if (d.asiste === "si") {
      const n = Number(d.personas);
      if (!Number.isInteger(n) || n < 1 || n > pases) e.personas = `Tu invitación es para ${pases} ${pases === 1 ? "persona" : "personas"}.`;
    }
    if (d.cel && !celularValido(d.cel)) e.cel = "Celular de 9 dígitos que empiece con 9.";
    return e;
  }

  const fechaLarga = iso => new Date(iso).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hora = iso => { const d = new Date(iso); const h = d.getHours(); return `${h % 12 || 12}:${pad(d.getMinutes())} ${h < 12 ? "a. m." : "p. m."}`; };

  const icsFecha = iso => iso.replace(/[-:]/g, "").padEnd(15, "0").slice(0, 15);
  const icsTxt = s => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  function ics(ev, ahora = new Date()) {
    const st = `${ahora.getUTCFullYear()}${pad(ahora.getUTCMonth() + 1)}${pad(ahora.getUTCDate())}T${pad(ahora.getUTCHours())}${pad(ahora.getUTCMinutes())}${pad(ahora.getUTCSeconds())}Z`;
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Carlo Dev//Invita//ES", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      `UID:${ev.tipo}-${icsFecha(ev.fecha)}@carlo-dev`, `DTSTAMP:${st}`, `DTSTART:${icsFecha(ev.fecha)}`, `DTEND:${icsFecha(ev.fin)}`,
      `SUMMARY:${icsTxt(ev.marca)}`, `LOCATION:${icsTxt(ev.lugar + ", " + ev.dir)}`, `DESCRIPTION:${icsTxt(ev.frase + " Vestimenta: " + ev.vestimenta)}`,
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Mañana es el evento", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  }

  const csvCelda = s => { let t = String(s == null ? "" : s); if (/^[=+\-@]/.test(t)) t = "'" + t; return `"${t.replace(/"/g, '""')}"`; };
  function csv(resps) {
    const cab = ["Invitación", "Nombre", "Asiste", "Personas", "Menú", "Alergias", "Celular", "Respuesta", "Mensaje"];
    return "\ufeff" + [cab, ...resps.map(r => [r.inv, r.nombre, r.asiste === "si" ? "Sí" : "No", r.asiste === "si" ? r.personas : 0, r.menu, r.alergias, r.cel, r.extra, r.mensaje])]
      .map(f => f.map(csvCelda).join(",")).join("\r\n");
  }

  function resumen(invitados, resps) {
    const por = {}; resps.forEach(r => { por[r.inv] = r; });
    const total = invitados.reduce((t, i) => t + i.pases, 0);
    const si = resps.filter(r => r.asiste === "si"), no = resps.filter(r => r.asiste === "no");
    const conf = si.reduce((t, r) => t + Number(r.personas), 0);
    const pend = invitados.filter(i => !por[i.id]);
    const menus = {}; si.forEach(r => { if (r.menu) menus[r.menu] = (menus[r.menu] || 0) + Number(r.personas); });
    return { total, conf, si: si.length, no: no.length, pend: pend.length, pendPases: pend.reduce((t, i) => t + i.pases, 0), menus };
  }

  const waInvitacion = (ev, nombre, url) => `Hola ${nombre} 👋 ${ev.anfitrion} te invita: *${ev.marca}*. ${fechaLarga(ev.fecha)}, ${hora(ev.fecha)}. Confirma tu asistencia aquí: ${url}`;
  const waAnfitrion = (ev, r) => `https://wa.me/${ev.wa}?text=${encodeURIComponent(r.asiste === "si" ? `Hola, soy ${r.nombre}. Confirmo mi asistencia (${r.personas} ${Number(r.personas) === 1 ? "persona" : "personas"}) a ${ev.marca} 🎉` : `Hola, soy ${r.nombre}. Lamentablemente no podré asistir a ${ev.marca}. ¡Que lo disfruten!`)}`;

  const SEMILLA = {
    boda: [{ inv: "fam-rojas", nombre: "Familia Rojas", asiste: "si", personas: 3, menu: "Lomo en salsa de vino", alergias: "", cel: "", extra: "Vivir para siempre - Alberto Cortez", mensaje: "¡Qué felicidad verlos tan contentos! Ahí estaremos con todo el cariño." },
      { inv: "ana-paz", nombre: "Ana Paz", asiste: "no", personas: 0, menu: "", alergias: "", cel: "", extra: "", mensaje: "Estaré de viaje, pero los abrazo fuerte. Que sea hermoso." }],
    cumple: [{ inv: "lu-vega", nombre: "Lucía Vega", asiste: "si", personas: 2, menu: "Piqueo clásico", alergias: "", cel: "", extra: "Danza Kuduro", mensaje: "¡Feliz cumple adelantado, Sofi! Preparen la pista." }],
    despedida: [{ inv: "tito", nombre: "Tito", asiste: "si", personas: 1, menu: "Parrilla completa", alergias: "", cel: "", extra: "Cuando Andrés rompió el sofá de su suegra", mensaje: "Yo llevo los parlantes." }]
  };

  const API = { SEMILLA, EVENTOS, INVITADOS, slug, esc, cuenta, celularValido, limpiaCel, validaRsvp, fechaLarga, hora, ics, csv, resumen, waInvitacion, waAnfitrion };
  if (typeof module !== "undefined" && module.exports) module.exports = API; else g.EV = API;
})(typeof window !== "undefined" ? window : globalThis);
