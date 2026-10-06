const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../logica.js");
const P = L.PRODUCTOS;

test("catálogo: ids únicos, precios positivos y perfil de 3 valores", () => {
  assert.equal(new Set(P.map(p => p.id)).size, P.length);
  for (const p of P) { assert.ok(p.p > 0); assert.equal(p.perfil.length, 3); assert.ok(["Claro", "Medio", "Oscuro"].includes(p.t)); }
});

test("fmt y esc", () => {
  assert.equal(L.fmt(42), "S/ 42.00");
  assert.equal(L.esc('<img src=x onerror="a">'), "&lt;img src=x onerror=&quot;a&quot;&gt;");
});

test("filtrar por tueste, texto y orden", () => {
  assert.equal(L.filtrar(P).length, P.length);
  assert.ok(L.filtrar(P, { tueste: "Claro" }).every(p => p.t === "Claro"));
  assert.deepEqual(L.filtrar(P, { texto: " CUSCO " }).map(p => p.o), ["Cusco", "Cusco", "Cusco"]);
  assert.deepEqual(L.filtrar(P, { texto: "jazmín" }).map(p => p.n), ["Valle Sagrado"]); // busca en notas
  assert.equal(L.filtrar(P, { texto: "zzz" }).length, 0);
  const asc = L.filtrar(P, { orden: "asc" }).map(p => p.p);
  assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
  const desc = L.filtrar(P, { orden: "desc" }).map(p => p.p);
  assert.deepEqual(desc, [...desc].sort((a, b) => b - a));
  assert.equal(P[0].id, 1); // no muta el catálogo
});

test("totales: envío S/ 12 bajo 120 y gratis desde 120", () => {
  assert.deepEqual(L.totales([], P), { sub: 0, env: 0, tot: 0 });
  assert.deepEqual(L.totales([{ id: 1, g: "Grano entero", q: 1 }], P), { sub: 42, env: 12, tot: 54 });
  assert.deepEqual(L.totales([{ id: 5, g: "Fina", q: 2 }, { id: 4, g: "Fina", q: 1 }], P), { sub: 140, env: 0, tot: 140 });
  assert.equal(L.totales([{ id: 1, g: "x", q: 3 }], P).env, 0); // 126
});

test("carrito: agregar, mover y quitar sin mutar", () => {
  const c0 = [];
  const c1 = L.agregarLinea(c0, 1, "Fina", 1);
  const c2 = L.agregarLinea(c1, 1, "Fina", 2);
  const c3 = L.agregarLinea(c2, 1, "Media", 1);
  assert.deepEqual(c0, []);
  assert.deepEqual(c1, [{ id: 1, g: "Fina", q: 1 }]);
  assert.equal(c2[0].q, 3);
  assert.equal(c3.length, 2); // otra molienda = otra línea
  assert.equal(L.moverLinea(c3, "1|Media", 1).find(l => l.g === "Media").q, 2);
  assert.equal(L.moverLinea(c3, "1|Media", -1).length, 1);
  assert.equal(L.moverLinea(c3, "9|Fina", 1).length, 2);
  assert.deepEqual(L.quitarLinea(c3, "1|Fina"), [{ id: 1, g: "Media", q: 1 }]);
});

test("textoEnvio", () => {
  assert.equal(L.textoEnvio(0), "Envío gratis desde S/ 120.00");
  assert.equal(L.textoEnvio(42), "Te faltan S/ 78.00 para el envío gratis");
  assert.equal(L.textoEnvio(120), "Tienes envío gratis");
});

test("errorPedido", () => {
  const c = [{ id: 1, g: "Fina", q: 1 }];
  assert.match(L.errorPedido([], "Ana", "Surco"), /vacío/);
  assert.match(L.errorPedido(c, " ", "Surco"), /nombre y distrito/);
  assert.match(L.errorPedido(c, "Ana", ""), /nombre y distrito/);
  assert.equal(L.errorPedido(c, "Ana", "Surco"), "");
});

test("mensajePedido: formato exacto y URL", () => {
  const c = [{ id: 1, g: "Media", q: 2 }, { id: 4, g: "Grano entero", q: 1 }];
  const t = L.mensajePedido(c, P, { nombre: " Ana ", distrito: "Surco", pago: "Yape" });
  assert.equal(t, "Hola Cumbre Café,\nQuiero hacer este pedido:\n\n• 2 × *Machu Picchu* · Media (S/ 84.00)\n• 1 × *Cajamarca* · Grano entero (S/ 36.00)\n\n*Subtotal:* S/ 120.00\n*Envío:* Gratis\n*Total:* S/ 120.00\n\n*Nombre:* Ana\n*Distrito:* Surco\n*Pago:* Yape\n\n_Pedido desde la web_");
  assert.equal(L.urlWhatsApp("51999999999", "a b\n"), "https://wa.me/51999999999?text=a%20b%0A");
});
