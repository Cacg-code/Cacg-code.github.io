/* Atelier Norte — demo de presencia y marca. © Carlo · Dev */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const WA = "51900000000";
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const toast = t => { const e = $("#toast"); e.textContent = t; e.classList.add("on"); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove("on"), 2200); };
  const wa = txt => window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(txt), "_blank", "noopener");

  /* ---------- arte SVG generado ---------- */
  const PAL = [["#C8553D", "#F2C9A8", "#1B1714"], ["#5B6B4A", "#E4E0C2", "#2A3322"], ["#2F5D8A", "#BFD8EA", "#142536"], ["#8B5A7B", "#EBD3E4", "#32202D"], ["#D9A441", "#FBEBC4", "#3B2C0B"], ["#1B1714", "#E8DCC9", "#C8553D"]];
  function arte(i, kind) {
    const [a, b, c] = PAL[i % PAL.length]; const id = "g" + i + kind;
    let f = "";
    if (kind === "retrato") f = `<circle cx="50" cy="38" r="15" fill="${c}" opacity=".85"/><path d="M18 100c2-26 16-36 32-36s30 10 32 36z" fill="${c}" opacity=".85"/><circle cx="76" cy="22" r="9" fill="${a}"/>`;
    else if (kind === "producto") f = `<rect x="34" y="30" width="32" height="50" rx="8" fill="${c}" opacity=".9"/><rect x="42" y="20" width="16" height="14" rx="3" fill="${a}"/><ellipse cx="50" cy="84" rx="30" ry="5" fill="#000" opacity=".18"/><circle cx="50" cy="55" r="8" fill="${b}"/>`;
    else if (kind === "marca") f = `<circle cx="50" cy="50" r="26" fill="none" stroke="${c}" stroke-width="5"/><path d="M36 58l14-24 14 24z" fill="${a}"/><circle cx="50" cy="50" r="5" fill="${c}"/>`;
    else if (kind === "evento") f = `<circle cx="28" cy="34" r="6" fill="${a}"/><circle cx="62" cy="26" r="9" fill="${c}" opacity=".8"/><circle cx="78" cy="56" r="5" fill="${a}"/><path d="M10 84c18-24 34-24 48-6s24 14 32 2v26H10z" fill="${c}" opacity=".85"/>`;
    else f = `<rect x="22" y="36" width="56" height="40" rx="6" fill="${c}" opacity=".88"/><circle cx="50" cy="56" r="13" fill="${b}"/><circle cx="50" cy="56" r="7" fill="${a}"/><rect x="38" y="30" width="24" height="9" rx="3" fill="${a}"/>`;
    return `<svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs><rect width="100" height="125" fill="url(#${id})"/><g transform="translate(0,12)">${f}</g></svg>`;
  }

  /* ---------- hero ---------- */
  $("#pila").innerHTML = [["retrato", 0, "Café Aurora"], ["producto", 1, "Taller Madera"], ["marca", 4, "Dulce Vida"]].map(([k, i, t]) => `<div class="pol">${arte(i, k)}<span>${t}</span></div>`).join("");
  const pal = ["ve", "siente", "recuerda", "reconoce"]; let pi = 0;
  setInterval(() => { const e = $("#pal"); e.style.opacity = 0; setTimeout(() => { pi = (pi + 1) % pal.length; e.textContent = pal[pi]; e.style.opacity = 1; }, 300); }, 2600);
  $("#pal").style.transition = "opacity .3s";
  const frases = ["Fotografía de producto", "Identidad visual", "Retratos de equipo", "Contenido para redes", "Manual de marca", "Link en bio", "Cobertura de eventos"];
  $("#cinta").innerHTML = [...frases, ...frases].map(t => `<span>${t}</span>`).join("");

  /* ---------- portafolio ---------- */
  const OBRAS = [
    { t: "Café Aurora", c: "Marca", k: "marca", i: 0, h: 1 }, { t: "Retrato de chef", c: "Retratos", k: "retrato", i: 1, h: 1.25 },
    { t: "Velas Lumbre", c: "Producto", k: "producto", i: 4, h: 1 }, { t: "Boda en Barranco", c: "Eventos", k: "evento", i: 2, h: 1.2 },
    { t: "Dulce Vida", c: "Marca", k: "marca", i: 3, h: 1.1 }, { t: "Equipo Equilibra", c: "Retratos", k: "retrato", i: 5, h: 1 },
    { t: "Cerámica Sol", c: "Producto", k: "producto", i: 0, h: 1.2 }, { t: "Feria de diseño", c: "Eventos", k: "evento", i: 1, h: 1 },
    { t: "Hierro & Madera", c: "Marca", k: "marca", i: 5, h: 1.15 }, { t: "Lookbook otoño", c: "Producto", k: "producto", i: 3, h: 1 }
  ];
  const CATS = ["Todo", "Marca", "Retratos", "Producto", "Eventos"]; let cat = "Todo", vis = [], cur = 0;
  $("#filtro").innerHTML = CATS.map((c, n) => `<button class="${n ? "" : "on"}" data-c="${c}">${c}</button>`).join("");
  function pintaGal() {
    vis = OBRAS.filter(o => cat === "Todo" || o.c === cat);
    $("#galeria").innerHTML = vis.map((o, n) => `<button class="obra" style="animation-delay:${n * 60}ms" data-n="${n}" aria-label="Ver ${esc(o.t)}">${arte(o.i, o.k)}<span class="cap"><b>${esc(o.t)}</b><br><small>${o.c}</small></span></button>`).join("");
  }
  $("#filtro").onclick = e => { const b = e.target.closest("button"); if (!b) return; cat = b.dataset.c; $$("#filtro button").forEach(x => x.classList.toggle("on", x === b)); pintaGal(); };
  $("#galeria").onclick = e => { const b = e.target.closest(".obra"); if (b) abre(+b.dataset.n); };
  pintaGal();
  const lb = $("#lb");
  function abre(n) { cur = (n + vis.length) % vis.length; const o = vis[cur]; $("#lbi").innerHTML = arte(o.i, o.k); $("#lbc").innerHTML = `<b>${esc(o.t)}</b><small>${o.c} · ${cur + 1} de ${vis.length}</small>`; lb.classList.add("on"); document.body.style.overflow = "hidden"; $(".x", lb).focus(); }
  function cierra() { lb.classList.remove("on"); document.body.style.overflow = ""; }
  $(".x", lb).onclick = cierra; $(".p", lb).onclick = () => abre(cur - 1); $(".n", lb).onclick = () => abre(cur + 1);
  lb.onclick = e => { if (e.target === lb) cierra(); };
  document.addEventListener("keydown", e => { if (!lb.classList.contains("on")) return; if (e.key === "Escape") cierra(); if (e.key === "ArrowLeft") abre(cur - 1); if (e.key === "ArrowRight") abre(cur + 1); });

  /* ---------- paquetes ---------- */
  $$("[data-p]").forEach(b => b.onclick = () => { wa(`Hola Atelier Norte, me interesa el paquete "${b.dataset.p}". ¿Tienen fecha disponible?`); toast("Abriendo WhatsApp…"); });

  /* ---------- generador de marca ---------- */
  const COL = [["#C8553D", "#F2C9A8", "#1B1714"], ["#5B6B4A", "#E4E0C2", "#2A3322"], ["#2F5D8A", "#BFD8EA", "#142536"], ["#8B5A7B", "#EBD3E4", "#32202D"], ["#D9A441", "#FBEBC4", "#3B2C0B"]];
  const FUE = [["Elegante", "Georgia,'Fraunces',serif"], ["Moderna", "'Plus Jakarta Sans',system-ui,sans-serif"], ["Cursiva", "'Brush Script MT',cursive"]];
  let gc = 0, gf = 0;
  $("#sw").innerHTML = COL.map((c, n) => `<button class="${n ? "" : "on"}" style="background:${c[0]}" data-n="${n}" aria-label="Color ${n + 1}"></button>`).join("");
  $("#fnt").innerHTML = FUE.map((f, n) => `<button class="${n ? "" : "on"}" style="font-family:${f[1]}" data-n="${n}">${f[0]}</button>`).join("");
  function gen() {
    const nom = ($("#gn").value.trim() || "Tu marca").slice(0, 24), [p, s, d] = COL[gc], f = FUE[gf][1];
    $("#vn").textContent = nom; $("#vt2").textContent = nom; $("#vi").textContent = nom[0].toUpperCase();
    $("#vi").style.background = p; $("#vc").style.background = p; $("#vt").style.background = d;
    $("#vn").style.fontFamily = f; $("#vt2").style.fontFamily = f; $("#vn").style.color = d;
    $("#vp").innerHTML = [p, s, d].map(x => `<i style="background:${x}"></i>`).join("");
    const l = $(".vista .lg i"); l.style.animation = "none"; void l.offsetWidth; l.style.animation = "";
  }
  $("#gn").oninput = gen;
  $("#sw").onclick = e => { const b = e.target.closest("button"); if (!b) return; gc = +b.dataset.n; $$("#sw button").forEach(x => x.classList.toggle("on", x === b)); gen(); };
  $("#fnt").onclick = e => { const b = e.target.closest("button"); if (!b) return; gf = +b.dataset.n; $$("#fnt button").forEach(x => x.classList.toggle("on", x === b)); gen(); };
  $("#gw").onclick = () => { wa(`Hola Atelier Norte, probé el generador con "${$("#gn").value.trim() || "mi negocio"}" (color ${COL[gc][0]}, letra ${FUE[gf][0]}). Quiero esta marca.`); };
  gen();

  /* ---------- kit de marca ---------- */
  const KIT = [["Terracota", "#C8553D"], ["Oliva", "#5B6B4A"], ["Tinta", "#1B1714"], ["Hueso", "#F5EFE6", "#1B1714"]];
  $("#kit").innerHTML = KIT.map(([n, h, t], i) => `<button class="col rv" style="background:${h};${t ? "color:" + t + ";border:1px solid #D9CFC0;" : ""}--d:${i}" data-h="${h}"><b>${n}</b><small>${h}</small></button>`).join("");
  $("#kit").onclick = e => { const b = e.target.closest(".col"); if (!b) return; const h = b.dataset.h; (navigator.clipboard ? navigator.clipboard.writeText(h) : Promise.reject()).then(() => toast(h + " copiado"), () => toast(h)); };

  /* ---------- retrato ---------- */
  $("#retrato").innerHTML = arte(0, "retrato").replace('viewBox="0 0 100 125"', 'viewBox="0 0 100 125"');

  /* ---------- reveal, contadores, progreso, nav ---------- */
  const cuenta = el => { const m = +el.dataset.c; let t0; const paso = t => { t0 = t0 || t; const k = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(m * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(paso); }; requestAnimationFrame(paso); };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add("in"); $$("[data-c]", x.target).forEach(cuenta); io.unobserve(x.target); } }), { threshold: .15 });
    $$(".rv").forEach(e => io.observe(e));
    const sobre = $(".cifras"); if (sobre) { const io2 = new IntersectionObserver(es => { if (es[0].isIntersecting) { $$("[data-c]", sobre).forEach(cuenta); io2.disconnect(); } }); io2.observe(sobre); }
  } else { $$(".rv").forEach(e => e.classList.add("in")); $$(".cifras [data-c]").forEach(e => e.textContent = e.dataset.c); }
  const prog = $("#prog"), nav = $(".nav");
  addEventListener("scroll", () => { const h = document.documentElement; prog.style.width = (scrollY / (h.scrollHeight - innerHeight) * 100) + "%"; nav.classList.toggle("sc", scrollY > 30); }, { passive: true });
  const nv = $("#nv"), bg = $("#bg");
  bg.onclick = () => { const o = nv.classList.toggle("on"); bg.setAttribute("aria-expanded", o); };
  nv.onclick = e => { if (e.target.closest("a")) { nv.classList.remove("on"); bg.setAttribute("aria-expanded", "false"); } };
  const links = $$("#nv a[href^='#']:not(.btn)"), secs = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) { const so = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) links.forEach(a => a.classList.toggle("act", a.getAttribute("href") === "#" + x.target.id)); }), { rootMargin: "-40% 0px -55% 0px" }); secs.forEach(s => so.observe(s)); }

  /* ---------- formulario ---------- */
  $("#f").onsubmit = e => {
    e.preventDefault(); const n = $("#fn").value.trim(), er = $("#en");
    if (n.length < 2) { er.textContent = "Escribe tu nombre."; $("#fn").classList.add("err"); $("#fn").focus(); return; }
    er.textContent = ""; $("#fn").classList.remove("err");
    wa(`Hola Atelier Norte, soy ${n}${$("#fb").value.trim() ? " de " + $("#fb").value.trim() : ""}. Necesito: ${$("#fs").value}. ${$("#fm").value.trim()}`);
    toast("¡Gracias! Abriendo WhatsApp…");
  };
  $("#fn").oninput = () => { $("#en").textContent = ""; $("#fn").classList.remove("err"); };
})();
