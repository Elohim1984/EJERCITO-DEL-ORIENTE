/* =====================================================================
   CONTROL ESCOLAR — núcleo: entrada, menú, datos compartidos y utilidades
   ===================================================================== */
(function () {
  var CLAVE_LS = "edo_clave_dir";

  var CE = window.CE = {
    clave: "",
    P: null,             // datos de la escuela combinados (config.js + hoja)
    guardados: {},       // filas "config:*" tal como están en la hoja
    alumnos: [],
    incidencias: [],
    grupoActual: "",
    tabs: {},            // id -> { titulo, render(cont) }
    grupoNav: "inicio",
    tab: "inicio"
  };

  /* ---------------- Menú: igual que el portal Amado Nervo ---------------- */
  CE.NAV = [
    { id: "inicio",       ico: "🏫", label: "Inicio",            tabs: ["inicio"] },
    { id: "datosescuela", ico: "🪪", label: "Datos Esc.",        tabs: ["datosescuela"] },
    { id: "alumnos",      ico: "👥", label: "Alumnos",           tabs: ["inscripciones", "directorio", "estadistica", "asistencia", "calificaciones", "incidencias"] },
    { id: "diagnosticos", ico: "🧭", label: "Diagnósticos",      tabs: ["diagnostico", "resultadosdx", "eia"] },
    { id: "pic",          ico: "🌱", label: "Programa Analítico y PIC", tabs: ["pic"] },
    { id: "comunicacion", ico: "📣", label: "Comunicación",      tabs: ["avisos", "calendario"] },
    { id: "gestion",      ico: "🏛️", label: "Gestión escolar",   tabs: ["cte", "reglamento", "consejo", "documentos", "personal"] },
    { id: "recursos",     ico: "📚", label: "Recursos",          tabs: ["recursos"] }
  ];
  CE.TITULOS = {
    inicio: "Inicio", datosescuela: "Datos de la escuela",
    inscripciones: "Inscripciones", directorio: "Directorio", estadistica: "Estadística",
    asistencia: "Asistencia", calificaciones: "Calificaciones", incidencias: "Incidencias",
    diagnostico: "Diagnóstico", resultadosdx: "Resultados del ciclo", eia: "EIA · Fase 6",
    pic: "Programa Analítico y PIC", avisos: "Avisos", calendario: "Calendario",
    cte: "CTE", reglamento: "Reglamento", consejo: "Consejo Escolar", documentos: "Documentos de Dirección",
    personal: "Personal del Plantel", recursos: "Recursos"
  };

  /* ---------------- Utilidades ---------------- */
  var MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  CE.$ = function (s, r) { return (r || document).querySelector(s); };
  CE.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  CE.esc = function (t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  CE.lleno = function (v) { return v != null && String(v).trim() !== ""; };
  CE.normal = function (t) { return String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/\s+/g, " ").trim(); };
  CE.hoyISO = function () { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
  CE.nuevoId = function () { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); };
  CE.fecha = function (iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
    return m ? (m[3] + " " + MESES[+m[2] - 1] + " " + m[1]) : String(iso || "");
  };
  CE.edad = function (nac, ref) {
    var a = /^(\d{4})-(\d{2})-(\d{2})/.exec(nac || ""), b = /^(\d{4})-(\d{2})-(\d{2})/.exec(ref || CE.hoyISO());
    if (!a || !b) return null;
    var e = +b[1] - +a[1];
    if (+b[2] < +a[2] || (+b[2] === +a[2] && +b[3] < +a[3])) e--;
    return e;
  };
  // Fecha de nacimiento a partir de la CURP (posiciones 5-10: AAMMDD)
  CE.nacDeCurp = function (curp) {
    var m = /^[A-Z]{4}(\d{2})(\d{2})(\d{2})/.exec(CE.normal(curp));
    if (!m) return "";
    var anio = +m[1] + (+m[1] > 30 ? 1900 : 2000);
    return anio + "-" + m[2] + "-" + m[3];
  };
  CE.sexoDeCurp = function (curp) { var c = CE.normal(curp).charAt(10); return c === "H" ? "H" : (c === "M" ? "M" : ""); };

  CE.grupos = function () { return ((CE.P && CE.P.grupos) || []).filter(function (g) { return CE.lleno(g.grado); }); };
  CE.nombreGrupo = function (g) { return (g.grado || "") + (CE.lleno(g.grupo) ? " “" + g.grupo + "”" : ""); };
  CE.idGrupo = function (g) { return ((g.grado || "") + "-" + (g.grupo || "")).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "").toUpperCase() || "SINGRUPO"; };
  CE.textoGrupo = function (gid) { var g = CE.grupos().find(function (x) { return CE.idGrupo(x) === gid; }); return g ? CE.nombreGrupo(g) : "Sin grupo"; };
  CE.opcionesGrupo = function (conTodos, sel) {
    return (conTodos ? '<option value="">Todos los grupos</option>' : "") + CE.grupos().map(function (g) {
      var id = CE.idGrupo(g);
      return '<option value="' + CE.esc(id) + '"' + (id === sel ? " selected" : "") + ">" + CE.esc(CE.nombreGrupo(g)) + "</option>";
    }).join("");
  };
  // Recuerda el último grupo elegido para no tener que escogerlo en cada pestaña
  CE.grupoInicial = function () {
    var gs = CE.grupos();
    if (CE.grupoActual && gs.some(function (g) { return CE.idGrupo(g) === CE.grupoActual; })) return CE.grupoActual;
    return gs.length ? CE.idGrupo(gs[0]) : "";
  };
  CE.nombreCompleto = function (a) { return [a.apPaterno, a.apMaterno, a.nombres].filter(CE.lleno).join(" "); };
  CE.ordenar = function (lista) { return lista.slice().sort(function (a, b) { return CE.nombreCompleto(a).localeCompare(CE.nombreCompleto(b), "es"); }); };
  CE.delGrupo = function (gid) { return CE.ordenar(CE.alumnos.filter(function (a) { return !gid || a.grupo === gid; })); };
  CE.opcionesLista = function (lista, sel, vacio) {
    return (vacio != null ? '<option value="">' + CE.esc(vacio) + "</option>" : "") + lista.map(function (o) {
      return "<option" + (o === sel ? " selected" : "") + ">" + CE.esc(o) + "</option>";
    }).join("");
  };

  CE.avisar = function (texto, error) {
    var t = CE.$("#toast");
    t.textContent = texto; t.className = "ce-toast ver" + (error ? " error" : "");
    clearTimeout(CE._t); CE._t = setTimeout(function () { t.className = "ce-toast" + (error ? " error" : ""); }, error ? 5000 : 2600);
  };

  // Ejecuta una acción de guardado una sola vez aunque se toque el botón dos veces
  CE.unaVez = function (boton, accion) {
    if (!boton || boton.disabled) return;
    var texto = boton.textContent;
    boton.disabled = true; boton.textContent = "Guardando…";
    return Promise.resolve().then(accion).catch(function (e) {
      CE.avisar("No se guardó: " + (e && e.message ? e.message : e), true);
    }).then(function () { boton.disabled = false; boton.textContent = texto; });
  };

  CE.guardar = function (clave, valor) { return HOJA.guardar(clave, valor, CE.clave); };
  CE.borrar = function (clave) { return HOJA.borrar(clave, CE.clave); };
  CE.leer = function (prefijo) { return HOJA.leerPrivado(prefijo, CE.clave); };

  // Guarda datos de la escuela sin borrar lo que se haya llenado en otra pantalla
  CE.guardarConfig = function (paso, valor, mezclar) {
    var final = valor;
    if (mezclar) {
      var previo = CE.guardados["config:" + paso];
      final = Object.assign({}, (previo && typeof previo === "object" && !Array.isArray(previo)) ? previo : {}, valor);
    }
    return CE.guardar("config:" + paso, final).then(function () {
      CE.guardados["config:" + paso] = final;
      CE.P = HOJA.combinar(window.PORTAL, CE.guardados);
      CE.pintarEncabezado();
    });
  };

  CE.refrescarAlumnos = function () {
    return CE.leer("alumno:").then(function (r) {
      CE.alumnos = Object.keys(r).map(function (k) { return r[k]; }).filter(function (a) { return a && a.id; });
    }).catch(function () {});
  };

  CE.vacio = function (texto) { return '<p class="vacio" style="padding:14px 0">' + texto + "</p>"; };
  CE.sinGrupos = function () {
    return CE.grupos().length ? "" :
      '<div class="nota"><b>Primero registre los grupos</b> en <a href="configuracion.html">Configuración → Grupos</a>.</div>';
  };

  /* ---------------- Menú ---------------- */
  function pintarNav() {
    CE.$("#nav-grupos").innerHTML = CE.NAV.map(function (g) {
      return '<button type="button" data-grupo="' + g.id + '" aria-current="' + (g.id === CE.grupoNav) + '"><span class="ico" aria-hidden="true">' + g.ico + "</span>" + CE.esc(g.label) + "</button>";
    }).join("");
    var g = CE.NAV.find(function (x) { return x.id === CE.grupoNav; });
    var sub = CE.$("#nav-tabs");
    sub.hidden = g.tabs.length < 2;
    sub.innerHTML = g.tabs.length < 2 ? "" : g.tabs.map(function (t) {
      return '<button type="button" data-tab="' + t + '" aria-current="' + (t === CE.tab) + '">' + CE.esc(CE.TITULOS[t]) + "</button>";
    }).join("");
  }
  CE.ir = function (tab) {
    var g = CE.NAV.find(function (x) { return x.tabs.indexOf(tab) >= 0; });
    if (!g) return;
    CE.grupoNav = g.id; CE.tab = tab;
    try { sessionStorage.setItem("edo_ce_tab", tab); } catch (e) {}
    pintarNav();
    var cont = CE.$("#vista");
    var def = CE.tabs[tab];
    cont.innerHTML = "";
    if (def) def.render(cont); else CE.pendiente(cont, tab);
    window.scrollTo({ top: 0 });
  };
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest("[data-grupo]");
    if (b) { var g = CE.NAV.find(function (x) { return x.id === b.getAttribute("data-grupo"); }); CE.ir(g.tabs[0]); return; }
    var t = ev.target.closest("[data-tab]");
    if (t && t.closest("#nav-tabs")) CE.ir(t.getAttribute("data-tab"));
    var irA = ev.target.closest("[data-ir]");
    if (irA) CE.ir(irA.getAttribute("data-ir"));
  });

  CE.pintarEncabezado = function () {
    var E = CE.P.escuela;
    CE.$("#titulo-escuela").textContent = (E.tipo ? E.tipo + " " : "") + "“" + E.nombre + "”";
    CE.$("#ciclo").textContent = E.ciclo || "";
  };

  /* Secciones que se construyen en las siguientes etapas */
  var PENDIENTES = {
    diagnostico: "Examen diagnóstico, diagnóstico integral (socioemocional, familiar y de contexto) y estilos de aprendizaje, con las respuestas de los alumnos inscritos.",
    resultadosdx: "Gráficas y análisis de los resultados de los diagnósticos por grupo.",
    eia: "Ejercicios Integradores del Aprendizaje (Fase 6): los alumnos responden en pantalla y el docente valora con la rúbrica oficial.",
    pic: "Resultados y análisis, Programa Analítico por campos formativos y Proyecto de Integración Comunitaria (PIC).",
    cte: "Registro de las sesiones del Consejo Técnico Escolar: fecha, acuerdos y seguimiento.",
    reglamento: "Reglamento de Convivencia Escolar basado en el Manual de SEP Puebla, para alumnos y familias.",
    consejo: "Consejo Escolar de Participación y Asociación de Padres de Familia: integrantes y cargos.",
    documentos: "Documentos oficiales de dirección (actas de la Asociación de Padres de Familia, listas e informes) listos para imprimir."
  };
  CE.pendiente = function (cont, tab) {
    cont.innerHTML = '<section class="panel"><h2>' + CE.esc(CE.TITULOS[tab]) + '</h2><p class="ayuda">' + CE.esc(PENDIENTES[tab] || "") +
      '</p><div class="nota"><b>En preparación.</b> Esta sección se agrega en la siguiente etapa del portal.</div></section>';
  };

  /* ---------------- Entrada ---------------- */
  CE.iniciar = function () {
    var err = CE.$("#gate-error"), btn = CE.$("#btn-entrar");
    function entrar(c, silencioso) {
      if (!HOJA.liga()) { err.textContent = "Primero hay que conectar la hoja de Google en Configuración."; return Promise.resolve(); }
      btn.disabled = true; btn.textContent = "Entrando…"; err.textContent = "";
      return HOJA.verificar(HOJA.liga(), c).then(function (r) {
        if (!r || !r.ok || !r.valida) throw new Error("La clave no es correcta.");
        return HOJA.version();
      }).then(function (v) {
        if (v < 2) throw new Error("Falta actualizar el código de la hoja de Google. Avise a quien administra el portal.");
        CE.clave = c;
        try { (CE.$("#recordar").checked ? localStorage : sessionStorage).setItem(CLAVE_LS, c); } catch (e) {}
        return abrir();
      }).catch(function (e) {
        if (!silencioso) err.textContent = /fetch|Network|Load failed|JSON/i.test(e.message) ? "No se pudo conectar con la hoja de la escuela. Revise su internet." : e.message;
      }).then(function () { btn.disabled = false; btn.textContent = "Entrar"; });
    }
    CE.$("#form-entrada").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var c = CE.$("#codigo").value.trim().toUpperCase();
      if (!c) { err.textContent = "Escriba la clave."; return; }
      entrar(c);
    });
    CE.$("#btn-salir").addEventListener("click", function () {
      try { localStorage.removeItem(CLAVE_LS); sessionStorage.removeItem(CLAVE_LS); localStorage.removeItem("edo_portal_ok"); sessionStorage.removeItem("edo_portal_ok"); } catch (e) {}
      location.href = "index.html";
    });
    try {
      var g = localStorage.getItem(CLAVE_LS) || sessionStorage.getItem(CLAVE_LS);
      if (g) { CE.$("#codigo").value = g; CE.$("#gate-sub").textContent = "Abriendo…"; entrar(g, true).then(function () { CE.$("#gate-sub").textContent = "Escriba la clave para entrar."; }); }
    } catch (e) {}
  };

  function abrir() {
    return Promise.all([HOJA.leerTodo("config:"), CE.leer("alumno:"), CE.leer("inc:")]).then(function (r) {
      CE.guardados = r[0] || {};
      CE.P = HOJA.combinar(window.PORTAL, CE.guardados);
      CE.alumnos = Object.keys(r[1]).map(function (k) { return r[1][k]; }).filter(function (a) { return a && a.id; });
      CE.incidencias = Object.keys(r[2]).map(function (k) { return r[2][k]; }).filter(function (c) { return c && c.id; });
      CE.$("#gate").style.display = "none";
      CE.$("#portal").style.display = "block";
      CE.pintarEncabezado();
      var t = "inicio";
      try { t = sessionStorage.getItem("edo_ce_tab") || "inicio"; } catch (e) {}
      CE.ir(t);
    });
  }
})();
