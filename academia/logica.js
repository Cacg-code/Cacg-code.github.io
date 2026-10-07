/* Cátedra — lógica pura (probada con node --test). © Carlo · Dev */
(function (r) {
  const clave = (c, m, l) => c + ":" + m + ":" + l;
  const lecciones = c => c.mods.flatMap((m, i) => m.l.map((l, j) => ({ ...l, mod: i, idx: j, key: clave(c.id, i, j) })));
  const hecha = (prog, l) => !!(prog && prog.l && prog.l[l.key]);
  const resumen = (c, prog) => {
    const ls = lecciones(c), hs = ls.filter(l => hecha(prog, l));
    return { total: ls.length, hechas: hs.length, pct: ls.length ? Math.round(hs.length / ls.length * 100) : 0, minutos: ls.reduce((s, l) => s + l.m, 0), minHechos: hs.reduce((s, l) => s + l.m, 0) };
  };
  const nota = (resp, examen) => {
    const ok = examen.reduce((s, p, i) => s + (resp[i] === p.c ? 1 : 0), 0), n = Math.round(ok / examen.length * 20);
    return { ok, total: examen.length, nota: n, aprobado: n >= 11 };
  };
  const puedeCertificar = (c, prog) => resumen(c, prog).pct === 100 && !!prog && prog.n != null && prog.n >= 11;
  const proxima = (c, prog) => lecciones(c).find(l => !hecha(prog, l)) || null;
  const codigoCert = (email, cursoId, fecha) => {
    let h = 5381; const s = email.toLowerCase() + "|" + cursoId + "|" + fecha;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return "CAT-" + cursoId.slice(0, 3).toUpperCase() + "-" + h.toString(36).toUpperCase().padStart(7, "0").slice(-7);
  };
  const validaLogin = d => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((d.email || "").trim())) e.email = "Escribe un correo válido.";
    if (!/^\d{6,10}$/.test((d.codigo || "").trim())) e.codigo = "El código de matrícula tiene 6 a 10 dígitos.";
    if (!d.uni) e.uni = "Elige tu universidad.";
    return e;
  };
  const nombreDeCorreo = em => em.split("@")[0].replace(/[._\d-]+/g, " ").trim().split(" ").filter(Boolean).map(p => p[0].toUpperCase() + p.slice(1)).join(" ") || "Estudiante";
  const dia = d => { const z = n => String(n).padStart(2, "0"); return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()); };
  const rachaDias = fechas => {
    const set = new Set(fechas); let n = 0; const d = new Date();
    if (!set.has(dia(d))) d.setDate(d.getDate() - 1);
    while (set.has(dia(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  };
  const csv = filas => filas.map(f => f.map(x => '"' + String(x).replace(/"/g, '""') + '"').join(",")).join("\n");
  const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const lunes = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  const heatmap = (fechas, semanas = 5, hoy = new Date()) => {
    const set = new Set(fechas), ini = lunes(hoy); ini.setDate(ini.getDate() - 7 * (semanas - 1)); const out = [];
    for (let i = 0; i < semanas * 7; i++) { const d = new Date(ini); d.setDate(ini.getDate() + i); out.push({ f: dia(d), on: set.has(dia(d)), futuro: d > hoy }); }
    return out;
  };
  const diasSemana = (fechas, hoy = new Date()) => { const ini = lunes(hoy), set = new Set(fechas); let n = 0; for (let i = 0; i < 7; i++) { const d = new Date(ini); d.setDate(ini.getDate() + i); if (set.has(dia(d))) n++; } return n; };
  const insignias = x => [
    { id: "primera", nombre: "Primer paso", ico: "🌱", desc: "Ve tu primera lección", ok: x.hechas >= 1 },
    { id: "diez", nombre: "En marcha", ico: "🚀", desc: "Completa 10 lecciones", ok: x.hechas >= 10 },
    { id: "racha3", nombre: "Constante", ico: "🔥", desc: "3 días seguidos", ok: x.racha >= 3 },
    { id: "meta", nombre: "Meta cumplida", ico: "🎯", desc: "Cumple tu meta semanal", ok: x.metaOk },
    { id: "cert", nombre: "Certificado", ico: "🎓", desc: "Obtén tu primer certificado", ok: x.certs >= 1 },
    { id: "perfecto", nombre: "Examen perfecto", ico: "💯", desc: "Saca 20 en un examen", ok: x.maxNota === 20 }
  ];
  const ics = (hora, hoy = new Date()) => {
    const [h, m] = hora.split(":"), z = n => String(n).padStart(2, "0"), d = dia(hoy).replace(/-/g, "");
    const fin = z(+h + Math.floor((+m + 30) / 60)) + z((+m + 30) % 60);
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Catedra//ES", "BEGIN:VEVENT", "UID:estudio-" + d + h + m + "@catedra", "DTSTAMP:" + d + "T000000Z", "DTSTART:" + d + "T" + z(h) + z(m) + "00", "DTEND:" + d + "T" + fin + "00", "RRULE:FREQ=DAILY;COUNT=60", "SUMMARY:Estudiar 20 minutos en Cátedra", "DESCRIPTION:Tu racha te espera. Entra y mira una lección.", "BEGIN:VALARM", "TRIGGER:-PT5M", "ACTION:DISPLAY", "DESCRIPTION:Hora de estudiar", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  };
  const recomienda = r => {
    const mapa = { numeros: "calculo", datos: "estadistica", codigo: "python", negocio: "contabilidad", oficina: "excel", escribir: "tesis" };
    return mapa[r.interes] || "excel";
  };
  const busca = (cursos, q) => { const n = norm(q).trim(); if (n.length < 2) return []; return cursos.flatMap(c => lecciones(c).filter(l => norm(l.t + " " + l.p.join(" ") + " " + c.nombre).includes(n)).map(l => ({ c, l }))).slice(0, 12); };
  const xp = x => x.hechas * 10 + x.certs * 100 + x.aprobados * 40 + Math.min(x.racha, 30) * 5;
  const NIVELES = ["Aspirante", "Aprendiz", "Estudiante", "Avanzado", "Destacado", "Maestro"];
  const nivel = v => { const n = Math.min(NIVELES.length - 1, Math.floor(Math.sqrt(v / 25))), ini = n * n * 25, fin = (n + 1) * (n + 1) * 25; return { n: n + 1, nombre: NIVELES[n], ini, fin, pct: n === NIVELES.length - 1 ? 100 : Math.round((v - ini) / (fin - ini) * 100) }; };
  const ranking = (rivales, yo) => [...rivales, yo].sort((a, b) => b.xp - a.xp).map((x, i) => ({ ...x, pos: i + 1 }));
  const rutaProgreso = (ruta, cursos, todo) => { const cs = ruta.cursos.map(id => cursos.find(c => c.id === id)); const hechos = cs.filter(c => puedeCertificar(c, todo[c.id])).length; const pct = Math.round(cs.reduce((s, c) => s + resumen(c, todo[c.id]).pct, 0) / cs.length); return { hechos, total: cs.length, pct, completa: hechos === cs.length, sig: cs.find(c => !puedeCertificar(c, todo[c.id])) || null }; };
  r.Cat = { rutaProgreso, xp, nivel, ranking, clave, lecciones, resumen, nota, puedeCertificar, proxima, codigoCert, validaLogin, nombreDeCorreo, rachaDias, csv, dia, heatmap, diasSemana, insignias, ics, recomienda, busca, norm };
  if (typeof module !== "undefined") module.exports = r.Cat;
})(typeof window !== "undefined" ? window : globalThis);
