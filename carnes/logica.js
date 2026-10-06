/* Brasa Noble: lógica pura (carta, horario, reservas, mensajes de WhatsApp y calendario). Sin DOM, para probarla con node:test. */
(function (g) {
  const NEGOCIO = {
    nombre: "Brasa Noble", wa: "51999999999",
    direccion: "Av. Mariscal La Mar 1480, Miraflores", ciudad: "Lima"
  };

  // Horario por día (0 = domingo). Hora de cierre menor que la de apertura = cierra después de medianoche.
  const HORARIO = { 0: ["12:30", "21:00"], 1: null, 2: ["12:30", "23:00"], 3: ["12:30", "23:00"], 4: ["12:30", "23:00"], 5: ["12:30", "00:30"], 6: ["12:30", "00:30"] };
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  const CATS = [
    { id: "entradas", n: "Entradas", sub: "Para abrir el apetito" },
    { id: "parrilla", n: "A la parrilla", sub: "Cortes madurados sobre carbón de algarrobo" },
    { id: "compartir", n: "Para compartir", sub: "Piezas grandes, mesa grande" },
    { id: "criollo", n: "Criollo de la casa", sub: "Sabores de Lima con mano de parrillero" },
    { id: "guarniciones", n: "Guarniciones", sub: "Lo que acompaña a cada corte" },
    { id: "postres", n: "Postres", sub: "El cierre que se recuerda" },
    { id: "bar", n: "Bar y cava", sub: "Coctelería de autor y vinos por copa" }
  ];

  const MENU = [
    { id: "e1", cat: "entradas", n: "Provoleta a la brasa", d: "Queso provolone fundido, orégano, tomate confitado y pan de campo tostado.", p: 38, veg: true },
    { id: "e2", cat: "entradas", n: "Anticuchos de corazón", d: "Tres palitos marinados en ají panca, papa dorada y salsa de rocoto.", p: 36, picante: true },
    { id: "e3", cat: "entradas", n: "Carpaccio de lomo", d: "Lomo fino laminado, parmesano, rúcula, alcaparras y aceite de oliva.", p: 42 },
    { id: "e4", cat: "entradas", n: "Tartar de lomo", d: "Corte a cuchillo, yema curada, mostaza antigua y crostini de la casa.", p: 46, tag: "Del chef" },

    { id: "p1", cat: "parrilla", n: "Bife de chorizo", gr: "300 g", d: "Corte jugoso con su capa de grasa, sellado a la brasa y reposado antes de servir.", p: 88 },
    { id: "p2", cat: "parrilla", n: "Filete mignon", gr: "250 g", d: "El más tierno de la carta. Corazón de lomo fino con costra de sal y pimienta.", p: 98, tag: "Favorito de la casa" },
    { id: "p3", cat: "parrilla", n: "Ribeye madurado", gr: "400 g", d: "Madurado 30 días en cámara. Veteado intenso, sabor profundo y largo.", p: 128, tag: "Madurado 30 días" },
    { id: "p4", cat: "parrilla", n: "Entraña", gr: "280 g", d: "Corte largo de sabor franco, marinado en chimichurri de la casa.", p: 82 },
    { id: "p5", cat: "parrilla", n: "Asado de tira", gr: "350 g", d: "Costilla cortada fina, cocida lento y terminada sobre la brasa.", p: 76 },

    { id: "s1", cat: "compartir", n: "Tomahawk", gr: "1.2 kg", d: "Chuletón con hueso madurado 45 días. Se trincha en la mesa. Alcanza para 2 o 3.", p: 340, tag: "Para 2 a 3 personas", comp: true },
    { id: "s2", cat: "compartir", n: "Parrillada Noble para dos", d: "Bife de chorizo, entraña, chorizo parrillero, morcilla y provoleta. Con dos guarniciones.", p: 210, comp: true },

    { id: "c1", cat: "criollo", n: "Lomo saltado de la casa", d: "Lomo fino al wok, cebolla, tomate, papas nativas fritas y arroz graneado.", p: 68, tag: "Clásico peruano" },
    { id: "c2", cat: "criollo", n: "Tacu tacu con lomo", d: "Tacu tacu crocante de frijol canario, lomo fino a la brasa y salsa criolla.", p: 72 },

    { id: "g1", cat: "guarniciones", n: "Papas rústicas", d: "Con cáscara, doradas y con sal de Maras.", p: 18, veg: true },
    { id: "g2", cat: "guarniciones", n: "Puré trufado", d: "Papa cremosa con mantequilla y aceite de trufa.", p: 22, veg: true },
    { id: "g3", cat: "guarniciones", n: "Ensalada de rúcula", d: "Rúcula, parmesano, tomates cherry y vinagreta de limón.", p: 20, veg: true },
    { id: "g4", cat: "guarniciones", n: "Brócoli al ajo", d: "Salteado con ajo dorado y escamas de ají.", p: 18, veg: true, picante: true },

    { id: "d1", cat: "postres", n: "Tiramisú de café", d: "Bizcocho de soletilla, mascarpone y café peruano de altura.", p: 28 },
    { id: "d2", cat: "postres", n: "Volcán de chocolate", d: "Chocolate 70 % con centro fundido y helado de vainilla.", p: 30, veg: true },
    { id: "d3", cat: "postres", n: "Suspiro a la limeña", d: "Manjar blanco con merengue de oporto.", p: 24, veg: true },

    { id: "b1", cat: "bar", n: "Pisco sour clásico", d: "Pisco quebranta, limón de Chulucanas, goma y clara. Espuma firme.", p: 28, tag: "El de siempre" },
    { id: "b2", cat: "bar", n: "Chilcano de maracuyá", d: "Pisco, ginger ale, limón y pulpa de maracuyá.", p: 26 },
    { id: "b3", cat: "bar", n: "Old fashioned de la casa", d: "Whisky, bitter de naranja y azúcar quemada al fuego.", p: 38 },
    { id: "b4", cat: "bar", n: "Malbec · copa", d: "Mendoza. Frutos negros, ciruela y especias suaves.", p: 34 },
    { id: "b5", cat: "bar", n: "Cabernet Sauvignon · copa", d: "Valle de Colchagua. Estructura firme, ideal para cortes grasos.", p: 32 },
    { id: "b6", cat: "bar", n: "Malbec Reserva · botella", d: "Botella de 750 ml para acompañar la mesa.", p: 168, comp: true }
  ];

  const fmt = n => "S/ " + Number(n).toFixed(2);
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = t => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const porId = (arr, id) => arr.find(x => x.id === id);

  // Filtra por categoría, texto (nombre, descripción, categoría) y etiquetas (veg, picante, comp)
  function filtrar(menu, { cat = "todas", texto = "", filtros = [] } = {}) {
    const q = norm(texto);
    return menu.filter(i => (cat === "todas" || i.cat === cat) &&
      filtros.every(f => i[f]) &&
      (q === "" || norm(`${i.n} ${i.d} ${porId(CATS, i.cat).n}`).includes(q)));
  }

  // Hora local de Lima como {dia (0-6), min (minutos desde 00:00)}
  function limaAhora(fecha = new Date()) {
    const p = new Intl.DateTimeFormat("en-US", { timeZone: "America/Lima", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(fecha);
    const get = t => p.find(x => x.type === t).value;
    return { dia: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), min: +get("hour") * 60 + +get("minute") };
  }
  const aMin = h => { const [a, b] = h.split(":"); return +a * 60 + +b; };
  // ¿Está abierto ahora? Considera los cierres después de medianoche (viernes y sábado cierran 00:30)
  function estadoLocal(ahora) {
    const hoy = HORARIO[ahora.dia], ayer = HORARIO[(ahora.dia + 6) % 7];
    if (ayer && aMin(ayer[1]) < aMin(ayer[0]) && ahora.min < aMin(ayer[1])) return { abierto: true, cierra: ayer[1], texto: "Abierto ahora · cierra a las " + ayer[1] };
    if (hoy) {
      const a = aMin(hoy[0]), c = aMin(hoy[1]);
      if (ahora.min >= a && (c < a || ahora.min < c)) return { abierto: true, cierra: hoy[1], texto: "Abierto ahora · cierra a las " + hoy[1] };
      if (ahora.min < a) return { abierto: false, abre: hoy[0], texto: "Cerrado · abrimos hoy a las " + hoy[0] };
    }
    for (let i = 1; i <= 7; i++) {
      const d = (ahora.dia + i) % 7;
      if (HORARIO[d]) return { abierto: false, abre: HORARIO[d][0], texto: "Cerrado · abrimos " + (i === 1 ? "mañana" : "el " + DIAS[d]) + " a las " + HORARIO[d][0] };
    }
    return { abierto: false, texto: "Cerrado" };
  }

  // Horas de reserva cada 30 min: desde la apertura hasta 90 min antes del cierre
  function horasReserva(dia) {
    const h = HORARIO[dia];
    if (!h) return [];
    const a = aMin(h[0]);
    let c = aMin(h[1]); if (c < a) c += 1440;
    const out = [];
    for (let m = a; m <= c - 90; m += 30) {
      const mm = m % 1440;
      out.push(String(Math.floor(mm / 60)).padStart(2, "0") + ":" + String(mm % 60).padStart(2, "0"));
    }
    return out;
  }

  const limpiaCel = t => String(t).replace(/[\s\-().]/g, "").replace(/^(\+?51)(?=9\d{8}$)/, "");
  const celularValido = t => /^9\d{8}$/.test(limpiaCel(t));
  const nombreValido = t => String(t).trim().replace(/[^\p{L}]/gu, "").length >= 2;

  function mensajeReserva(r) {
    const L = [`*Reserva de mesa* - ${NEGOCIO.nombre}`, `*Nombre:* ${r.nombre.trim()}`, `*Celular:* ${limpiaCel(r.celular)}`,
      `*Fecha:* ${r.fechaTexto}`, `*Hora:* ${r.hora}`, `*Personas:* ${r.personas}`];
    if (r.ocasion && r.ocasion !== "Ninguna") L.push(`*Ocasión:* ${r.ocasion}`);
    if (r.notas && r.notas.trim()) L.push(`*Notas:* ${r.notas.trim()}`);
    L.push("", "Quedo atento a su confirmación.");
    return L.join("\n");
  }

  const pad = n => String(n).padStart(2, "0");
  // Archivo .ics de la reserva: fecha "YYYY-MM-DD", hora "HH:MM", dura 2 horas, hora de Lima
  function icsReserva({ fecha, hora, personas, nombre }, ahora = new Date()) {
    const [y, m, d] = fecha.split("-").map(Number), [h, mi] = hora.split(":").map(Number);
    const ini = new Date(Date.UTC(y, m - 1, d, h, mi)), fin = new Date(ini.getTime() + 2 * 3600000);
    const f = t => `${t.getUTCFullYear()}${pad(t.getUTCMonth() + 1)}${pad(t.getUTCDate())}T${pad(t.getUTCHours())}${pad(t.getUTCMinutes())}00`;
    const st = `${ahora.getUTCFullYear()}${pad(ahora.getUTCMonth() + 1)}${pad(ahora.getUTCDate())}T${pad(ahora.getUTCHours())}${pad(ahora.getUTCMinutes())}00Z`;
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Brasa Noble//Demo//ES", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      `UID:${f(ini)}-${limpiaCel(String(personas))}@brasanoble.demo`, `DTSTAMP:${st}`,
      `DTSTART;TZID=America/Lima:${f(ini)}`, `DTEND;TZID=America/Lima:${f(fin)}`,
      `SUMMARY:Mesa en ${NEGOCIO.nombre} (${personas} ${personas === 1 ? "persona" : "personas"})`,
      `LOCATION:${NEGOCIO.direccion}`, `DESCRIPTION:Reserva a nombre de ${String(nombre).trim().replace(/[,;\n]/g, " ")}. Se guarda la mesa 15 minutos.`,
      "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  }

  const waUrl = t => `https://wa.me/${NEGOCIO.wa}?text=${encodeURIComponent(t)}`;

  const API = { NEGOCIO, HORARIO, DIAS, CATS, MENU, fmt, esc, norm, porId, filtrar, limaAhora, estadoLocal, horasReserva,
    limpiaCel, celularValido, nombreValido, mensajeReserva, icsReserva, waUrl };
  if (typeof module !== "undefined" && module.exports) module.exports = API; else g.BN = API;
})(typeof window !== "undefined" ? window : globalThis);
