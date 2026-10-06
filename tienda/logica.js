/* Cumbre Café: lógica pura (catálogo, filtros, carrito, envío, mensaje de WhatsApp). Sin DOM, para probarla con node:test. */
(function (g) {
  const ENVIO_GRATIS = 120, ENVIO = 12;
  const PRODUCTOS=[
   {id:1,n:"Machu Picchu",o:"Cusco",t:"Medio",p:42,notas:"Cacao, naranja, panela",c:"#E9B664",tc:"#4A2A17",tag:"Más vendido",alt:1900,perfil:[70,55,40]},
   {id:2,n:"Valle Sagrado",o:"Cusco",t:"Claro",p:46,notas:"Jazmín, durazno, miel",c:"#F1E3C8",tc:"#3F5B34",alt:2100,perfil:[85,35,75]},
   {id:3,n:"Chanchamayo",o:"Junín",t:"Medio",p:38,notas:"Nuez, caramelo, chocolate",c:"#D98E5F",tc:"#33190C",alt:1600,perfil:[55,70,35]},
   {id:4,n:"Cajamarca",o:"Cajamarca",t:"Oscuro",p:36,notas:"Cacao amargo, tostado, especias",c:"#3A2518",tc:"#E9B664",alt:1900,perfil:[35,90,20]},
   {id:5,n:"Amazonas Nativo",o:"Amazonas",t:"Claro",p:52,notas:"Cereza, flores, té negro",c:"#CBD6B0",tc:"#4A2A17",tag:"Nuevo",alt:1800,perfil:[90,30,85]},
   {id:6,n:"Alto Mayo",o:"San Martín",t:"Medio",p:40,notas:"Almendra, panela, manzana",c:"#E9B664",tc:"#3F5B34",alt:1500,perfil:[60,60,50]},
   {id:7,n:"Puno Orgánico",o:"Puno",t:"Oscuro",p:44,notas:"Chocolate negro, frutos secos",c:"#5B3A26",tc:"#F1E3C8",alt:2200,perfil:[40,85,25]},
   {id:8,n:"Descafeinado",o:"Cusco",t:"Medio",p:48,notas:"Suave, dulce, sin cafeína",c:"#E8DCC6",tc:"#4A2A17",alt:1900,perfil:[50,50,45]}
  ];

  const fmt = n => "S/ " + n.toFixed(2);
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Filtra por tueste y texto (nombre, origen, notas) y ordena por precio ("asc" | "desc" | otro = catálogo)
  function filtrar(productos, { tueste = "Todos", texto = "", orden = "" } = {}) {
    const q = texto.trim().toLowerCase();
    const r = productos.filter(p => (tueste === "Todos" || p.t === tueste) && `${p.n} ${p.o} ${p.notas}`.toLowerCase().includes(q));
    if (orden === "asc") r.sort((a, b) => a.p - b.p);
    if (orden === "desc") r.sort((a, b) => b.p - a.p);
    return r;
  }

  // Carrito: lista de {id, g (molienda), q (cantidad)}
  const claveLinea = l => l.id + "|" + l.g;
  function totales(carrito, productos) {
    const sub = carrito.reduce((s, l) => s + productos.find(p => p.id === l.id).p * l.q, 0);
    const env = sub === 0 || sub >= ENVIO_GRATIS ? 0 : ENVIO;
    return { sub, env, tot: sub + env };
  }
  function agregarLinea(carrito, id, g, q) {
    const l = carrito.find(x => x.id === id && x.g === g);
    return l ? carrito.map(x => x === l ? { ...x, q: x.q + q } : x) : [...carrito, { id, g, q }];
  }
  function moverLinea(carrito, k, d) { // suma d a la cantidad; si llega a 0 o menos, quita la línea
    return carrito.map(l => claveLinea(l) === k ? { ...l, q: l.q + d } : l).filter(l => l.q > 0);
  }
  const quitarLinea = (carrito, k) => carrito.filter(l => claveLinea(l) !== k);
  function textoEnvio(sub) {
    const falta = ENVIO_GRATIS - sub;
    return sub === 0 ? `Envío gratis desde ${fmt(ENVIO_GRATIS)}` : falta > 0 ? `Te faltan ${fmt(falta)} para el envío gratis` : "Tienes envío gratis";
  }

  const errorPedido = (carrito, nombre, distrito) =>
    !carrito.length ? "Tu carrito está vacío." : !nombre.trim() || !distrito.trim() ? "Escribe tu nombre y distrito para enviar el pedido." : "";

  function mensajePedido(carrito, productos, { nombre, distrito, pago }) {
    const { sub, env, tot } = totales(carrito, productos);
    const items = carrito.map(l => { const p = productos.find(x => x.id === l.id); return `• ${l.q} × *${p.n}* · ${l.g} (${fmt(p.p * l.q)})`; }).join("\n");
    return ["Hola Cumbre Café,", "Quiero hacer este pedido:", "", items, "", `*Subtotal:* ${fmt(sub)}`, `*Envío:* ${env ? fmt(env) : "Gratis"}`, `*Total:* ${fmt(tot)}`, "", `*Nombre:* ${nombre.trim()}`, `*Distrito:* ${distrito.trim()}`, `*Pago:* ${pago}`, "", "_Pedido desde la web_"].join("\n");
  }
  const urlWhatsApp = (numero, texto) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

  // Suscripción: descuento por entrega recurrente y pedido por WhatsApp
  const FRECUENCIAS = [{ id: "sem", n: "Cada semana", dias: 7 }, { id: "quin", n: "Cada 2 semanas", dias: 14 }, { id: "mes", n: "Cada mes", dias: 30 }];
  const DESCUENTO_SUS = 0.1, MAX_BOLSAS = 6;
  function cotizarSuscripcion(p, bolsas) {
    const n = Math.min(MAX_BOLSAS, Math.max(1, Math.round(bolsas) || 1));
    const normal = p.p * n, desc = Math.round(normal * DESCUENTO_SUS * 100) / 100;
    const sub = normal - desc, env = sub >= ENVIO_GRATIS ? 0 : ENVIO;
    return { bolsas: n, normal, desc, env, total: sub + env };
  }
  function mensajeSuscripcion(p, { molienda, bolsas, frecuencia, nombre, distrito, pago }) {
    const c = cotizarSuscripcion(p, bolsas), f = FRECUENCIAS.find(x => x.id === frecuencia) || FRECUENCIAS[2];
    return ["Hola Cumbre Café,", "Quiero suscribirme:", "", `• ${c.bolsas} × *${p.n}* (250 g) · ${molienda}`, `• *Frecuencia:* ${f.n}`, `• *Precio por entrega:* ${fmt(c.total)} (10% de descuento${c.env ? ", envío incluido" : ", envío gratis"})`, "", `*Nombre:* ${nombre.trim()}`, `*Distrito:* ${distrito.trim()}`, `*Pago:* ${pago}`, "", "_Suscripción desde la web_"].join("\n");
  }

  const L = { ENVIO_GRATIS, ENVIO, PRODUCTOS, fmt, esc, filtrar, claveLinea, totales, agregarLinea, moverLinea, quitarLinea, textoEnvio, errorPedido, mensajePedido, urlWhatsApp, FRECUENCIAS, DESCUENTO_SUS, MAX_BOLSAS, cotizarSuscripcion, mensajeSuscripcion };
  if (typeof module !== "undefined" && module.exports) module.exports = L; else g.Cumbre = L;
})(typeof globalThis !== "undefined" ? globalThis : this);
