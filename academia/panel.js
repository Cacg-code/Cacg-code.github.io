/* Cátedra — panel de coordinación. © Carlo · Dev */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const { CURSOS, UNIS } = DATOS, C = Cat, S = Store;
  const toast = t => { const e = $("#toast"); e.textContent = t; e.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("on"), 2600); };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  /* alumnos de ejemplo, deterministas */
  const NOM = ["María Condori", "Jorge Huamán", "Lucía Ramos", "Piero Salazar", "Ana Quispe", "Diego Flores", "Valeria Mendoza", "Luis Paredes", "Camila Rojas", "Renzo Vargas", "Daniela Torres", "Mateo Cruz", "Sofía Castillo", "Bruno Medina", "Fabiola Ríos", "Kevin Lazo", "Jimena Acosta", "Álvaro Peña"];
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const hoy = new Date(), dias = n => { const d = new Date(hoy); d.setDate(d.getDate() - n); return d; };
  const alumnos = NOM.map((n, i) => {
    const c = CURSOS[Math.floor(rnd() * CURSOS.length)], tipo = rnd(), pct = tipo < .2 ? Math.round(rnd() * 25) : tipo < .75 ? 30 + Math.round(rnd() * 60) : 100;
    const ult = pct === 100 ? Math.floor(rnd() * 6) : (tipo < .2 ? 8 + Math.floor(rnd() * 12) : Math.floor(rnd() * 5));
    return { id: i, nombre: n, codigo: "2024" + String(1000 + i * 37).padStart(4, "0"), uni: UNIS[i % UNIS.length], curso: c.id, pct, nota: pct === 100 ? 12 + Math.floor(rnd() * 8) : null, ult: dias(ult), real: false };
  });
  const u = S.usuario();
  if (u) CURSOS.forEach(c => { const p = S.prog(u.email, c.id), r = C.resumen(c, p); if (S.inscritos(u.email).includes(c.id)) { const d = S.dias(u.email), ult = d.length ? new Date(d[d.length - 1] + "T12:00") : hoy; alumnos.unshift({ id: "yo-" + c.id, nombre: u.nombre + " (Tú)", codigo: u.codigo, uni: u.uni, curso: c.id, pct: r.pct, nota: p.n, ult, real: true }); } });
  const unis = ["Todas las universidades", ...UNIS], fU = $("#uni"), fC = $("#cur");
  fU.innerHTML = unis.map(x => `<option>${x}</option>`).join(""); fC.innerHTML = `<option value="">Todos los cursos</option>` + CURSOS.map(c => `<option value="${c.id}">${c.nombre}</option>`).join("");
  const antes = d => Math.floor((hoy - d) / 864e5);
  const estado = a => a.pct === 100 && a.nota >= 11 ? ["etq ok", "Certificado"] : antes(a.ult) >= 7 && a.pct < 100 ? ["etq rj", "En riesgo"] : a.pct >= 60 ? ["etq ok", "Buen ritmo"] : ["etq al", "Avanzando"];
  const vista = () => alumnos.filter(a => (fU.value === unis[0] || a.uni === fU.value) && (!fC.value || a.curso === fC.value) && (!$("#bus").value || (a.nombre + a.codigo).toLowerCase().includes($("#bus").value.toLowerCase()))).sort((x, y) => (estado(y)[1] === "En riesgo") - (estado(x)[1] === "En riesgo") || y.pct - x.pct);
  const cuenta = (e, n, dec) => { const t0 = performance.now(), f = t => { const k = Math.min(1, (t - t0) / 900), v = n * (1 - Math.pow(1 - k, 3)); e.textContent = dec ? v.toFixed(1).replace(".", ",") : Math.round(v); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };
  const pinta = () => {
    const v = vista(), prom = v.length ? Math.round(v.reduce((s, a) => s + a.pct, 0) / v.length) : 0, cert = v.filter(a => a.pct === 100 && a.nota >= 11).length, riesgo = v.filter(a => estado(a)[1] === "En riesgo").length;
    const nots = v.filter(a => a.nota != null), np = nots.length ? nots.reduce((s, a) => s + a.nota, 0) / nots.length : 0;
    $("#kpis").innerHTML = `<div class="kpi"><b data-c="${v.length}">0</b><span>inscripciones</span></div><div class="kpi"><b><span data-c="${prom}">0</span> %</b><span>avance promedio</span></div><div class="kpi"><b data-c="${cert}">0</b><span>certificados emitidos</span></div><div class="kpi"><b data-c="${riesgo}" style="color:${riesgo ? "var(--mal)" : "inherit"}">0</b><span>en riesgo (7+ días sin entrar)</span></div>`;
    document.querySelectorAll("[data-c]").forEach(e => cuenta(e, +e.dataset.c));
    $("#barras").innerHTML = CURSOS.map(c => { const g = v.filter(a => a.curso === c.id), p = g.length ? Math.round(g.reduce((s, a) => s + a.pct, 0) / g.length) : 0; return `<div class="fila"><span>${c.nombre}</span><div class="barra"><i style="--w:0%" data-w="${p}%"></i></div><b>${g.length ? p + " %" : "—"}</b></div>`; }).join("");
    setTimeout(() => document.querySelectorAll("#barras i").forEach(i => i.style.setProperty("--w", i.dataset.w)), 40);
    $("#filas").innerHTML = v.map(a => { const [cl, tx] = estado(a), c = S.cursoPorId(a.curso), d = antes(a.ult); return `<tr><td data-l="Alumno"><b>${esc(a.nombre)}</b></td><td data-l="Código">${a.codigo}</td><td data-l="Curso">${c.nombre}</td><td data-l="Avance" style="min-width:130px"><div style="display:flex;align-items:center;gap:8px"><div class="barra"><i style="--w:${a.pct}%"></i></div><small>${a.pct} %</small></div></td><td data-l="Nota">${a.nota != null ? a.nota : "—"}</td><td data-l="Última vez">${d <= 0 ? "Hoy" : d === 1 ? "Ayer" : "hace " + d + " días"}</td><td data-l="Estado"><span class="${cl}">${tx}</span></td><td>${tx === "En riesgo" ? `<button class="btn chico lin" data-wa="${a.id}">Recordar</button>` : ""}</td></tr>`; }).join("") || `<tr><td colspan="8" class="vacio">Sin resultados.</td></tr>`;
  };
  ["change", "input"].forEach(ev => [fU, fC, $("#bus")].forEach(e => e.addEventListener(ev, pinta)));
  $("#filas").addEventListener("click", e => {
    const b = e.target.closest("[data-wa]"); if (!b) return; const a = alumnos.find(x => String(x.id) === b.dataset.wa), c = S.cursoPorId(a.curso);
    open("https://wa.me/?text=" + encodeURIComponent(`Hola ${a.nombre.split(" ")[0]}, te extrañamos en Cátedra. Llevas ${antes(a.ult)} días sin entrar a «${c.nombre}» y vas en ${a.pct} %. ¡Retoma hoy 15 minutos y sigue avanzando!`), "_blank", "noopener");
  });
  $("#csv").onclick = () => {
    const f = [["Alumno", "Código", "Universidad", "Curso", "Avance %", "Nota", "Última actividad"], ...vista().map(a => [a.nombre, a.codigo, a.uni, S.cursoPorId(a.curso).nombre, a.pct, a.nota == null ? "" : a.nota, C.dia(a.ult)])];
    const l = document.createElement("a"); l.href = URL.createObjectURL(new Blob(["﻿" + C.csv(f)], { type: "text/csv;charset=utf-8" })); l.download = "catedra-avance.csv"; l.click(); toast("CSV descargado");
  };
  pinta();
})();
