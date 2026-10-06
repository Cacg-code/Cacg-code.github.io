/* Cumbre Café: lógica pura (catálogo, filtros, carrito, envío, mensaje de WhatsApp). Sin DOM, para probarla con node:test. */
(function (g) {
  const ENVIO_GRATIS = 120, ENVIO = 12;
  const PRODUCTOS=[
   {id:1,n:"Machu Picchu",o:"Cusco",t:"Medio",p:42,notas:"Cacao, naranja, panela",c:"#FFE27A",tc:"#1B2BD9",tag:"Más vendido",alt:1900,perfil:[70,55,40]},
   {id:2,n:"Valle Sagrado",o:"Cusco",t:"Claro",p:46,notas:"Jazmín, durazno, miel",c:"#BFD2FF",tc:"#0D1030",alt:2100,perfil:[85,35,75]},
   {id:3,n:"Chanchamayo",o:"Junín",t:"Medio",p:38,notas:"Nuez, caramelo, chocolate",c:"#FFC9B8",tc:"#9A2B0B",alt:1600,perfil:[55,70,35]},
   {id:4,n:"Cajamarca",o:"Cajamarca",t:"Oscuro",p:36,notas:"Cacao amargo, tostado, especias",c:"#C9F0D6",tc:"#0B5A33",alt:1900,perfil:[35,90,20]},
   {id:5,n:"Amazonas Nativo",o:"Amazonas",t:"Claro",p:52,notas:"Cereza, flores, té negro",c:"#F1D2FF",tc:"#5B1E80",tag:"Nuevo",alt:1800,perfil:[90,30,85]},
   {id:6,n:"Alto Mayo",o:"San Martín",t:"Medio",p:40,notas:"Almendra, panela, manzana",c:"#FFE27A",tc:"#0D1030",alt:1500,perfil:[60,60,50]},
   {id:7,n:"Puno Orgánico",o:"Puno",t:"Oscuro",p:44,notas:"Chocolate negro, frutos secos",c:"#D8DCF5",tc:"#1B2BD9",alt:2200,perfil:[40,85,25]},
   {id:8,n:"Descafeinado",o:"Cusco",t:"Medio",p:48,notas:"Suave, dulce, sin cafeína",c:"#BFD2FF",tc:"#1B2BD9",alt:1900,perfil:[50,50,45]}
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

  const L = { ENVIO_GRATIS, ENVIO, PRODUCTOS, fmt, esc, filtrar, claveLinea, totales, agregarLinea, moverLinea, quitarLinea, textoEnvio, errorPedido, mensajePedido, urlWhatsApp };
  if (typeof module !== "undefined" && module.exports) module.exports = L; else g.Cumbre = L;
})(typeof globalThis !== "undefined" ? globalThis : this);
