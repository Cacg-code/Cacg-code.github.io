const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../logica.js");

// Fechas de referencia: 2026-10-05 es lunes; 06 martes; 10 sábado; 11 domingo
const ya = (fecha, h) => ({ fecha, h });

test("fmtH, diaDe y dmas", () => {
  assert.equal(L.fmtH(12), "12:00");
  assert.equal(L.fmtH(13.5), "13:30");
  assert.equal(L.diaDe("2026-10-05"), 1);
  assert.equal(L.dmas("2026-12-31", 1), "2027-01-01");
  assert.equal(L.dmas("2026-10-05", 60), "2026-12-04");
});

test("ahoraLima usa la hora de Lima (UTC-5)", () => {
  const r = L.ahoraLima(new Date("2026-10-06T02:30:00Z")); // 21:30 del lunes 5 en Lima
  assert.equal(r.fecha, "2026-10-05");
  assert.equal(r.h, 21.5);
  assert.equal(r.d, 1);
});

test("textoEstado: abierto, cerrado, lunes cerrado", () => {
  assert.deepEqual(L.textoEstado(2, 13), { abierto: true, texto: "Abierto ahora · cierra en 4 h 0 min" });
  assert.equal(L.textoEstado(2, 16.5).texto, "Abierto ahora · cierra en 30 min");
  assert.equal(L.textoEstado(2, 17).abierto, false);
  assert.equal(L.textoEstado(2, 17).texto, "Cerrado ahora · abrimos mañana a las 12:00");
  assert.equal(L.textoEstado(2, 9).texto, "Cerrado ahora · abrimos hoy a las 12:00");
  assert.equal(L.textoEstado(1, 13).texto, "Cerrado ahora · abrimos mañana a las 12:00");
  assert.equal(L.textoEstado(0, 18).texto, "Cerrado ahora · abrimos el martes a las 12:00");
});

test("slotsDelDia: última mesa 1 h antes de cerrar", () => {
  const max = "2026-12-04";
  assert.deepEqual(L.slotsDelDia("2026-10-06", ya("2026-10-05", 10), max).slots, ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"]);
  assert.equal(L.slotsDelDia("2026-10-10", ya("2026-10-05", 10), max).slots.at(-1), "17:00"); // sábado cierra 18:00
});

test("slotsDelDia: hoy descarta horas pasadas y deja 30 min de margen", () => {
  const r = L.slotsDelDia("2026-10-06", ya("2026-10-06", 13), "2026-12-04");
  assert.equal(r.slots[0], "14:00");
  assert.equal(L.slotsDelDia("2026-10-06", ya("2026-10-06", 16), "2026-12-04").motivo, "sinHorarios");
});

test("slotsDelDia: motivos", () => {
  const max = "2026-12-04";
  assert.equal(L.slotsDelDia("", ya("2026-10-05", 10), max).motivo, "sinFecha");
  assert.equal(L.slotsDelDia("2026-10-04", ya("2026-10-05", 10), max).motivo, "sinFecha");
  assert.equal(L.slotsDelDia("2026-12-05", ya("2026-10-05", 10), max).motivo, "sinFecha");
  assert.equal(L.slotsDelDia("2026-10-12", ya("2026-10-05", 10), max).motivo, "cerrado"); // lunes
});

test("errorFecha", () => {
  const max = "2026-12-04", y = ya("2026-10-05", 10), s = ["12:00"];
  assert.match(L.errorFecha("", y, max, []), /Elige la fecha/);
  assert.match(L.errorFecha("2026-10-04", y, max, []), /ya pasó/);
  assert.match(L.errorFecha("2026-12-05", y, max, []), /60 días/);
  assert.match(L.errorFecha("2026-10-12", y, max, []), /Los lunes estamos cerrados/);
  assert.match(L.errorFecha("2026-10-06", ya("2026-10-06", 16), max, []), /ya no quedan horarios/);
  assert.equal(L.errorFecha("2026-10-06", y, max, s), "");
});

test("errorNombre", () => {
  assert.notEqual(L.errorNombre(" a "), "");
  assert.notEqual(L.errorNombre(undefined), "");
  assert.equal(L.errorNombre("Al"), "");
});

test("mensajeReserva: formato WhatsApp sin emojis y con nota opcional", () => {
  const base = { nombre: " Ana ", fecha: "2026-10-10", hora: "13:30", personas: "4" };
  const t = L.mensajeReserva({ ...base, nota: "  cumpleaños " });
  assert.equal(t, "Hola La Marea,\nQuiero reservar una mesa.\n\n*Nombre:* Ana\n*Fecha:* sábado 10/10/2026\n*Hora:* 13:30\n*Personas:* 4\n*Nota:* cumpleaños\n\n_Reserva desde la web_");
  assert.ok(!L.mensajeReserva({ ...base, nota: "  " }).includes("*Nota:*"));
  assert.doesNotMatch(t, /\p{Extended_Pictographic}/u);
});

test("mensajePedido y urlWhatsApp", () => {
  assert.equal(L.mensajePedido("Pisco sour", 24), "Hola La Marea,\nQuiero pedir:\n*Pisco sour* (S/ 24)\n\n_Pedido desde la web_");
  const u = L.urlWhatsApp("51999999999", "Hola\n*a*");
  assert.equal(u, "https://wa.me/51999999999?text=Hola%0A*a*");
});
