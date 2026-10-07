/* Cátedra — cursos de ejemplo. © Carlo · Dev */
(function (r) {
  const L = (t, m, k, p) => ({ t, m, k, p });
  const CURSOS = [
    { id: "calculo", nombre: "Cálculo I", area: "Ingeniería", color: "#2563EB", ico: "∫", prof: "Mg. Rosa Quispe", horas: 18,
      desc: "Límites, derivadas y aplicaciones, con ejercicios resueltos como en los exámenes de tu universidad.",
      mods: [
        { t: "Límites y continuidad", l: [L("Idea intuitiva de límite", 12, "video", ["El límite describe a qué valor se acerca f(x) cuando x se acerca a un punto.", "No importa el valor en el punto, sino el comportamiento alrededor.", "Se calcula por tablas, gráficas o álgebra."]), L("Límites laterales y al infinito", 15, "video", ["Si los límites por izquierda y derecha difieren, el límite no existe.", "Al infinito, domina el término de mayor grado.", "Asíntotas horizontales: lim f(x) = L."]), L("Continuidad en un punto", 10, "lectura", ["f es continua en a si f(a) existe, el límite existe y son iguales.", "Los polinomios son continuos en todo ℝ.", "Discontinuidad evitable vs. de salto."])] },
        { t: "La derivada", l: [L("Definición como límite", 14, "video", ["f′(x) = lim (f(x+h) − f(x)) / h cuando h → 0.", "Representa la pendiente de la recta tangente.", "También es la razón de cambio instantánea."]), L("Reglas de derivación", 18, "video", ["Potencia: (xⁿ)′ = n·xⁿ⁻¹.", "Producto: (uv)′ = u′v + uv′.", "Cociente y regla de la cadena."]), L("Práctica guiada de derivadas", 20, "lectura", ["Deriva paso a paso, identificando primero la regla.", "Simplifica al final, no antes.", "Verifica con un punto de prueba."])] },
        { t: "Aplicaciones", l: [L("Máximos y mínimos", 16, "video", ["Los puntos críticos cumplen f′(x) = 0 o no existe.", "Criterio de la segunda derivada: f″ > 0 mínimo, f″ < 0 máximo.", "Revisa también los extremos del intervalo."]), L("Problemas de optimización", 18, "video", ["Define la variable y escribe la función a optimizar.", "Usa la restricción para dejar una sola variable.", "Interpreta el resultado en el contexto."])] }
      ],
      examen: [
        { q: "¿Cuál es la derivada de x³?", o: ["x²", "3x²", "3x", "x³/3"], c: 1, e: "Regla de la potencia: (xⁿ)′ = n·xⁿ⁻¹, así que (x³)′ = 3x²." },
        { q: "lim (x→2) (x² − 4)/(x − 2) es…", o: ["0", "2", "4", "No existe"], c: 2, e: "Factoriza: (x²−4) = (x−2)(x+2); simplificas (x−2) y queda x+2 = 4." },
        { q: "La derivada en un punto representa…", o: ["El área bajo la curva", "La pendiente de la tangente", "El valor de f en ese punto", "El dominio"], c: 1, e: "La derivada es la pendiente de la recta tangente a la curva en ese punto." },
        { q: "Un punto crítico cumple…", o: ["f(x) = 0", "f′(x) = 0 o no existe", "f″(x) = 1", "f′(x) = f(x)"], c: 1, e: "Los puntos críticos son donde f′(x) = 0 o la derivada no existe." },
        { q: "Regla del producto: (uv)′ =", o: ["u′v′", "u′v + uv′", "uv′ − u′v", "u′/v′"], c: 1, e: "Se deriva uno a la vez: (uv)′ = u′v + uv′." }] },
    { id: "estadistica", nombre: "Estadística aplicada", area: "Salud y Ciencias", color: "#0D9488", ico: "σ", prof: "Dr. Luis Paredes", horas: 16,
      desc: "Describe datos, entiende la probabilidad y haz inferencias para tu tesis o tus prácticas.",
      mods: [
        { t: "Estadística descriptiva", l: [L("Tipos de variables y tablas", 12, "video", ["Cualitativas (nominal, ordinal) y cuantitativas (discreta, continua).", "La tabla de frecuencias resume los datos.", "Frecuencia absoluta, relativa y acumulada."]), L("Media, mediana y desviación", 16, "video", ["La media se afecta por valores extremos; la mediana no.", "La desviación estándar mide la dispersión.", "Elige la medida según la forma de los datos."]), L("Gráficos que comunican", 10, "lectura", ["Histograma para continuas, barras para categorías.", "Evita los 3D y los ejes truncados.", "Un gráfico = una idea."])] },
        { t: "Probabilidad", l: [L("Reglas básicas", 14, "video", ["P(A) va de 0 a 1.", "P(A o B) = P(A) + P(B) − P(A y B).", "Eventos independientes: P(A y B) = P(A)·P(B)."]), L("Distribución normal", 18, "video", ["Forma de campana, simétrica alrededor de la media.", "Regla 68-95-99,7.", "Se estandariza con z = (x − μ)/σ."])] },
        { t: "Inferencia", l: [L("Intervalos de confianza", 15, "video", ["Estiman un rango razonable para el parámetro.", "Más muestra → intervalo más angosto.", "95 % no es «95 % de probabilidad» del parámetro."]), L("Pruebas de hipótesis y valor p", 20, "video", ["H₀ es la hipótesis de no efecto.", "Un valor p pequeño (< 0,05) es evidencia contra H₀.", "Significativo no siempre significa importante."])] }
      ],
      examen: [
        { q: "¿Qué medida resiste mejor a valores extremos?", o: ["Media", "Mediana", "Rango", "Varianza"], c: 1, e: "La mediana depende del orden, no de cuán grandes sean los extremos; la media sí se distorsiona." },
        { q: "En una normal, ~95 % de los datos está a…", o: ["1 desviación", "2 desviaciones", "3 desviaciones", "0,5 desviaciones"], c: 1, e: "Regla empírica: 68 % a 1 desviación, 95 % a 2 y 99,7 % a 3." },
        { q: "H₀ representa…", o: ["El efecto que buscas", "La ausencia de efecto", "El error", "La muestra"], c: 1, e: "La hipótesis nula afirma que no hay efecto ni diferencia; se intenta rechazarla con evidencia." },
        { q: "Más tamaño de muestra produce un intervalo…", o: ["Más ancho", "Igual", "Más angosto", "Sin sentido"], c: 2, e: "Con más datos el error estándar baja, así que el intervalo de confianza se angosta." },
        { q: "El color de ojos es una variable…", o: ["Cuantitativa continua", "Cualitativa nominal", "Cuantitativa discreta", "Ordinal"], c: 1, e: "Describe una cualidad sin orden natural: variable cualitativa nominal." }] },
    { id: "python", nombre: "Programación en Python", area: "Sistemas", color: "#7C3AED", ico: "</>", prof: "Ing. Marco Salas", horas: 20,
      desc: "De cero a resolver problemas reales: variables, control de flujo, funciones y archivos.",
      mods: [
        { t: "Primeros pasos", l: [L("Variables y tipos de datos", 12, "video", ["int, float, str y bool son los tipos básicos.", "Python infiere el tipo al asignar.", "Usa nombres que expliquen el dato."]), L("Entrada, salida y operadores", 10, "lectura", ["input() devuelve siempre texto: conviértelo con int().", "print() admite f-strings: f\"Hola {nombre}\".", "// es división entera, % es residuo."])] },
        { t: "Control de flujo", l: [L("Condicionales", 12, "video", ["if / elif / else según condiciones.", "Combina con and, or, not.", "La indentación define el bloque."]), L("Bucles for y while", 16, "video", ["for recorre colecciones; while repite mientras la condición sea cierta.", "range(n) genera 0…n−1.", "break y continue controlan la repetición."]), L("Listas y diccionarios", 18, "video", ["Las listas conservan el orden y son mutables.", "Los diccionarios asocian clave → valor.", "Comprensiones de lista para código corto."])] },
        { t: "Funciones y archivos", l: [L("Funciones y reutilización", 15, "video", ["def nombre(parámetros): … return valor.", "Una función hace una sola cosa.", "Documenta con un docstring."]), L("Leer y escribir archivos", 14, "lectura", ["with open(ruta) as f: cierra el archivo solo.", "Modo 'r' lee, 'w' escribe, 'a' agrega.", "CSV: usa el módulo csv."])] }
      ],
      examen: [
        { q: "input() devuelve…", o: ["int", "float", "str", "bool"], c: 2, e: "input() siempre entrega texto (str); conviértelo con int() o float() si lo necesitas." },
        { q: "range(3) genera…", o: ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3"], c: 1, e: "range(n) empieza en 0 y termina en n−1: 0, 1, 2." },
        { q: "¿Qué estructura asocia clave y valor?", o: ["Lista", "Tupla", "Diccionario", "Cadena"], c: 2, e: "El diccionario guarda pares clave: valor, por ejemplo {\"edad\": 20}." },
        { q: "7 // 2 es…", o: ["3.5", "3", "4", "1"], c: 1, e: "// es la división entera: descarta los decimales, 7 // 2 = 3." },
        { q: "¿Qué palabra devuelve un valor desde una función?", o: ["print", "yield", "return", "out"], c: 2, e: "return termina la función y entrega el resultado a quien la llamó; print solo muestra." }] },
    { id: "contabilidad", nombre: "Contabilidad básica", area: "Negocios", color: "#D97706", ico: "S/", prof: "CPC Elena Vargas", horas: 14,
      desc: "La ecuación contable, el libro diario y los estados financieros explicados con casos peruanos.",
      mods: [
        { t: "Fundamentos", l: [L("La ecuación contable", 12, "video", ["Activo = Pasivo + Patrimonio.", "Cada operación mantiene la ecuación en equilibrio.", "Activo: lo que tiene; pasivo: lo que debe."]), L("Cuentas, debe y haber", 14, "video", ["Partida doble: todo cargo tiene un abono.", "Activos aumentan por el debe; pasivos, por el haber.", "El asiento debe cuadrar."])] },
        { t: "Registro", l: [L("Libro diario y mayor", 16, "video", ["El diario registra cronológicamente.", "El mayor agrupa por cuenta.", "El balance de comprobación verifica que cuadre."]), L("IGV en las compras y ventas", 14, "lectura", ["El IGV es 18 % en el Perú.", "Crédito fiscal: IGV de compras que se resta del de ventas.", "Guarda siempre el comprobante electrónico."])] },
        { t: "Estados financieros", l: [L("Estado de resultados", 15, "video", ["Ventas − costos − gastos = utilidad.", "Muestra el desempeño en un periodo.", "Distingue utilidad bruta, operativa y neta."]), L("Balance general", 15, "video", ["Foto de la empresa a una fecha.", "Activo corriente vs. no corriente.", "Calcula la liquidez = activo corriente / pasivo corriente."])] }
      ],
      examen: [
        { q: "La ecuación contable es…", o: ["A = P − Pt", "A = P + Pt", "A + P = Pt", "P = A + Pt"], c: 1, e: "Lo que tiene la empresa (Activo) se financia con deudas y aportes: A = P + Pt." },
        { q: "El IGV en el Perú es…", o: ["16 %", "18 %", "12 %", "21 %"], c: 1, e: "En Perú el IGV es 18 % (16 % de IGV + 2 % de IPM)." },
        { q: "Partida doble significa que…", o: ["Se registra dos veces el monto", "Todo cargo tiene un abono", "Hay dos libros", "Se paga doble"], c: 1, e: "Cada operación afecta al menos dos cuentas: lo que se carga en una se abona en otra, por el mismo monto." },
        { q: "El balance general muestra…", o: ["Un periodo", "Una fecha", "Solo las ventas", "Solo deudas"], c: 1, e: "Es una foto de la empresa en una fecha: activos, pasivos y patrimonio." },
        { q: "Utilidad = …", o: ["Ventas + gastos", "Ventas − costos − gastos", "Activo − pasivo", "Costos − ventas"], c: 1, e: "Utilidad = ventas − costos − gastos; es lo que realmente queda." }] },
    { id: "excel", nombre: "Excel para tu carrera", area: "Negocios", color: "#16A34A", ico: "fx", prof: "Lic. Diana Torres", horas: 12,
      desc: "Fórmulas, tablas dinámicas y gráficos para tus trabajos, prácticas y primer empleo.",
      mods: [
        { t: "Fórmulas esenciales", l: [L("Referencias y fórmulas", 12, "video", ["Relativa A1, absoluta $A$1, mixta $A1.", "Usa F4 para fijar la referencia.", "SUMA, PROMEDIO, MAX y MIN."]), L("BUSCARV y XLOOKUP", 16, "video", ["BUSCARV busca en la primera columna.", "XLOOKUP es más flexible y no se rompe al insertar columnas.", "Maneja los errores con SI.ERROR."])] },
        { t: "Datos y análisis", l: [L("Tablas y filtros", 10, "lectura", ["Da formato de tabla con Ctrl+T.", "Los filtros y segmentaciones aceleran el análisis.", "Evita celdas combinadas en los datos."]), L("Tablas dinámicas", 18, "video", ["Arrastra campos a filas, columnas y valores.", "Actualiza con clic derecho → Actualizar.", "Agrupa fechas por mes o trimestre."]), L("Gráficos y dashboard", 14, "video", ["Elige el gráfico según la pregunta.", "Un dashboard: 3 a 5 indicadores clave.", "Usa pocos colores y títulos claros."])] }
      ],
      examen: [
        { q: "¿Qué tecla fija una referencia?", o: ["F2", "F4", "F5", "F12"], c: 1, e: "F4 alterna entre referencias relativas, absolutas y mixtas al editar una fórmula." },
        { q: "$A$1 es una referencia…", o: ["Relativa", "Absoluta", "Mixta", "Externa"], c: 1, e: "Los dos signos $ bloquean columna y fila: referencia absoluta." },
        { q: "Ctrl+T sirve para…", o: ["Insertar tabla", "Guardar", "Buscar", "Imprimir"], c: 0, e: "Ctrl+T convierte el rango en tabla, con filtros y fórmulas que se autocompletan." },
        { q: "Para resumir muchos datos usas…", o: ["Una tabla dinámica", "Un comentario", "Un hipervínculo", "Una macro"], c: 0, e: "La tabla dinámica agrupa y resume miles de filas en segundos, sin fórmulas." },
        { q: "SI.ERROR sirve para…", o: ["Sumar", "Controlar errores", "Ordenar", "Filtrar"], c: 1, e: "SI.ERROR(fórmula; valor) muestra un valor alternativo en lugar de #N/A o #DIV/0!." }] },
    { id: "tesis", nombre: "Redacción académica y tesis", area: "Todas las carreras", color: "#E11D48", ico: "“", prof: "Dra. Carmen Rojas", horas: 15,
      desc: "Del tema a la sustentación: planteamiento, marco teórico, citas APA y cómo defender tu trabajo.",
      mods: [
        { t: "Elegir y plantear", l: [L("Cómo elegir un tema viable", 12, "video", ["Un buen tema es interesante, acotado y con datos disponibles.", "Parte de un problema, no de un título.", "Valida con tu asesor temprano."]), L("Problema, objetivos e hipótesis", 16, "video", ["La pregunta guía todo el trabajo.", "Objetivo general y específicos coherentes.", "La hipótesis debe poder contrastarse."])] },
        { t: "Escribir con rigor", l: [L("Marco teórico y antecedentes", 14, "lectura", ["Busca en Scielo, Google Académico y repositorios.", "Antecedentes: qué hallaron otros y qué falta.", "Organiza por conceptos, no por autores."]), L("Citas y referencias APA 7", 15, "video", ["Cita en el texto: (Autor, año).", "La lista de referencias va en orden alfabético.", "Usa un gestor como Zotero."]), L("Evitar el plagio", 10, "lectura", ["Parafrasea y cita siempre la fuente.", "El software antiplagio compara con bases de datos.", "Una buena paráfrasis cambia la estructura, no solo las palabras."])] },
        { t: "Sustentar", l: [L("Diapositivas y exposición", 12, "video", ["Una idea por diapositiva.", "Ensaya con tiempo cronometrado.", "Prepara las preguntas más probables."])] }
      ],
      examen: [
        { q: "Un buen tema de tesis es…", o: ["Amplio y general", "Acotado y viable", "El más popular", "Sin datos"], c: 1, e: "Un tema acotado y viable se puede terminar en el tiempo y con los datos que tienes." },
        { q: "La lista de referencias APA va…", o: ["Por fecha", "En orden alfabético", "Por tema", "Al azar"], c: 1, e: "En APA 7 la lista de referencias se ordena alfabéticamente por apellido." },
        { q: "Una cita en APA 7 es…", o: ["[1]", "(Autor, año)", "Autor-año-pág.", "Nota al pie"], c: 1, e: "APA 7 usa autor-fecha entre paréntesis: (Autor, año)." },
        { q: "Parafrasear correctamente implica…", o: ["Cambiar palabras sueltas", "Reescribir y citar la fuente", "Copiar entre comillas sin cita", "Omitir al autor"], c: 1, e: "Parafrasear es explicar con tus palabras, pero la idea sigue siendo ajena: hay que citarla." },
        { q: "El marco teórico se organiza por…", o: ["Autores", "Conceptos", "Años", "Países"], c: 1, e: "Se ordena por conceptos (variables) y no por autores, para que el argumento fluya." }] }
  ];
  const UNIS = ["Universidad Nacional Andina", "Universidad del Pacífico Norte", "Instituto Superior Horizonte"];
  const RUTAS = [
    { id: "datos", nombre: "Analista de datos", ico: "📊", desc: "De Excel a Python pasando por estadística.", cursos: ["excel", "estadistica", "python"] },
    { id: "negocios", nombre: "Gestión de negocios", ico: "💼", desc: "Ordena las cuentas y domina las hojas de cálculo.", cursos: ["contabilidad", "excel"] },
    { id: "investigador", nombre: "Tesis con método", ico: "🎓", desc: "Estadística y redacción para titularte.", cursos: ["estadistica", "tesis"] },
    { id: "ingeniero", nombre: "Ingeniería aplicada", ico: "⚙️", desc: "Cálculo y programación para tus proyectos.", cursos: ["calculo", "python"] }
  ];
  r.DATOS = { CURSOS, UNIS, RUTAS };
  if (typeof module !== "undefined") module.exports = r.DATOS;
})(typeof window !== "undefined" ? window : globalThis);
