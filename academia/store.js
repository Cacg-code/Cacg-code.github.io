/* Cátedra — sesión y avance en localStorage (demo sin servidor). © Carlo · Dev */
(function (r) {
  const { CURSOS } = r.DATOS, C = r.Cat;
  const rd = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const S = {
    usuario: () => rd("ac_user", null),
    entrar(u) { wr("ac_user", u); if (!rd("ac_ins_" + u.email, null)) wr("ac_ins_" + u.email, ["excel"]); },
    salir() { try { localStorage.removeItem("ac_user"); } catch (e) {} },
    inscritos: em => rd("ac_ins_" + em, []),
    inscribir(em, id) { const l = S.inscritos(em); if (!l.includes(id)) { l.push(id); wr("ac_ins_" + em, l); } },
    todo: em => rd("ac_p_" + em, {}),
    prog: (em, id) => S.todo(em)[id] || { l: {}, n: null },
    guarda(em, id, p) { const t = S.todo(em); t[id] = p; wr("ac_p_" + em, t); },
    marca(em, id, key) { const p = S.prog(em, id); p.l[key] = 1; S.guarda(em, id, p); S.dia(em); },
    dias: em => rd("ac_d_" + em, []),
    dia(em) { const d = S.dias(em), h = C.dia(new Date()); if (!d.includes(h)) { d.push(h); wr("ac_d_" + em, d); } },
    nota(em, id, n) { const p = S.prog(em, id); p.n = Math.max(p.n == null ? 0 : p.n, n); if (C.puedeCertificar(CURSOS.find(c => c.id === id), p) && !p.f) p.f = C.dia(new Date()); S.guarda(em, id, p); S.dia(em); },
    apunte: (em, key) => rd("ac_a_" + em + "_" + key, ""),
    guardaApunte: (em, key, t) => wr("ac_a_" + em + "_" + key, t),
    certificados(em) { const t = S.todo(em); return CURSOS.filter(c => t[c.id] && t[c.id].f && C.puedeCertificar(c, t[c.id])).map(c => ({ curso: c, f: t[c.id].f, n: t[c.id].n })); },
    reinicia(em) { Object.keys(localStorage).filter(k => k.startsWith("ac_") && k.includes(em)).forEach(k => localStorage.removeItem(k)); },
    cursoPorId: id => CURSOS.find(c => c.id === id)
  };
  r.Store = S;
})(window);
