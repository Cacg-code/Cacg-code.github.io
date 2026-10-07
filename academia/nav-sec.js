/* Cátedra — barra de secciones con seguimiento al desplazar. © Carlo · Dev */
window.NavSec = {
  build(root, host) {
    const ss = [...root.querySelectorAll(".sec[id]")]; if (!host || !ss.length) return;
    host.innerHTML = ss.map(s => `<a href="#${s.id}" data-s="${s.id}"><span>${s.dataset.i || ""}</span>${s.dataset.t}</a>`).join("");
    host.onclick = e => { const a = e.target.closest("a"); if (!a) return; e.preventDefault(); const t = document.getElementById(a.dataset.s); window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 74, behavior: "smooth" }); };
    const on = id => host.querySelectorAll("a").forEach(a => { const v = a.dataset.s === id; a.classList.toggle("on", v); if (v && host.scrollWidth > host.clientWidth) host.scrollTo({ left: a.offsetLeft - 40, behavior: "smooth" }); });
    on(ss[0].id);
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(es => { es.forEach(x => { if (x.isIntersecting) on(x.target.id); }); }, { rootMargin: "-35% 0px -60% 0px" });
    ss.forEach(s => io.observe(s));
  }
};
