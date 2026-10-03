/* =====================================================================
   CONTROL ESCOLAR — grupo "Alumnos":
   Inscripciones · Directorio · Estadística · Asistencia · Calificaciones · Incidencias
   ===================================================================== */
(function () {
  var CE = window.CE, $ = CE.$, $$ = CE.$$, esc = CE.esc, lleno = CE.lleno, normal = CE.normal;

  var ESTADOS_MX = ["Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas", "Extranjero"];
  var SN = ["Sí", "No"];

  /* ---------- Cédula de inscripción (mismos apartados que Amado Nervo) ---------- */
  function persona(pref, extra) {
    return [
      [pref + "_APELLIDO_PATERNO", "Apellido paterno"], [pref + "_APELLIDO_MATERNO", "Apellido materno"], [pref + "_NOMBRES", "Nombre(s)"],
      [pref + "_CURP", "CURP"], [pref + "_FECHA_NACIMIENTO", "Fecha de nacimiento", "fecha"], [pref + "_PAIS_NACIMIENTO", "País de nacimiento"]
    ].concat(extra).concat([
      [pref + "_NIVEL_ESTUDIOS", "Nivel de estudios"], [pref + "_VIVE_CON_ALUMNO", "¿Vive con el alumno?", SN],
      [pref + "_PAIS_RESIDENCIA", "País de residencia"], [pref + "_ENTIDAD", "Entidad", ESTADOS_MX], [pref + "_MUNICIPIO", "Municipio"],
      [pref + "_LOCALIDAD", "Localidad"], [pref + "_CP", "Código postal"], [pref + "_COLONIA", "Colonia"], [pref + "_CALLE", "Calle"],
      [pref + "_NUM_EXT", "Número exterior"], [pref + "_NUM_INT", "Número interior"], [pref + "_TELEFONO_FIJO", "Teléfono fijo", "tel"],
      [pref + "_CELULAR", "Celular", "tel"], [pref + "_EMAIL", "Correo electrónico", "email"], [pref + "_OCUPACION", "Ocupación"],
      [pref + "_HORARIO_TRABAJO", "Horario de trabajo"], [pref + "_TELEFONO_TRABAJO", "Teléfono de trabajo", "tel"],
      [pref + "_EXTENSION_TRABAJO", "Extensión de trabajo"], [pref + "_EMAIL_TRABAJO", "Correo electrónico de trabajo", "email"]
    ]);
  }
  var FICHA = [
    { id: "alumno", titulo: "Datos generales del alumno", abierto: true, campos: [
      ["nia", "NIA"], ["apPaterno", "Apellido paterno *"], ["apMaterno", "Apellido materno"], ["nombres", "Nombre(s) *"],
      ["grupo", "Grado y grupo *", "grupo"], ["curp", "CURP"], ["nacimiento", "Fecha de nacimiento", "fecha"],
      ["ALUMNO_PAIS_NACIMIENTO", "País de nacimiento"], ["ALUMNO_ENTIDAD_NACIMIENTO", "Entidad de nacimiento", ESTADOS_MX],
      ["sexo", "Género", [["H", "Hombre"], ["M", "Mujer"]]], ["ALUMNO_DISCAPACIDAD", "Discapacidad o aptitud diferenciada"],
      ["ALUMNO_TIPO_SANGRE", "Tipo de sangre"], ["ALUMNO_LENGUA_MATERNA", "Lengua materna"]
    ] },
    { id: "madre", titulo: "Datos de la madre", campos: persona("MADRE", [["MADRE_ES_TUTOR", "¿Es la tutora?", SN], ["MADRE_ES_FINADA", "¿Ha fallecido?", SN]]) },
    { id: "padre", titulo: "Datos del padre", campos: persona("PADRE", [["PADRE_ES_TUTOR", "¿Es el tutor?", SN], ["PADRE_ES_FINADO", "¿Ha fallecido?", SN]]) },
    { id: "tutor", titulo: "Datos del tutor (si es otra persona)", campos: persona("TUTOR", [["TUTOR_PARENTESCO", "Parentesco"], ["TUTOR_ES_TUTOR_LEGAL", "¿Es tutor legal?", SN]]) },
    { id: "documento", titulo: "Documento probatorio", campos: [
      ["DOC_MUNICIPIO_REGISTRO", "Municipio de registro"], ["DOC_ENTIDAD_REGISTRO", "Entidad de registro", ESTADOS_MX], ["DOC_ANIO_REGISTRO", "Año de registro"],
      ["DOC_LIBRO", "Libro"], ["DOC_ACTA", "Acta"], ["DOC_CRIP", "CRIP"], ["DOC_RNE", "Número de registro nacional de extranjeros"],
      ["DOC_FOLIO_NATURALIZACION", "Folio de naturalización"], ["DOC_FOLIO_FICHA", "Folio de ficha"], ["DOC_NUM_JUZGADO", "Número de juzgado"],
      ["DOC_NO_ENTREGO_DOCUMENTO", "¿No entregó documento probatorio?", SN], ["DOC_OBSERVACIONES", "Observaciones", "area"]
    ] }
  ];
  var DIRECTOS = ["nia", "apPaterno", "apMaterno", "nombres", "grupo", "curp", "nacimiento", "sexo"];

  function valorCampo(a, k) { return DIRECTOS.indexOf(k) >= 0 ? (a[k] || "") : ((a.ficha || {})[k] || ""); }
  function campoHTML(c, a) {
    var k = c[0], etq = c[1], tipo = c[2], v = valorCampo(a, k), id = "f-" + k;
    var ctrl;
    if (tipo === "grupo") ctrl = '<select id="' + id + '" data-k="' + k + '">' + CE.opcionesGrupo(false, v || CE.grupoInicial()) + "</select>";
    else if (Array.isArray(tipo)) ctrl = '<select id="' + id + '" data-k="' + k + '"><option value="">—</option>' + tipo.map(function (o) {
      var val = Array.isArray(o) ? o[0] : o, txt = Array.isArray(o) ? o[1] : o;
      return '<option value="' + esc(val) + '"' + (val === v ? " selected" : "") + ">" + esc(txt) + "</option>";
    }).join("") + "</select>";
    else if (tipo === "area") ctrl = '<textarea id="' + id + '" data-k="' + k + '">' + esc(v) + "</textarea>";
    else ctrl = '<input id="' + id + '" data-k="' + k + '" type="' + (tipo === "fecha" ? "date" : tipo === "tel" ? "tel" : tipo === "email" ? "email" : "text") + '" value="' + esc(v) + '"' + (/CURP$/i.test(k) || k === "curp" ? ' maxlength="18" class="mono"' : "") + " />";
    return '<div class="campo"' + (tipo === "area" ? ' style="grid-column:1/-1"' : "") + '><label for="' + id + '">' + esc(etq) + "</label>" + ctrl + "</div>";
  }

  // Quién es el tutor y su teléfono, a partir de la cédula
  function tutorDe(a) {
    var f = a.ficha || {};
    function nombre(p) { return [f[p + "_NOMBRES"], f[p + "_APELLIDO_PATERNO"], f[p + "_APELLIDO_MATERNO"]].filter(lleno).join(" "); }
    function tel(p) { return f[p + "_CELULAR"] || f[p + "_TELEFONO_FIJO"] || ""; }
    var orden = [];
    if (lleno(f.TUTOR_NOMBRES)) orden.push("TUTOR");
    if (f.MADRE_ES_TUTOR === "Sí") orden.push("MADRE");
    if (f.PADRE_ES_TUTOR === "Sí") orden.push("PADRE");
    orden.push("MADRE", "PADRE");
    for (var i = 0; i < orden.length; i++) if (lleno(nombre(orden[i]))) return { nombre: nombre(orden[i]), telefono: tel(orden[i]) };
    return null;
  }
  function buscarDuplicado(a) {
    return CE.alumnos.find(function (x) {
      if (x.id === a.id) return false;
      if (lleno(a.curp) && normal(x.curp) === normal(a.curp)) return true;
      return normal(CE.nombreCompleto(x)) === normal(CE.nombreCompleto(a));
    });
  }

  /* =====================================================================
     INSCRIPCIONES
     ===================================================================== */
  CE.tabs.inscripciones = { render: function (cont) {
    var filtro = { grupo: CE.grupoActual || "", q: "" };
    cont.innerHTML = '<section class="panel"><h2>Inscripciones</h2>' +
      '<p class="ayuda">Cédula de inscripción de cada alumno. Solo el nombre y el grupo son obligatorios; lo demás se puede completar después con <b>Editar</b>.</p>' +
      CE.sinGrupos() +
      '<div class="barra-filtros"><div class="campo"><label for="i-grupo">Ver grupo</label><select id="i-grupo">' + CE.opcionesGrupo(true, filtro.grupo) + "</select></div>" +
      '<div class="campo"><label for="i-buscar">Buscar</label><input id="i-buscar" placeholder="Nombre, NIA o CURP" /></div>' +
      '<button class="btn btn-pri" id="i-nuevo">+ Inscribir alumno</button><button class="btn btn-sec" id="i-pegar">Pegar lista</button></div>' +
      '<div id="i-form"></div><div id="i-msg"></div><div id="i-dups"></div>' +
      '<div class="tabla-scroll"><table class="tabla"><thead><tr><th class="num">#</th><th>Alumno</th><th class="ocultar-movil">Grupo</th><th class="ocultar-movil">Tutor</th><th class="c ocultar-movil">Cédula</th><th></th></tr></thead><tbody id="i-tabla"></tbody></table></div>' +
      '<p class="conteo" id="i-conteo" style="margin-top:12px"></p></section>';

    function avance(a) {
      var f = a.ficha || {}, total = 0, llenos = 0;
      FICHA.forEach(function (s) { if (s.id === "tutor" || s.id === "padre") return; s.campos.forEach(function (c) { total++; if (lleno(valorCampo(a, c[0]))) llenos++; }); });
      return Math.round(llenos * 100 / total);
    }
    function pintar() {
      var q = normal($("#i-buscar").value), gid = $("#i-grupo").value;
      var lista = CE.delGrupo(gid).filter(function (a) { return !q || normal(CE.nombreCompleto(a) + " " + (a.nia || "") + " " + (a.curp || "")).indexOf(q) >= 0; });
      $("#i-tabla").innerHTML = lista.length ? lista.map(function (a, i) {
        var t = tutorDe(a) || { nombre: a.tutor || "", telefono: a.telefono || "" }, p = avance(a);
        return '<tr><td class="num">' + (i + 1) + "</td><td>" + esc(CE.nombreCompleto(a)) + '<span class="sub mono">' + esc([a.nia ? "NIA " + a.nia : "", a.curp].filter(lleno).join(" · ")) + "</span></td>" +
          '<td class="ocultar-movil">' + esc(CE.textoGrupo(a.grupo)) + '</td><td class="ocultar-movil">' + esc(t.nombre) + (lleno(t.telefono) ? '<span class="sub">' + esc(t.telefono) + "</span>" : "") + "</td>" +
          '<td class="c ocultar-movil"><span class="conteo">' + p + "%</span></td>" +
          '<td style="white-space:nowrap"><button class="btn-mini" data-ed="' + esc(a.id) + '">Editar</button> <button class="btn-mini" data-cedula="' + esc(a.id) + '">Imprimir</button> <button class="btn-mini peligro" data-del="' + esc(a.id) + '">Baja</button></td></tr>';
      }).join("") : '<tr><td colspan="6">' + CE.vacio("Todavía no hay alumnos" + (gid ? " en este grupo" : "") + ".") + "</td></tr>";
      var total = CE.delGrupo(gid).length;
      $("#i-conteo").textContent = total + (total === 1 ? " alumno" : " alumnos") + (gid ? " en " + CE.textoGrupo(gid) : " inscritos en total");
      duplicados();
    }
    function duplicados() {
      var por = {}, vistos = {}, rep = [];
      CE.alumnos.forEach(function (a) { ["N" + normal(CE.nombreCompleto(a)), lleno(a.curp) ? "C" + normal(a.curp) : ""].forEach(function (k) { if (k) (por[k] = por[k] || []).push(a); }); });
      Object.keys(por).forEach(function (k) { var g = por[k]; if (g.length < 2) return; var f = g.map(function (a) { return a.id; }).sort().join(); if (!vistos[f]) { vistos[f] = 1; rep.push(g); } });
      $("#i-dups").innerHTML = rep.length ? '<div class="nota" style="border-color:var(--terracotta)"><b>Hay alumnos registrados dos veces.</b> Revise cuál está bien y dé de baja el otro:' +
        rep.map(function (g) { return '<div style="margin-top:10px">' + g.map(function (a) {
          return '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:5px 0"><span style="flex:1;min-width:220px">' + esc(CE.nombreCompleto(a)) + " · " + esc(CE.textoGrupo(a.grupo)) + (a.curp ? ' · <span class="mono">' + esc(a.curp) + "</span>" : "") +
            '</span><button class="btn-mini" data-ed="' + esc(a.id) + '">Editar</button><button class="btn-mini peligro" data-del="' + esc(a.id) + '">Baja</button></div>';
        }).join("") + "</div>"; }).join("") + "</div>" : "";
    }

    function abrirFicha(a) {
      var nuevo = !a;
      a = a ? JSON.parse(JSON.stringify(a)) : { id: CE.nuevoId(), ficha: {}, grupo: $("#i-grupo").value || CE.grupoInicial() };
      $("#i-msg").innerHTML = "";
      $("#i-form").innerHTML = '<div class="formulario-caja ficha"><h3>' + (nuevo ? "Nueva inscripción" : "Cédula de " + esc(CE.nombreCompleto(a))) + "</h3>" +
        FICHA.map(function (s) {
          return "<details" + (s.abierto ? " open" : "") + "><summary>" + esc(s.titulo) + '</summary><div class="campos">' + s.campos.map(function (c) { return campoHTML(c, a); }).join("") + "</div></details>";
        }).join("") +
        '<div class="ficha-acciones acciones" style="margin-top:8px"><button class="btn btn-pri" id="f-guardar">' + (nuevo ? "Inscribir alumno" : "Guardar cambios") + '</button><button class="btn btn-sec" id="f-cancelar">Cancelar</button><span class="msg" id="f-msg"></span></div></div>';
      $("#i-form").scrollIntoView({ behavior: "smooth", block: "start" });
      // Al escribir la CURP se llenan solas la fecha de nacimiento y el género
      $("#f-curp").addEventListener("change", function () {
        var c = normal(this.value).replace(/\s/g, ""); this.value = c;
        if (!$("#f-nacimiento").value && CE.nacDeCurp(c)) $("#f-nacimiento").value = CE.nacDeCurp(c);
        if (!$("#f-sexo").value && CE.sexoDeCurp(c)) $("#f-sexo").value = CE.sexoDeCurp(c);
      });
      $("#f-cancelar").addEventListener("click", function () { $("#i-form").innerHTML = ""; });
      $("#f-guardar").addEventListener("click", function () {
        var msg = $("#f-msg"), boton = this;
        $$("#i-form [data-k]").forEach(function (i) {
          var k = i.getAttribute("data-k"), v = i.value.trim();
          if (/CURP$/i.test(k) || k === "curp") v = normal(v).replace(/\s/g, "");
          if (DIRECTOS.indexOf(k) >= 0) a[k] = v; else a.ficha[k] = v;
        });
        a.apPaterno = normal(a.apPaterno); a.apMaterno = normal(a.apMaterno); a.nombres = normal(a.nombres);
        if (!lleno(a.apPaterno) || !lleno(a.nombres)) { msg.className = "msg error"; msg.textContent = "Escriba al menos el apellido paterno y el nombre."; return; }
        if (!lleno(a.grupo)) { msg.className = "msg error"; msg.textContent = "Elija el grado y grupo."; return; }
        if (lleno(a.curp) && a.curp.length !== 18) { msg.className = "msg error"; msg.textContent = "La CURP del alumno debe tener 18 caracteres."; return; }
        var t = tutorDe(a); if (t) { a.tutor = t.nombre; a.telefono = t.telefono; }
        if (!a.alta) a.alta = CE.hoyISO();
        CE.unaVez(boton, function () {
          msg.className = "msg"; msg.textContent = "Revisando…";
          return CE.refrescarAlumnos().then(function () {
            var dup = buscarDuplicado(a);
            if (dup) {
              msg.className = "msg error";
              msg.innerHTML = "No se guardó: " + (lleno(a.curp) && normal(dup.curp) === a.curp ? "esa CURP ya es de " : "ya está inscrito ") + "<b>" + esc(CE.nombreCompleto(dup)) + "</b> en " + esc(CE.textoGrupo(dup.grupo)) + '. <button class="btn-mini" data-ed="' + esc(dup.id) + '">Abrir su cédula</button>';
              return;
            }
            return CE.guardar("alumno:" + a.id, a).then(function () {
              var i = CE.alumnos.findIndex(function (x) { return x.id === a.id; });
              if (i >= 0) CE.alumnos[i] = a; else CE.alumnos.push(a);
              CE.grupoActual = a.grupo; $("#i-grupo").value = a.grupo;
              $("#i-form").innerHTML = "";
              $("#i-msg").innerHTML = '<div class="acciones" style="margin:0 0 14px"><span class="msg ok">✓ ' + (nuevo ? "Se inscribió a " : "Se guardó la cédula de ") + esc(CE.nombreCompleto(a)) + ".</span>" + (nuevo ? ' <button class="btn btn-sec" id="i-otro">+ Inscribir otro alumno</button>' : "") + "</div>";
              CE.avisar(nuevo ? "Alumno inscrito" : "Cédula guardada");
              pintar();
            });
          });
        });
      });
    }

    function abrirPegar() {
      $("#i-msg").innerHTML = "";
      $("#i-form").innerHTML = '<div class="formulario-caja"><h3>Pegar lista de alumnos</h3><p class="ayuda" style="margin-top:0">Un alumno por renglón, con apellidos primero: <span class="mono">PÉREZ LÓPEZ JUAN CARLOS</span>. También puede copiar columnas de Excel (apellido paterno, apellido materno, nombre). Los que ya estén inscritos no se repiten.</p>' +
        '<div class="campos" style="margin-bottom:12px"><div class="campo"><label for="p-grupo">Grupo</label><select id="p-grupo">' + CE.opcionesGrupo(false, $("#i-grupo").value || CE.grupoInicial()) + "</select></div></div>" +
        '<textarea class="pegar" id="p-texto" placeholder="PÉREZ LÓPEZ JUAN CARLOS&#10;GARCÍA HERNÁNDEZ MARÍA FERNANDA"></textarea>' +
        '<div class="acciones"><button class="btn btn-pri" id="p-agregar">Agregar a la lista</button><button class="btn btn-sec" id="p-cancelar">Cancelar</button><span class="msg" id="p-msg"></span></div></div>';
      $("#p-cancelar").addEventListener("click", function () { $("#i-form").innerHTML = ""; });
      $("#p-agregar").addEventListener("click", function () {
        var boton = this, msg = $("#p-msg"), gid = $("#p-grupo").value;
        var leidos = $("#p-texto").value.split(/\r?\n/).map(function (r) {
          var p = r.split(/\t|,|;/).map(function (x) { return x.trim(); }).filter(lleno);
          if (p.length >= 3) return [p[0], p[1], p.slice(2).join(" ")];
          p = r.trim().split(/\s+/);
          if (p.length >= 3) return [p[0], p[1], p.slice(2).join(" ")];
          if (p.length === 2) return [p[0], "", p[1]];
          return null;
        }).filter(Boolean);
        if (!gid) { msg.className = "msg error"; msg.textContent = "Elija el grupo."; return; }
        if (!leidos.length) { msg.className = "msg error"; msg.textContent = "No encontré nombres. Escriba un alumno por renglón."; return; }
        CE.unaVez(boton, function () {
          return CE.refrescarAlumnos().then(function () {
            var ya = {}, nuevos = [], omitidos = [];
            CE.alumnos.forEach(function (a) { ya[normal(CE.nombreCompleto(a))] = 1; });
            leidos.forEach(function (x) {
              var a = { id: CE.nuevoId(), apPaterno: normal(x[0]), apMaterno: normal(x[1]), nombres: normal(x[2]), grupo: gid, ficha: {}, alta: CE.hoyISO() };
              var k = normal(CE.nombreCompleto(a));
              if (ya[k]) { omitidos.push(CE.nombreCompleto(a)); return; }
              ya[k] = 1; nuevos.push(a);
            });
            var hechos = 0, fallos = 0, cadena = Promise.resolve();
            nuevos.forEach(function (a) {
              cadena = cadena.then(function () {
                msg.className = "msg"; msg.textContent = "Guardando " + (hechos + fallos + 1) + " de " + nuevos.length + "…";
                return CE.guardar("alumno:" + a.id, a).then(function () { hechos++; CE.alumnos.push(a); }, function () { fallos++; });
              });
            });
            return cadena.then(function () {
              CE.grupoActual = gid; $("#i-grupo").value = gid; pintar();
              var partes = [hechos + (hechos === 1 ? " alumno agregado" : " alumnos agregados")];
              if (omitidos.length) partes.push(omitidos.length + " ya estaban inscritos y no se repitieron (" + omitidos.join(", ") + ")");
              if (fallos) partes.push(fallos + " no se pudieron guardar; vuelva a pegarlos");
              msg.className = fallos ? "msg error" : "msg ok"; msg.textContent = partes.join(". ") + ".";
              if (!fallos) $("#p-texto").value = "";
            });
          });
        });
      });
    }

    function imprimirCedula(a) {
      var E = CE.P.escuela, w = window.open("", "_blank");
      if (!w) { CE.avisar("Permita las ventanas emergentes para imprimir.", true); return; }
      var html = FICHA.map(function (s) {
        var filas = s.campos.map(function (c) {
          var v = valorCampo(a, c[0]); if (c[0] === "grupo") v = CE.textoGrupo(v); if (c[2] === "fecha") v = CE.fecha(v); if (c[0] === "sexo") v = v === "H" ? "Hombre" : v === "M" ? "Mujer" : "";
          return lleno(v) ? "<tr><th>" + esc(c[1].replace(" *", "")) + "</th><td>" + esc(v) + "</td></tr>" : "";
        }).join("");
        return filas ? "<h2>" + esc(s.titulo) + "</h2><table>" + filas + "</table>" : "";
      }).join("");
      w.document.write('<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Cédula ' + esc(CE.nombreCompleto(a)) + '</title><style>body{font:14px Arial,sans-serif;margin:28px;color:#111}h1{font-size:18px;margin:0}h2{font-size:14px;margin:18px 0 6px;border-bottom:2px solid #551313;color:#551313}table{width:100%;border-collapse:collapse}th{text-align:left;width:40%;font-weight:600;color:#444}th,td{padding:4px 6px;border-bottom:1px solid #ddd}.enc{display:flex;gap:14px;align-items:center;margin-bottom:10px}.enc img{width:64px}</style></head><body>' +
        '<div class="enc"><img src="' + location.href.replace(/[^/]*$/, "") + 'escudo.png"><div><h1>' + esc((E.tipo ? E.tipo + " " : "") + "“" + E.nombre + "”") + "</h1><div>CCT " + esc(E.cct || "") + " · " + esc(E.turno || "") + " · Ciclo " + esc(E.ciclo || "") + "</div><div><b>Cédula de inscripción</b></div></div></div>" + html +
        "<script>window.onload=function(){window.print()}<\/script></body></html>");
      w.document.close();
    }

    cont.addEventListener("click", function (ev) {
      var t = ev.target;
      if (t.id === "i-nuevo" || t.id === "i-otro") abrirFicha(null);
      else if (t.id === "i-pegar") abrirPegar();
      var ed = t.closest("[data-ed]"); if (ed) abrirFicha(CE.alumnos.find(function (x) { return x.id === ed.getAttribute("data-ed"); }));
      var ce = t.closest("[data-cedula]"); if (ce) imprimirCedula(CE.alumnos.find(function (x) { return x.id === ce.getAttribute("data-cedula"); }));
      var del = t.closest("[data-del]");
      if (del) {
        var a = CE.alumnos.find(function (x) { return x.id === del.getAttribute("data-del"); });
        if (!a || !confirm("¿Dar de baja a " + CE.nombreCompleto(a) + "?\n\nSe quita de la lista. Sus asistencias y calificaciones anteriores se conservan.")) return;
        del.disabled = true;
        CE.borrar("alumno:" + a.id).then(function () { CE.alumnos = CE.alumnos.filter(function (x) { return x.id !== a.id; }); pintar(); CE.avisar("Alumno dado de baja"); })
          .catch(function (e) { CE.avisar("No se pudo: " + e.message, true); del.disabled = false; });
      }
    });
    $("#i-grupo").addEventListener("change", function () { CE.grupoActual = this.value; pintar(); });
    $("#i-buscar").addEventListener("input", pintar);
    pintar();
  } };

  /* =====================================================================
     DIRECTORIO
     ===================================================================== */
  CE.tabs.directorio = { render: function (cont) {
    cont.innerHTML = '<section class="panel"><h2>Directorio</h2><p class="ayuda">Datos de contacto de las familias. Se llenan desde la cédula de inscripción.</p>' +
      '<div class="barra-filtros"><div class="campo"><label for="d-modo">Ver</label><select id="d-modo"><option value="alumno">Por alumno</option><option value="ocupacion">Por ocupación</option></select></div>' +
      '<div class="campo"><label for="d-grupo">Grupo</label><select id="d-grupo">' + CE.opcionesGrupo(true, CE.grupoActual) + '</select></div>' +
      '<div class="campo"><label for="d-q">Buscar</label><input id="d-q" placeholder="NIA o nombre del alumno" /></div>' +
      '<button class="btn btn-sec" id="d-imprimir">Imprimir</button></div><div id="d-lista"></div></section>';
    function contactos(a) {
      var f = a.ficha || {}, out = [];
      [["MADRE", "Madre"], ["PADRE", "Padre"], ["TUTOR", f.TUTOR_PARENTESCO || "Tutor"]].forEach(function (p) {
        var n = [f[p[0] + "_NOMBRES"], f[p[0] + "_APELLIDO_PATERNO"], f[p[0] + "_APELLIDO_MATERNO"]].filter(lleno).join(" ");
        if (n) out.push({ rol: p[1], nombre: n, cel: f[p[0] + "_CELULAR"] || f[p[0] + "_TELEFONO_FIJO"] || "", ocupacion: f[p[0] + "_OCUPACION"] || "", alumno: a });
      });
      if (!out.length && lleno(a.tutor)) out.push({ rol: "Tutor", nombre: a.tutor, cel: a.telefono || "", ocupacion: "", alumno: a });
      return out;
    }
    function pintar() {
      var modo = $("#d-modo").value, gid = $("#d-grupo").value, q = normal($("#d-q").value);
      var lista = CE.delGrupo(gid).filter(function (a) { return !q || normal(CE.nombreCompleto(a) + " " + (a.nia || "")).indexOf(q) >= 0; });
      if (!lista.length) { $("#d-lista").innerHTML = CE.vacio("No hay alumnos para mostrar."); return; }
      if (modo === "alumno") {
        $("#d-lista").innerHTML = '<div class="tabla-scroll"><table class="tabla"><thead><tr><th class="num">#</th><th>Alumno</th><th>Grupo</th><th>Contactos</th></tr></thead><tbody>' +
          lista.map(function (a, i) {
            var c = contactos(a);
            return '<tr><td class="num">' + (i + 1) + "</td><td>" + esc(CE.nombreCompleto(a)) + (a.nia ? '<span class="sub mono">NIA ' + esc(a.nia) + "</span>" : "") + "</td><td>" + esc(CE.textoGrupo(a.grupo)) + "</td><td>" +
              (c.length ? c.map(function (x) { return '<div class="contacto"><b>' + esc(x.rol) + ":</b> " + esc(x.nombre) + (x.cel ? ' · <a href="tel:' + esc(x.cel) + '">' + esc(x.cel) + "</a>" : "") + "</div>"; }).join("") : '<span class="vacio">Sin datos en la cédula</span>') + "</td></tr>";
          }).join("") + "</tbody></table></div>";
      } else {
        var por = {};
        lista.forEach(function (a) { contactos(a).forEach(function (c) { var k = lleno(c.ocupacion) ? normal(c.ocupacion) : "SIN OCUPACIÓN REGISTRADA"; (por[k] = por[k] || []).push(c); }); });
        var claves = Object.keys(por).sort();
        $("#d-lista").innerHTML = claves.length ? claves.map(function (k) {
          return '<h3 style="font-size:18px;margin:18px 0 8px">' + esc(k) + ' <span class="conteo">(' + por[k].length + ")</span></h3>" + por[k].map(function (c) {
            return '<div class="contacto">' + esc(c.nombre) + " — " + esc(c.rol) + " de " + esc(CE.nombreCompleto(c.alumno)) + " (" + esc(CE.textoGrupo(c.alumno.grupo)) + ")" + (c.cel ? " · " + esc(c.cel) : "") + "</div>";
          }).join("");
        }).join("") : CE.vacio("Aún no hay padres, madres o tutores registrados en las cédulas.");
      }
    }
    ["#d-modo", "#d-grupo"].forEach(function (s) { $(s).addEventListener("change", function () { if (s === "#d-grupo") CE.grupoActual = this.value; pintar(); }); });
    $("#d-q").addEventListener("input", pintar);
    $("#d-imprimir").addEventListener("click", function () { window.print(); });
    pintar();
  } };

  /* =====================================================================
     ESTADÍSTICA (apoyo para la 911)
     ===================================================================== */
  CE.tabs.estadistica = { render: function (cont) {
    cont.innerHTML = '<section class="panel"><h2>Estadística</h2><p class="ayuda">Conteos de alumnos por grupo, sexo y edad. Sirve de apoyo para capturar la Estadística 911.</p>' +
      '<div class="ce-kpis" id="e-kpis"></div><h3 style="font-size:19px;margin:8px 0 10px">Por grupo</h3><div class="tabla-scroll" id="e-grupos"></div>' +
      '<h3 style="font-size:19px;margin:26px 0 10px">Edad a una fecha</h3><div class="barra-filtros"><div class="campo"><label for="e-fecha">Fecha de referencia</label><input type="date" id="e-fecha" /></div>' +
      '<div class="campo"><label for="e-grupo">Grupo</label><select id="e-grupo">' + CE.opcionesGrupo(true, "") + '</select></div><button class="btn btn-sec" id="e-imprimir">Imprimir</button></div>' +
      '<div class="tabla-scroll" id="e-edades"></div><div class="tabla-scroll" id="e-lista" style="margin-top:18px"></div></section>';
    var anio = (/(\d{4})/.exec(CE.P.escuela.ciclo || "") || [])[1] || new Date().getFullYear();
    $("#e-fecha").value = anio + "-09-01";
    var A = CE.alumnos;
    var h = A.filter(function (a) { return a.sexo === "H"; }).length, m = A.filter(function (a) { return a.sexo === "M"; }).length;
    var tutores = A.filter(function (a) { return tutorDe(a) || lleno(a.tutor); }).length;
    $("#e-kpis").innerHTML = [[A.length, "Alumnos inscritos"], [h, "Hombres"], [m, "Mujeres"], [tutores, "Con tutor registrado"]].map(function (k) { return '<div class="ce-kpi"><b>' + k[0] + "</b><span>" + k[1] + "</span></div>"; }).join("") +
      (A.length - h - m ? '<div class="ce-kpi"><b>' + (A.length - h - m) + "</b><span>Sin género capturado</span></div>" : "");
    var gs = CE.grupos();
    $("#e-grupos").innerHTML = '<table class="tabla"><thead><tr><th>Grupo</th><th class="c">Hombres</th><th class="c">Mujeres</th><th class="c">Total</th></tr></thead><tbody>' +
      gs.map(function (g) { var l = CE.delGrupo(CE.idGrupo(g)); return "<tr><td>" + esc(CE.nombreGrupo(g)) + '</td><td class="c">' + l.filter(function (a) { return a.sexo === "H"; }).length + '</td><td class="c">' + l.filter(function (a) { return a.sexo === "M"; }).length + '</td><td class="c">' + l.length + "</td></tr>"; }).join("") +
      '</tbody><tfoot><tr><td>Total</td><td class="c">' + h + '</td><td class="c">' + m + '</td><td class="c">' + A.length + "</td></tr></tfoot></table>";
    function edades() {
      var ref = $("#e-fecha").value, gid = $("#e-grupo").value, lista = CE.delGrupo(gid);
      var filas = {}, sinFecha = 0;
      lista.forEach(function (a) {
        var e = CE.edad(a.nacimiento || CE.nacDeCurp(a.curp), ref);
        if (e == null) { sinFecha++; return; }
        var k = e <= 11 ? "11 o menos" : e >= 16 ? "16 o más" : String(e);
        filas[k] = filas[k] || { H: 0, M: 0, T: 0 }; filas[k][a.sexo === "H" ? "H" : a.sexo === "M" ? "M" : "T"]++;
      });
      var orden = ["11 o menos", "12", "13", "14", "15", "16 o más"];
      $("#e-edades").innerHTML = '<table class="tabla"><thead><tr><th>Edad (años cumplidos)</th><th class="c">Hombres</th><th class="c">Mujeres</th><th class="c">Total</th></tr></thead><tbody>' +
        orden.map(function (k) { var f = filas[k] || { H: 0, M: 0, T: 0 }; return "<tr><td>" + k + '</td><td class="c">' + f.H + '</td><td class="c">' + f.M + '</td><td class="c">' + (f.H + f.M + f.T) + "</td></tr>"; }).join("") +
        "</tbody></table>" + (sinFecha ? '<p class="conteo" style="margin-top:8px">' + sinFecha + " alumno(s) sin fecha de nacimiento ni CURP: complételos en Inscripciones.</p>" : "");
      $("#e-lista").innerHTML = lista.length ? '<table class="tabla"><thead><tr><th class="num">#</th><th>Alumno</th><th>Grupo</th><th>Nacimiento</th><th class="c">Edad</th></tr></thead><tbody>' +
        lista.map(function (a, i) { var n = a.nacimiento || CE.nacDeCurp(a.curp), e = CE.edad(n, ref); return '<tr><td class="num">' + (i + 1) + "</td><td>" + esc(CE.nombreCompleto(a)) + "</td><td>" + esc(CE.textoGrupo(a.grupo)) + "</td><td>" + esc(CE.fecha(n)) + '</td><td class="c">' + (e == null ? "—" : e) + "</td></tr>"; }).join("") + "</tbody></table>" : "";
    }
    $("#e-fecha").addEventListener("change", edades); $("#e-grupo").addEventListener("change", edades);
    $("#e-imprimir").addEventListener("click", function () { window.print(); });
    edades();
  } };

  /* =====================================================================
     ASISTENCIA: registro diario + resumen e informes
     ===================================================================== */
  CE.tabs.asistencia = { render: function (cont) {
    cont.innerHTML = '<section class="panel"><h2>Asistencia</h2>' + CE.sinGrupos() +
      '<div class="pasos" style="margin-bottom:18px"><button class="paso-btn activo" data-modo="registro">Registro diario</button><button class="paso-btn" data-modo="resumen">Resumen e informes</button></div>' +
      '<div id="as-vista"></div></section>';
    var marcas = {};
    function claveAsis(g, f) { return "asis:" + g + ":" + f; }

    function registro() {
      $("#as-vista").innerHTML = '<p class="ayuda" style="margin-top:0">Todos aparecen con asistencia; solo toque a quien faltó o llegó tarde y luego <b>Guardar lista</b>.</p>' +
        '<div class="barra-filtros"><div class="campo"><label for="a-grupo">Grupo</label><select id="a-grupo">' + CE.opcionesGrupo(false, CE.grupoInicial()) + '</select></div><div class="campo"><label for="a-fecha">Fecha</label><input id="a-fecha" type="date" value="' + CE.hoyISO() + '" /></div></div>' +
        '<div class="leyenda"><span><b>A</b> Asistencia</span><span><b>F</b> Falta</span><span><b>R</b> Retardo</span><span><b>J</b> Falta justificada</span></div><div id="a-lista"></div>' +
        '<div class="acciones"><button class="btn btn-pri" id="a-guardar">Guardar lista</button><span class="conteo" id="a-conteo"></span></div>';
      function cargar() {
        var gid = $("#a-grupo").value, fecha = $("#a-fecha").value, lista = CE.delGrupo(gid);
        CE.grupoActual = gid; marcas = {};
        if (!gid || !fecha) { $("#a-lista").innerHTML = ""; return; }
        if (!lista.length) { $("#a-lista").innerHTML = CE.vacio("Este grupo todavía no tiene alumnos. Inscríbalos en <b>Inscripciones</b>."); $("#a-conteo").textContent = ""; return; }
        $("#a-lista").innerHTML = CE.vacio("Cargando…");
        CE.leer(claveAsis(gid, fecha)).then(function (r) {
          var previo = r[claveAsis(gid, fecha)];
          lista.forEach(function (a) { marcas[a.id] = (previo && previo[a.id]) || "A"; });
          $("#a-lista").innerHTML = (previo ? '<div class="nota" style="margin-bottom:8px">Esta lista ya se había guardado. Puede corregirla y volver a guardar.</div>' : "") + lista.map(function (a, i) {
            return '<div class="asis-fila"><span class="num">' + (i + 1) + '</span><span class="nom">' + esc(CE.nombreCompleto(a)) + '</span><span class="opciones" data-al="' + esc(a.id) + '">' +
              ["A", "F", "R", "J"].map(function (v) { return '<button class="op" data-v="' + v + '" aria-pressed="' + (marcas[a.id] === v) + '">' + v + "</button>"; }).join("") + "</span></div>";
          }).join("");
          contar();
        }).catch(function (e) { $("#a-lista").innerHTML = '<p class="msg error">' + esc(e.message) + "</p>"; });
      }
      function contar() { var c = { A: 0, F: 0, R: 0, J: 0 }; Object.keys(marcas).forEach(function (k) { c[marcas[k]]++; }); $("#a-conteo").textContent = "Asistencias " + c.A + " · Faltas " + c.F + " · Retardos " + c.R + " · Justificadas " + c.J; }
      $("#a-lista").addEventListener("click", function (ev) {
        var b = ev.target.closest(".op"); if (!b) return;
        marcas[b.parentNode.getAttribute("data-al")] = b.getAttribute("data-v");
        $$(".op", b.parentNode).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); contar();
      });
      $("#a-grupo").addEventListener("change", cargar); $("#a-fecha").addEventListener("change", cargar);
      $("#a-guardar").addEventListener("click", function () {
        if (!Object.keys(marcas).length) { CE.avisar("No hay alumnos en la lista.", true); return; }
        var gid = $("#a-grupo").value, fecha = $("#a-fecha").value, copia = Object.assign({}, marcas);
        CE.unaVez(this, function () { return CE.guardar(claveAsis(gid, fecha), copia).then(function () { CE.avisar("Lista guardada"); }); });
      });
      cargar();
    }

    function resumen() {
      var hoy = CE.hoyISO();
      $("#as-vista").innerHTML = '<div class="barra-filtros"><div class="campo"><label for="r-grupo">Grupo</label><select id="r-grupo">' + CE.opcionesGrupo(false, CE.grupoInicial()) + "</select></div>" +
        '<div class="campo"><label for="r-periodo">Periodo</label><select id="r-periodo"><option value="semanal">Semanal</option><option value="mensual" selected>Mensual</option><option value="anual">Ciclo completo</option></select></div>' +
        '<div class="campo" id="r-cual"></div><button class="btn btn-sec" id="r-imprimir">Imprimir</button></div>' +
        '<p class="ayuda" id="r-titulo" style="margin-top:0"></p><div class="tabla-scroll"><table class="tabla"><thead><tr><th class="num">#</th><th>Alumno</th><th class="c">A</th><th class="c">F</th><th class="c">R</th><th class="c">J</th><th class="c">% asist.</th></tr></thead><tbody id="r-tabla"></tbody></table></div>';
      var datos = null, cargadoPara = "";
      function selectorPeriodo() {
        var p = $("#r-periodo").value;
        $("#r-cual").innerHTML = p === "semanal" ? '<label for="r-fecha">Cualquier día de la semana</label><input type="date" id="r-fecha" value="' + hoy + '" />'
          : p === "mensual" ? '<label for="r-mes">Mes</label><input type="month" id="r-mes" value="' + hoy.slice(0, 7) + '" />' : "";
        var i = $("#r-fecha") || $("#r-mes"); if (i) i.addEventListener("change", calcular);
        calcular();
      }
      function rango() {
        var p = $("#r-periodo").value;
        if (p === "semanal") {
          var d = new Date(($("#r-fecha").value || hoy) + "T12:00:00"), dia = (d.getDay() + 6) % 7;
          var ini = new Date(d); ini.setDate(d.getDate() - dia); var fin = new Date(ini); fin.setDate(ini.getDate() + 6);
          var f = function (x) { return x.toISOString().slice(0, 10); };
          return [f(ini), f(fin), "Semana del " + CE.fecha(f(ini)) + " al " + CE.fecha(f(fin))];
        }
        if (p === "mensual") { var m = $("#r-mes").value || hoy.slice(0, 7); return [m + "-01", m + "-31", "Mes de " + CE.fecha(m + "-01").slice(3)]; }
        var C = CE.P.calendario; return [C.inicio || "0000", C.fin || "9999", "Ciclo completo " + (CE.P.escuela.ciclo || "")];
      }
      function calcular() {
        var gid = $("#r-grupo").value; CE.grupoActual = gid;
        if (!gid) return;
        var lista = CE.delGrupo(gid), r = rango();
        $("#r-titulo").textContent = CE.textoGrupo(gid) + " · " + r[2];
        var hacer = function () {
          var dias = Object.keys(datos).filter(function (k) { var f = k.split(":")[2]; return f >= r[0] && f <= r[1]; });
          $("#r-titulo").textContent += " · " + dias.length + (dias.length === 1 ? " día con lista" : " días con lista");
          $("#r-tabla").innerHTML = lista.length ? lista.map(function (a, i) {
            var c = { A: 0, F: 0, R: 0, J: 0 }, t = 0;
            dias.forEach(function (k) { var v = datos[k] && datos[k][a.id]; if (v) { c[v]++; t++; } });
            var pct = t ? Math.round((c.A + c.R) * 100 / t) : null;
            return '<tr><td class="num">' + (i + 1) + "</td><td>" + esc(CE.nombreCompleto(a)) + '</td><td class="c">' + c.A + '</td><td class="c">' + c.F + '</td><td class="c">' + c.R + '</td><td class="c">' + c.J + '</td><td class="c ' + (pct != null && pct < 80 ? "pct-bajo" : "") + '">' + (pct == null ? "—" : pct + "%") + "</td></tr>";
          }).join("") : '<tr><td colspan="7">' + CE.vacio("Este grupo no tiene alumnos.") + "</td></tr>";
        };
        if (datos && cargadoPara === gid) return hacer();
        $("#r-tabla").innerHTML = '<tr><td colspan="7">' + CE.vacio("Cargando…") + "</td></tr>";
        CE.leer("asis:" + gid + ":").then(function (d) { datos = d; cargadoPara = gid; hacer(); })
          .catch(function (e) { $("#r-tabla").innerHTML = '<tr><td colspan="7" class="msg error">' + esc(e.message) + "</td></tr>"; });
      }
      $("#r-grupo").addEventListener("change", calcular); $("#r-periodo").addEventListener("change", selectorPeriodo);
      $("#r-imprimir").addEventListener("click", function () { window.print(); });
      selectorPeriodo();
    }
    cont.querySelector(".pasos").addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-modo]"); if (!b) return;
      $$(".pasos [data-modo]", cont).forEach(function (x) { x.classList.toggle("activo", x === b); });
      (b.getAttribute("data-modo") === "registro" ? registro : resumen)();
    });
    registro();
  } };

  /* =====================================================================
     CALIFICACIONES por campo formativo (NEM) y trimestre
     ===================================================================== */
  var CAMPOS = [["lenguajes", "Lenguajes"], ["saberes", "Saberes y Pensamiento Científico"], ["etica", "Ética, Naturaleza y Sociedades"], ["humano", "De lo Humano y lo Comunitario"]];
  var TRIM = [["t1", "Trimestre 1"], ["t2", "Trimestre 2"], ["t3", "Trimestre 3"]];
  function prom(nums) { var v = nums.filter(function (n) { return n !== "" && n != null && !isNaN(n); }).map(Number); return v.length ? Math.round(v.reduce(function (s, n) { return s + n; }, 0) / v.length * 10) / 10 : null; }

  CE.tabs.calificaciones = { render: function (cont) {
    cont.innerHTML = '<section class="panel"><h2>Calificaciones</h2><p class="ayuda">Calificación de 5 a 10 por campo formativo en cada trimestre. El promedio se calcula solo.</p>' + CE.sinGrupos() +
      '<div class="pasos" style="margin-bottom:18px"><button class="paso-btn activo" data-modo="captura">Capturar</button><button class="paso-btn" data-modo="concentrado">Concentrado del ciclo</button></div>' +
      '<div class="barra-filtros"><div class="campo"><label for="c-grupo">Grupo</label><select id="c-grupo">' + CE.opcionesGrupo(false, CE.grupoInicial()) + '</select></div>' +
      '<div class="campo" id="c-trim-c"><label for="c-trim">Trimestre</label><select id="c-trim">' + TRIM.map(function (t) { return '<option value="' + t[0] + '">' + t[1] + "</option>"; }).join("") + "</select></div>" +
      '<button class="btn btn-sec" id="c-imprimir">Imprimir</button></div><div id="c-vista"></div></section>';
    var modo = "captura", datos = {}, cargadoPara = "";
    function cargar() {
      var gid = $("#c-grupo").value; CE.grupoActual = gid;
      if (!gid) return Promise.resolve();
      if (cargadoPara === gid) return Promise.resolve();
      $("#c-vista").innerHTML = CE.vacio("Cargando…");
      return CE.leer("cal:" + gid + ":").then(function (d) { datos = d; cargadoPara = gid; });
    }
    function pintar() {
      cargar().then(function () {
        var gid = $("#c-grupo").value, lista = CE.delGrupo(gid);
        $("#c-trim-c").hidden = modo !== "captura";
        if (!lista.length) { $("#c-vista").innerHTML = CE.vacio("Este grupo todavía no tiene alumnos."); return; }
        if (modo === "captura") {
          var t = $("#c-trim").value, reg = datos["cal:" + gid + ":" + t] || {};
          $("#c-vista").innerHTML = '<div class="tabla-scroll"><table class="tabla"><thead><tr><th class="num">#</th><th>Alumno</th>' + CAMPOS.map(function (c) { return '<th class="c" title="' + c[1] + '">' + c[1].split(" ")[0] + "</th>"; }).join("") + '<th class="c">Promedio</th></tr></thead><tbody>' +
            lista.map(function (a, i) {
              var n = reg[a.id] || {};
              return '<tr data-al="' + esc(a.id) + '"><td class="num">' + (i + 1) + "</td><td>" + esc(CE.nombreCompleto(a)) + "</td>" + CAMPOS.map(function (c) {
                return '<td class="c"><input class="nota-calif' + (n[c[0]] !== undefined && n[c[0]] !== "" && Number(n[c[0]]) < 6 ? " baja" : "") + '" type="number" inputmode="decimal" min="5" max="10" step="0.1" data-c="' + c[0] + '" value="' + esc(n[c[0]] == null ? "" : n[c[0]]) + '" aria-label="' + esc(c[1]) + '" /></td>';
              }).join("") + '<td class="c conteo" data-prom>' + (prom(CAMPOS.map(function (c) { return n[c[0]]; })) || "—") + "</td></tr>";
            }).join("") + '</tbody></table></div><p class="conteo" style="margin-top:8px">Lenguajes · Saberes y Pensamiento Científico · Ética, Naturaleza y Sociedades · De lo Humano y lo Comunitario</p>' +
            '<div class="acciones"><button class="btn btn-pri" id="c-guardar">Guardar calificaciones</button></div>';
        } else {
          $("#c-vista").innerHTML = '<div class="tabla-scroll"><table class="tabla"><thead><tr><th class="num">#</th><th>Alumno</th>' + TRIM.map(function (t) { return '<th class="c">' + t[1].replace("Trimestre ", "T") + "</th>"; }).join("") + '<th class="c">Promedio final</th></tr></thead><tbody>' +
            lista.map(function (a, i) {
              var pts = TRIM.map(function (t) { var n = (datos["cal:" + gid + ":" + t[0]] || {})[a.id] || {}; return prom(CAMPOS.map(function (c) { return n[c[0]]; })); });
              var f = prom(pts);
              return '<tr><td class="num">' + (i + 1) + "</td><td>" + esc(CE.nombreCompleto(a)) + "</td>" + pts.map(function (p) { return '<td class="c ' + (p != null && p < 6 ? "pct-bajo" : "") + '">' + (p == null ? "—" : p) + "</td>"; }).join("") + '<td class="c ' + (f != null && f < 6 ? "pct-bajo" : "") + '"><b>' + (f == null ? "—" : f) + "</b></td></tr>";
            }).join("") + "</tbody></table></div>";
        }
      }).catch(function (e) { $("#c-vista").innerHTML = '<p class="msg error">' + esc(e.message) + "</p>"; });
    }
    cont.addEventListener("input", function (ev) {
      var i = ev.target.closest(".nota-calif"); if (!i) return;
      i.classList.toggle("baja", i.value !== "" && Number(i.value) < 6);
      var tr = i.closest("tr"), p = prom($$(".nota-calif", tr).map(function (x) { return x.value; }));
      $("[data-prom]", tr).textContent = p == null ? "—" : p;
    });
    cont.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-modo]");
      if (b) { modo = b.getAttribute("data-modo"); $$(".pasos [data-modo]", cont).forEach(function (x) { x.classList.toggle("activo", x === b); }); pintar(); return; }
      if (ev.target.id === "c-imprimir") window.print();
      if (ev.target.id === "c-guardar") {
        var gid = $("#c-grupo").value, t = $("#c-trim").value, reg = {}, malas = 0;
        $$("#c-vista tr[data-al]").forEach(function (tr) {
          var n = {}; $$(".nota-calif", tr).forEach(function (i) {
            if (i.value === "") return; var v = Math.round(Number(i.value) * 10) / 10;
            if (isNaN(v) || v < 5 || v > 10) { malas++; i.classList.add("baja"); return; }
            n[i.getAttribute("data-c")] = v;
          });
          if (Object.keys(n).length) reg[tr.getAttribute("data-al")] = n;
        });
        if (malas) { CE.avisar("Hay " + malas + " calificación(es) fuera del rango 5 a 10. Revise las marcadas en rojo.", true); return; }
        CE.unaVez(ev.target, function () { return CE.guardar("cal:" + gid + ":" + t, reg).then(function () { datos["cal:" + gid + ":" + t] = reg; CE.avisar("Calificaciones guardadas"); }); });
      }
    });
    $("#c-grupo").addEventListener("change", pintar); $("#c-trim").addEventListener("change", pintar);
    pintar();
  } };

  /* =====================================================================
     INCIDENCIAS — Bitácora de convivencia (Manual de Convivencia SEP)
     ===================================================================== */
  var INSTRUMENTOS = ["Registro en bitácora", "Acta de hechos", "Carta compromiso", "Canalización"];
  var TIPOS = ["Conflicto escolar", "Acoso escolar", "Discriminación", "Agresión", "Conducta de riesgo", "Otra"];
  var NIVELES = ["Leve", "Grave", "Muy grave"];
  var FASES = ["Detección", "Notificación a la familia", "Intervención y acuerdos", "Seguimiento"];
  var ESTATUS = ["Abierto", "En seguimiento", "Cerrado"];

  CE.tabs.incidencias = { render: function (cont) {
    cont.innerHTML = '<section class="panel"><h2>Incidencias</h2><p class="ayuda">Bitácora de convivencia escolar con la Ruta de Actuación del Manual de Convivencia: detección, notificación a la familia, intervención y seguimiento.</p>' +
      '<div class="barra-filtros"><div class="campo"><label for="n-grupo">Grupo</label><select id="n-grupo">' + CE.opcionesGrupo(true, "") + '</select></div>' +
      '<div class="campo"><label for="n-nivel">Nivel</label><select id="n-nivel">' + CE.opcionesLista(NIVELES, "", "Todos") + '</select></div>' +
      '<div class="campo"><label for="n-estatus">Estatus</label><select id="n-estatus">' + CE.opcionesLista(ESTATUS, "", "Todos") + '</select></div>' +
      '<button class="btn btn-pri" id="n-nuevo">+ Registrar incidencia</button></div><div id="n-form"></div><div id="n-lista"></div></section>';
    function etqNivel(n) { return '<span class="etiqueta ' + (n === "Muy grave" ? "etq-muy" : n === "Grave" ? "etq-grave" : "etq-leve") + '">' + esc(n) + "</span>"; }
    function etqEstatus(s) { return '<span class="etiqueta ' + (s === "Cerrado" ? "etq-cerrado" : "etq-abierto") + '">' + esc(s) + "</span>"; }
    function alumnoDe(c) { return CE.alumnos.find(function (a) { return a.id === c.alumnoId; }) || { apPaterno: c.alumnoNombre || "(alumno dado de baja)", grupo: c.grupo }; }
    function pintar() {
      var g = $("#n-grupo").value, nv = $("#n-nivel").value, es = $("#n-estatus").value;
      var lista = CE.incidencias.filter(function (c) { var a = alumnoDe(c); return (!g || a.grupo === g) && (!nv || c.nivel === nv) && (!es || c.estatus === es); })
        .sort(function (a, b) { return String(b.fecha).localeCompare(String(a.fecha)); });
      $("#n-lista").innerHTML = lista.length ? lista.map(function (c) {
        var a = alumnoDe(c);
        return '<article class="aviso" style="margin-bottom:12px"><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between"><h3>' + esc(CE.nombreCompleto(a)) + ' <span class="conteo">· ' + esc(CE.textoGrupo(a.grupo)) + "</span></h3><div>" + etqNivel(c.nivel) + " " + etqEstatus(c.estatus) + "</div></div>" +
          "<time>" + esc(CE.fecha(c.fecha)) + " · " + esc(c.tipo) + " · " + esc(c.instrumento) + " · Fase: " + esc(c.fase) + "</time><p>" + esc(c.descripcion) + "</p>" +
          (c.acuerdos ? "<p><b>Acuerdos:</b> " + esc(c.acuerdos) + "</p>" : "") +
          '<div class="acciones no-imprimir" style="margin-top:10px"><button class="btn-mini" data-nved="' + esc(c.id) + '">Editar</button><button class="btn-mini" data-nimp="' + esc(c.id) + '">Imprimir formato</button><button class="btn-mini peligro" data-ndel="' + esc(c.id) + '">Eliminar</button></div></article>';
      }).join("") : CE.vacio("No hay incidencias registradas con estos filtros.");
    }
    function form(c) {
      var nuevo = !c;
      c = c ? Object.assign({}, c) : { id: CE.nuevoId(), fecha: CE.hoyISO(), instrumento: INSTRUMENTOS[0], tipo: TIPOS[0], nivel: NIVELES[0], fase: FASES[0], estatus: ESTATUS[0] };
      var alumnosOpc = CE.ordenar(CE.alumnos).map(function (a) { return '<option value="' + esc(a.id) + '"' + (a.id === c.alumnoId ? " selected" : "") + ">" + esc(CE.nombreCompleto(a) + " — " + CE.textoGrupo(a.grupo)) + "</option>"; }).join("");
      function sel(id, k, l) { return '<div class="campo"><label for="' + id + '">' + l + '</label><select id="' + id + '" data-n="' + k + '">' + CE.opcionesLista(k === "instrumento" ? INSTRUMENTOS : k === "tipo" ? TIPOS : k === "nivel" ? NIVELES : k === "fase" ? FASES : ESTATUS, c[k]) + "</select></div>"; }
      function txt(id, k, l, area) { return '<div class="campo"' + (area ? ' style="grid-column:1/-1"' : "") + '><label for="' + id + '">' + l + "</label>" + (area ? '<textarea id="' + id + '" data-n="' + k + '">' + esc(c[k] || "") + "</textarea>" : '<input id="' + id + '" data-n="' + k + '" value="' + esc(c[k] || "") + '" />') + "</div>"; }
      $("#n-form").innerHTML = '<div class="formulario-caja"><h3>' + (nuevo ? "Registrar incidencia" : "Editar incidencia") + '</h3><div class="campos">' +
        '<div class="campo"><label for="n-al">Alumno *</label><select id="n-al" data-n="alumnoId"><option value="">— Elegir —</option>' + alumnosOpc + "</select></div>" +
        '<div class="campo"><label for="n-fe">Fecha</label><input type="date" id="n-fe" data-n="fecha" value="' + esc(c.fecha) + '" /></div>' +
        sel("n-ti", "tipo", "Tipo de situación") + sel("n-in", "instrumento", "Instrumento") + sel("n-ni", "nivel", "Nivel de la falta") + sel("n-fa", "fase", "Fase de la Ruta de Actuación") + sel("n-es", "estatus", "Estatus") +
        txt("n-lu", "lugarHecho", "Lugar del hecho") + txt("n-ot", "otrasPersonas", "Otras personas involucradas") + txt("n-te", "testigos", "Testigos") +
        txt("n-de", "descripcion", "Descripción de lo ocurrido *", true) + txt("n-ac", "acuerdos", "Acuerdos y compromisos", true) + "</div>" +
        '<label class="casilla"><input type="checkbox" data-n="notificoFamilia"' + (c.notificoFamilia ? " checked" : "") + " /> Se notificó a la familia</label>" +
        '<label class="casilla"><input type="checkbox" data-n="expediente"' + (c.expediente ? " checked" : "") + " /> Se integró al expediente del alumno</label>" +
        '<div class="acciones"><button class="btn btn-pri" id="n-guardar">' + (nuevo ? "Registrar" : "Guardar cambios") + '</button><button class="btn btn-sec" id="n-cancelar">Cancelar</button><span class="msg" id="n-msg"></span></div></div>';
      $("#n-form").scrollIntoView({ behavior: "smooth", block: "start" });
      $("#n-cancelar").addEventListener("click", function () { $("#n-form").innerHTML = ""; });
      $("#n-guardar").addEventListener("click", function () {
        $$("#n-form [data-n]").forEach(function (i) { c[i.getAttribute("data-n")] = i.type === "checkbox" ? i.checked : i.value.trim(); });
        if (!c.alumnoId || !lleno(c.descripcion)) { $("#n-msg").className = "msg error"; $("#n-msg").textContent = "Elija al alumno y escriba la descripción."; return; }
        var a = CE.alumnos.find(function (x) { return x.id === c.alumnoId; });
        if (a) { c.alumnoNombre = CE.nombreCompleto(a); c.grupo = a.grupo; }
        if (nuevo) c.registro = CE.hoyISO();
        CE.unaVez(this, function () {
          return CE.guardar("inc:" + c.id, c).then(function () {
            var i = CE.incidencias.findIndex(function (x) { return x.id === c.id; });
            if (i >= 0) CE.incidencias[i] = c; else CE.incidencias.push(c);
            $("#n-form").innerHTML = ""; pintar(); CE.avisar(nuevo ? "Incidencia registrada" : "Incidencia actualizada");
          });
        });
      });
    }
    function imprimir(c) {
      var a = alumnoDe(c), E = CE.P.escuela, w = window.open("", "_blank");
      if (!w) { CE.avisar("Permita las ventanas emergentes para imprimir.", true); return; }
      var f = function (l, v) { return "<tr><th>" + l + "</th><td>" + esc(v || "") + "</td></tr>"; };
      w.document.write('<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Registro de incidencia</title><style>body{font:14px Arial,sans-serif;margin:30px}h1{font-size:17px;margin:0}h2{font-size:15px;color:#551313;border-bottom:2px solid #551313;margin-top:18px}table{width:100%;border-collapse:collapse}th{text-align:left;width:35%;color:#444}th,td{padding:6px;border-bottom:1px solid #ddd;vertical-align:top}.firmas{display:flex;justify-content:space-between;margin-top:70px;gap:30px}.firmas div{flex:1;border-top:1px solid #000;text-align:center;padding-top:6px}</style></head><body>' +
        "<h1>" + esc((E.tipo ? E.tipo + " " : "") + "“" + E.nombre + "”") + "</h1><div>CCT " + esc(E.cct || "") + " · " + esc([E.localidad, E.municipio, E.estado].filter(lleno).join(", ")) + "</div><h2>Registro de incidencia — " + esc(c.instrumento) + "</h2><table>" +
        f("Fecha", CE.fecha(c.fecha)) + f("Alumno", CE.nombreCompleto(a)) + f("Grupo", CE.textoGrupo(a.grupo)) + f("Tipo de situación", c.tipo) + f("Nivel de la falta", c.nivel) + f("Fase de la Ruta de Actuación", c.fase) + f("Lugar del hecho", c.lugarHecho) +
        f("Otras personas involucradas", c.otrasPersonas) + f("Testigos", c.testigos) + f("Descripción", c.descripcion) + f("Acuerdos y compromisos", c.acuerdos) + f("Se notificó a la familia", c.notificoFamilia ? "Sí" : "No") + f("Estatus", c.estatus) +
        '</table><div class="firmas"><div>Dirección</div><div>Docente</div><div>Madre, padre o tutor</div></div><script>window.onload=function(){window.print()}<\/script></body></html>');
      w.document.close();
    }
    cont.addEventListener("click", function (ev) {
      if (ev.target.id === "n-nuevo") { if (!CE.alumnos.length) { CE.avisar("Primero inscriba alumnos.", true); return; } form(null); }
      var e = ev.target.closest("[data-nved]"); if (e) form(CE.incidencias.find(function (x) { return x.id === e.getAttribute("data-nved"); }));
      var p = ev.target.closest("[data-nimp]"); if (p) imprimir(CE.incidencias.find(function (x) { return x.id === p.getAttribute("data-nimp"); }));
      var d = ev.target.closest("[data-ndel]");
      if (d && confirm("¿Eliminar este registro de incidencia?")) {
        d.disabled = true;
        CE.borrar("inc:" + d.getAttribute("data-ndel")).then(function () { CE.incidencias = CE.incidencias.filter(function (x) { return x.id !== d.getAttribute("data-ndel"); }); pintar(); CE.avisar("Registro eliminado"); })
          .catch(function (er) { CE.avisar("No se pudo: " + er.message, true); d.disabled = false; });
      }
    });
    ["#n-grupo", "#n-nivel", "#n-estatus"].forEach(function (s) { $(s).addEventListener("change", pintar); });
    pintar();
  } };

  CE.tutorDe = tutorDe;
})();
