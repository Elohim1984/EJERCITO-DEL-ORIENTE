/* =====================================================================
   CONTROL ESCOLAR — Inicio, Datos de la escuela, Comunicación, Personal y Recursos
   ===================================================================== */
(function () {
  var CE = window.CE, $ = CE.$, $$ = CE.$$, esc = CE.esc, lleno = CE.lleno;

  /* ---------------- Inicio ---------------- */
  CE.tabs.inicio = { render: function (cont) {
    var A = CE.alumnos, abiertas = CE.incidencias.filter(function (c) { return c.estatus !== "Cerrado"; }).length;
    var avisos = (CE.P.avisos || []).filter(function (a) { return lleno(a.titulo); }).slice(0, 3);
    var hoy = CE.hoyISO();
    var proximas = (CE.P.calendario.fechas || []).filter(function (f) { return f.fecha >= hoy && lleno(f.evento); }).sort(function (a, b) { return a.fecha.localeCompare(b.fecha); }).slice(0, 4);
    cont.innerHTML = '<section class="panel"><h2>Bienvenido</h2><p class="ayuda">Hoy es ' + esc(CE.fecha(hoy)) + ". Elija lo que necesita hacer:</p>" +
      '<div class="ce-accesos">' +
      [["asistencia", "✅", "Pasar lista"], ["inscripciones", "📝", "Inscribir alumno"], ["calificaciones", "📒", "Calificaciones"], ["incidencias", "🛡️", "Registrar incidencia"], ["avisos", "📣", "Publicar aviso"], ["directorio", "📞", "Directorio"]]
        .map(function (x) { return '<button class="ce-acceso" data-ir="' + x[0] + '"><span class="ico" aria-hidden="true">' + x[1] + "</span>" + x[2] + "</button>"; }).join("") + "</div>" +
      '<div class="ce-kpis">' + [[A.length, "Alumnos inscritos"], [CE.grupos().length, "Grupos"], [abiertas, "Incidencias abiertas"], [(CE.P.personal.docentes || []).length + (lleno(CE.P.personal.director) ? 1 : 0), "Personal"]]
        .map(function (k) { return '<div class="ce-kpi"><b>' + k[0] + "</b><span>" + k[1] + "</span></div>"; }).join("") + "</div>" +
      '<h3 style="font-size:19px;margin:6px 0 10px">Lista de hoy por grupo</h3><div id="h-listas" class="conteo">Revisando…</div>' +
      (avisos.length ? '<h3 style="font-size:19px;margin:24px 0 10px">Avisos recientes</h3>' + avisos.map(function (a) { return '<article class="aviso" style="margin-bottom:10px"><h3>' + esc(a.titulo) + "</h3>" + (a.fecha ? "<time>" + esc(CE.fecha(a.fecha)) + "</time>" : "") + "<p>" + esc(a.texto) + "</p></article>"; }).join("") : "") +
      (proximas.length ? '<h3 style="font-size:19px;margin:24px 0 10px">Próximas fechas</h3><ul class="fechas" style="border-top:1px solid var(--line);border-radius:6px;padding-top:14px">' + proximas.map(function (f) { return "<li><time>" + esc(CE.fecha(f.fecha)) + "</time><span>" + esc(f.evento) + "</span></li>"; }).join("") + "</ul>" : "") +
      "</section>";
    var gs = CE.grupos();
    if (!gs.length) { $("#h-listas").innerHTML = 'Aún no hay grupos registrados. <a href="configuracion.html">Registrar grupos</a>'; return; }
    Promise.all(gs.map(function (g) { return CE.leer("asis:" + CE.idGrupo(g) + ":" + hoy).catch(function () { return {}; }); })).then(function (rs) {
      $("#h-listas").innerHTML = gs.map(function (g, i) {
        var ok = Object.keys(rs[i] || {}).length > 0;
        return '<div style="padding:4px 0">' + (ok ? "✅ " : "⏳ ") + esc(CE.nombreGrupo(g)) + ": " + (ok ? "lista guardada" : '<button class="btn-mini" data-ir="asistencia">Pasar lista</button>') + "</div>";
      }).join("");
    });
  } };

  /* ---------------- Datos de la escuela (mismos datos que pide Amado Nervo) ---------------- */
  var CAMPOS_ESCUELA = [
    ["nombre", "Nombre de la escuela"], ["tipo", "Tipo / nivel"], ["cct", "CCT (Clave de Centro de Trabajo)"], ["modalidad", "Modalidad (según lo pida el documento oficial)"],
    ["turno", "Turno"], ["sostenimiento", "Sostenimiento"], ["domicilio", "Dirección de la escuela"], ["localidad", "Población o colonia"], ["municipio", "Municipio"],
    ["estado", "Estado"], ["cp", "Código postal"], ["zona", "Zona (rural o urbana)"], ["zonaEscolar", "Zona escolar"], ["sector", "Sector"], ["telefono", "Teléfono de la escuela"],
    ["correo", "Correo de la escuela"], ["corde", "CORDE (Coordinación de Desarrollo Educativo)"], ["supervisor", "Nombre de quien supervisa la zona"], ["ciclo", "Ciclo escolar"]
  ];
  CE.tabs.datosescuela = { render: function (cont) {
    var E = Object.assign({}, CE.P.escuela, CE.guardados["config:escuela"] || {});
    cont.innerHTML = '<section class="panel"><h2>Datos de la escuela</h2><p class="ayuda">Estos datos aparecen en el portal y en los documentos que se imprimen (cédulas, formatos y actas).</p><div class="campos">' +
      CAMPOS_ESCUELA.map(function (c) { return '<div class="campo"><label for="de-' + c[0] + '">' + esc(c[1]) + '</label><input id="de-' + c[0] + '" data-de="' + c[0] + '" value="' + esc(E[c[0]] || "") + '" /></div>'; }).join("") +
      '</div><div class="acciones"><button class="btn btn-pri" id="de-guardar">Guardar datos de la escuela</button></div></section>';
    $("#de-guardar").addEventListener("click", function () {
      var v = {}; $$("[data-de]").forEach(function (i) { v[i.getAttribute("data-de")] = i.value.trim(); });
      if (!lleno(v.nombre)) { CE.avisar("El nombre de la escuela no puede quedar vacío.", true); return; }
      CE.unaVez(this, function () { return CE.guardarConfig("escuela", v, true).then(function () { CE.avisar("Datos guardados"); }); });
    });
  } };

  /* ---------------- Avisos ---------------- */
  CE.tabs.avisos = { render: function (cont) {
    cont.innerHTML = '<section class="panel"><h2>Avisos</h2><p class="ayuda">Los avisos aparecen al principio del portal. Borre los que ya no estén vigentes.</p>' +
      '<div class="formulario-caja"><h3>Nuevo aviso</h3><div class="campos"><div class="campo"><label for="av-t">Título</label><input id="av-t" /></div><div class="campo"><label for="av-f">Fecha</label><input id="av-f" type="date" value="' + CE.hoyISO() + '" /></div>' +
      '<div class="campo" style="grid-column:1/-1"><label for="av-x">Texto del aviso</label><textarea id="av-x"></textarea></div></div><div class="acciones"><button class="btn btn-pri" id="av-pub">Publicar aviso</button></div></div><div id="av-lista"></div></section>';
    function lista() { return (CE.P.avisos || []).filter(function (a) { return lleno(a.titulo) || lleno(a.texto); }); }
    function pintar() {
      var l = lista();
      $("#av-lista").innerHTML = l.length ? l.map(function (a, i) { return '<article class="aviso" style="margin-bottom:10px"><h3>' + esc(a.titulo) + "</h3>" + (a.fecha ? "<time>" + esc(CE.fecha(a.fecha)) + "</time>" : "") + "<p>" + esc(a.texto) + '</p><div class="acciones" style="margin-top:8px"><button class="btn-mini peligro" data-avdel="' + i + '">Quitar aviso</button></div></article>'; }).join("") : CE.vacio("No hay avisos publicados.");
    }
    $("#av-pub").addEventListener("click", function () {
      var a = { titulo: $("#av-t").value.trim(), fecha: $("#av-f").value, texto: $("#av-x").value.trim() };
      if (!lleno(a.titulo)) { CE.avisar("Escriba el título del aviso.", true); return; }
      var l = lista();
      if (l.some(function (x) { return CE.normal(x.titulo) === CE.normal(a.titulo) && x.fecha === a.fecha; })) { CE.avisar("Ese aviso ya está publicado.", true); return; }
      CE.unaVez(this, function () { return CE.guardarConfig("avisos", [a].concat(l)).then(function () { $("#av-t").value = ""; $("#av-x").value = ""; pintar(); CE.avisar("Aviso publicado"); }); });
    });
    $("#av-lista").addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-avdel]"); if (!b || !confirm("¿Quitar este aviso del portal?")) return;
      var l = lista(); l.splice(+b.getAttribute("data-avdel"), 1);
      CE.unaVez(b, function () { return CE.guardarConfig("avisos", l).then(function () { pintar(); CE.avisar("Aviso quitado"); }); });
    });
    pintar();
  } };

  /* ---------------- Calendario ---------------- */
  CE.tabs.calendario = { render: function (cont) {
    var C = CE.P.calendario;
    cont.innerHTML = '<section class="panel"><h2>Calendario</h2><div class="campos">' +
      '<div class="campo"><label for="ca-i">Inicio de clases</label><input type="date" id="ca-i" value="' + esc(C.inicio) + '" /></div><div class="campo"><label for="ca-f">Fin del ciclo</label><input type="date" id="ca-f" value="' + esc(C.fin) + '" /></div>' +
      '<div class="campo"><label for="ca-d">Días efectivos de clase</label><input id="ca-d" value="' + esc(C.dias) + '" /></div><div class="campo"><label for="ca-o">Calendario oficial</label><input id="ca-o" value="' + esc(C.fuente) + '" /></div></div>' +
      '<div class="acciones"><button class="btn btn-pri" id="ca-g">Guardar fechas del ciclo</button></div>' +
      '<h3 style="font-size:19px;margin:26px 0 10px">Fechas importantes</h3><div class="formulario-caja"><div class="campos"><div class="campo"><label for="ca-nf">Fecha</label><input type="date" id="ca-nf" /></div><div class="campo"><label for="ca-ne">Evento</label><input id="ca-ne" placeholder="Ej. Sesión de CTE" /></div></div><div class="acciones"><button class="btn btn-pri" id="ca-add">Agregar fecha</button></div></div>' +
      '<div id="ca-lista"></div></section>';
    function fechas() { return (CE.P.calendario.fechas || []).slice().sort(function (a, b) { return String(a.fecha).localeCompare(String(b.fecha)); }); }
    function base() { var c = CE.P.calendario; return { inicio: c.inicio, fin: c.fin, dias: c.dias, fuente: c.fuente, fechas: fechas() }; }
    function pintar() {
      var l = fechas();
      $("#ca-lista").innerHTML = l.length ? '<table class="tabla"><tbody>' + l.map(function (f, i) { return '<tr><td class="mono" style="width:130px">' + esc(CE.fecha(f.fecha)) + "</td><td>" + esc(f.evento) + '</td><td style="width:90px"><button class="btn-mini peligro" data-cadel="' + i + '">Quitar</button></td></tr>'; }).join("") + "</tbody></table>" : CE.vacio("No hay fechas importantes registradas.");
    }
    $("#ca-g").addEventListener("click", function () {
      var v = base(); v.inicio = $("#ca-i").value; v.fin = $("#ca-f").value; v.dias = $("#ca-d").value.trim(); v.fuente = $("#ca-o").value.trim();
      CE.unaVez(this, function () { return CE.guardarConfig("calendario", v).then(function () { CE.avisar("Calendario guardado"); }); });
    });
    $("#ca-add").addEventListener("click", function () {
      var f = { fecha: $("#ca-nf").value, evento: $("#ca-ne").value.trim() };
      if (!f.fecha || !lleno(f.evento)) { CE.avisar("Escriba la fecha y el evento.", true); return; }
      var v = base();
      if (v.fechas.some(function (x) { return x.fecha === f.fecha && CE.normal(x.evento) === CE.normal(f.evento); })) { CE.avisar("Esa fecha ya está registrada.", true); return; }
      v.fechas.push(f);
      CE.unaVez(this, function () { return CE.guardarConfig("calendario", v).then(function () { $("#ca-ne").value = ""; pintar(); CE.avisar("Fecha agregada"); }); });
    });
    $("#ca-lista").addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-cadel]"); if (!b) return;
      var v = base(); v.fechas.splice(+b.getAttribute("data-cadel"), 1);
      CE.unaVez(b, function () { return CE.guardarConfig("calendario", v).then(function () { pintar(); CE.avisar("Fecha quitada"); }); });
    });
    pintar();
  } };

  /* ---------------- Personal del Plantel ---------------- */
  CE.tabs.personal = { render: function (cont) {
    var per = CE.P.personal || { director: "", docentes: [] };
    cont.innerHTML = '<section class="panel"><h2>Personal del Plantel</h2><p class="ayuda">Aparece en "Nuestro equipo" del portal y en los documentos de dirección.</p>' +
      '<div class="campos"><div class="campo"><label for="pe-dir">Director o directora</label><input id="pe-dir" value="' + esc(per.director || "") + '" /></div></div>' +
      '<h3 style="font-size:19px;margin:22px 0 10px">Docentes y personal</h3><div class="formulario-caja"><div class="campos"><div class="campo"><label for="pe-n">Nombre completo</label><input id="pe-n" /></div><div class="campo"><label for="pe-c">Cargo o grado</label><input id="pe-c" placeholder="Ej. Docente de 1°" /></div></div><div class="acciones"><button class="btn btn-pri" id="pe-add">Agregar</button></div></div>' +
      '<div id="pe-lista"></div><div class="acciones"><button class="btn btn-pri" id="pe-g">Guardar director o directora</button></div></section>';
    function base() { var p = CE.P.personal || {}; return { director: p.director || "", docentes: (p.docentes || []).slice() }; }
    function pintar() {
      var l = base().docentes;
      $("#pe-lista").innerHTML = l.length ? '<table class="tabla"><tbody>' + l.map(function (d, i) { return "<tr><td>" + esc(d.nombre) + '</td><td class="conteo">' + esc(d.cargo || "") + '</td><td style="width:90px"><button class="btn-mini peligro" data-pedel="' + i + '">Quitar</button></td></tr>'; }).join("") + "</tbody></table>" : CE.vacio("No hay docentes registrados.");
    }
    $("#pe-add").addEventListener("click", function () {
      var d = { nombre: $("#pe-n").value.trim(), cargo: $("#pe-c").value.trim() };
      if (!lleno(d.nombre)) { CE.avisar("Escriba el nombre.", true); return; }
      var v = base();
      if (v.docentes.some(function (x) { return CE.normal(x.nombre) === CE.normal(d.nombre); })) { CE.avisar("Esa persona ya está registrada.", true); return; }
      v.docentes.push(d);
      CE.unaVez(this, function () { return CE.guardarConfig("personal", v).then(function () { $("#pe-n").value = ""; $("#pe-c").value = ""; pintar(); CE.avisar("Personal agregado"); }); });
    });
    $("#pe-g").addEventListener("click", function () {
      var v = base(); v.director = $("#pe-dir").value.trim();
      CE.unaVez(this, function () { return CE.guardarConfig("personal", v).then(function () { CE.avisar("Guardado"); }); });
    });
    $("#pe-lista").addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-pedel]"); if (!b || !confirm("¿Quitar a esta persona?")) return;
      var v = base(); v.docentes.splice(+b.getAttribute("data-pedel"), 1);
      CE.unaVez(b, function () { return CE.guardarConfig("personal", v).then(function () { pintar(); CE.avisar("Quitado"); }); });
    });
    pintar();
  } };

  /* ---------------- Recursos (ligas oficiales generales) ---------------- */
  var RECURSOS = [
    ["Directorio de telesecundarias de Puebla", "Datos abiertos del Gobierno de Puebla: municipio, localidad, clave y turno de cada telesecundaria estatal.", "https://datos.puebla.gob.mx/dataset/telesecundarias-estado-puebla"],
    ["Portal SEP Puebla", "Página oficial de la Secretaría de Educación del Estado de Puebla.", "https://sep.puebla.gob.mx/"],
    ["Manual para la Convivencia Escolar (SEP Puebla)", "Documento base para el reglamento de convivencia y la Ruta de Actuación ante incidencias.", "https://sep.puebla.gob.mx/images/site/Estudiantes/Direccion%20de%20Escuelas%20Particulares/Normatividad/Manual_para_la_convivencia_escolar.pdf"],
    ["Normatividad de Educación Básica SEP Puebla", "Lineamientos y normas vigentes para escuelas de educación básica.", "https://sep.puebla.gob.mx/index.php/estudiantes/direccion-de-escuelas-particulares/normatividad"],
    ["Consejo Técnico Escolar (guías nacionales)", "Guías oficiales de la SEP para cada sesión del Consejo Técnico Escolar.", "https://educacionbasica.sep.gob.mx/inicio/consejos-tecnicos-escolares/"],
    ["INEGI — Portal general", "Información estadística y geográfica de México.", "https://www.inegi.org.mx/"],
    ["Cuéntame de México (INEGI)", "Información de INEGI explicada para alumnos.", "https://cuentame.inegi.org.mx/"],
    ["Datos en Acción (INEGI)", "Materiales didácticos con datos reales para usar en clase.", "https://datosenaccion.inegi.org.mx/"]
  ];
  CE.tabs.recursos = { render: function (cont) {
    cont.innerHTML = '<section class="panel"><h2>Recursos</h2><p class="ayuda">Ligas oficiales de consulta para el personal de la escuela.</p><div class="cards" style="margin-bottom:0">' +
      RECURSOS.map(function (r) { return '<a class="pcard recurso" href="' + esc(r[2]) + '" target="_blank" rel="noopener"><span class="pcard-tag tag-azul">Liga oficial</span><h3>' + esc(r[0]) + "</h3><p>" + esc(r[1]) + '</p><span class="pcard-cta">Abrir →</span></a>'; }).join("") +
      "</div></section>";
  } };
})();
