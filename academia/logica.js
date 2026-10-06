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
  r.Cat = { clave, lecciones, resumen, nota, puedeCertificar, proxima, codigoCert, validaLogin, nombreDeCorreo, rachaDias, csv, dia };
  if (typeof module !== "undefined") module.exports = r.Cat;
})(typeof window !== "undefined" ? window : globalThis);
