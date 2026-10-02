/* =====================================================================
   CONEXIÓN CON LA HOJA DE GOOGLE DE LA ESCUELA
   Lee y guarda la información del portal en la hoja de Google de la
   escuela (a través de su Apps Script). Las lecturas son públicas para
   que el portal muestre la información; las escrituras piden la clave
   de dirección, que solo conoce el script de la escuela.
   ===================================================================== */
(function () {
  var LLAVE_LIGA = "edo_liga_hoja";

  function liga() {
    try {
      var l = localStorage.getItem(LLAVE_LIGA);
      if (l) return l;
    } catch (e) {}
    return (window.PORTAL && window.PORTAL.ligaHoja) || "";
  }

  function guardarLiga(url) {
    try {
      if (url) localStorage.setItem(LLAVE_LIGA, url);
      else localStorage.removeItem(LLAVE_LIGA);
    } catch (e) {}
  }

  function ligaValida(url) {
    return /^https:\/\/script\.google(usercontent)?\.com\/.+/.test(String(url || "").trim());
  }

  function conTiempo(promesa, ms) {
    return Promise.race([
      promesa,
      new Promise(function (_, rechazar) {
        setTimeout(function () { rechazar(new Error("La hoja tardó demasiado en responder.")); }, ms);
      })
    ]);
  }

  function pedir(url, opciones) {
    return conTiempo(fetch(url, opciones), 20000).then(function (r) { return r.json(); });
  }

  function verificar(url, clave) {
    return pedir(url + "?action=verificar&clave=" + encodeURIComponent(clave));
  }

  // Trae todos los datos cuya clave empieza con el prefijo y los regresa
  // como objeto { clave: valor }. Si no hay hoja conectada regresa null.
  function leerTodo(prefijo, urlOpcional) {
    var u = urlOpcional || liga();
    if (!u) return Promise.resolve(null);
    return pedir(u + "?action=listar&prefijo=" + encodeURIComponent(prefijo)).then(function (d) {
      if (!d || !d.ok || !Array.isArray(d.filas)) return null;
      var salida = {};
      d.filas.forEach(function (f) {
        try { salida[f.clave] = JSON.parse(f.valor); } catch (e) {}
      });
      return salida;
    });
  }

  function guardar(clave, valor, claveDireccion) {
    var u = liga();
    if (!u) return Promise.reject(new Error("No hay hoja conectada."));
    return pedir(u, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        action: "set",
        key: clave,
        value: JSON.stringify(valor),
        clave: claveDireccion
      })
    }).then(function (d) {
      if (!d || !d.ok) throw new Error((d && d.error) || "No se pudo guardar.");
      return true;
    });
  }

  // Junta los datos guardados en la hoja con los valores base de config.js
  function combinar(base, guardados) {
    var P = JSON.parse(JSON.stringify(base));
    if (!guardados) return P;
    var e = guardados["config:escuela"];
    if (e && typeof e === "object") {
      Object.keys(e).forEach(function (k) {
        if (e[k] != null && String(e[k]).trim() !== "") P.escuela[k] = e[k];
      });
    }
    var c = guardados["config:calendario"];
    if (c && typeof c === "object") {
      ["inicio", "fin", "dias", "fuente"].forEach(function (k) {
        if (c[k] != null && String(c[k]).trim() !== "") P.calendario[k] = c[k];
      });
      if (Array.isArray(c.fechas)) P.calendario.fechas = c.fechas;
    }
    var p = guardados["config:personal"];
    if (p && typeof p === "object") {
      P.personal = { director: p.director || "", docentes: Array.isArray(p.docentes) ? p.docentes : [] };
    }
    if (Array.isArray(guardados["config:grupos"])) P.grupos = guardados["config:grupos"];
    if (Array.isArray(guardados["config:avisos"])) P.avisos = guardados["config:avisos"];
    P._guardados = guardados;
    return P;
  }

  window.HOJA = {
    liga: liga,
    guardarLiga: guardarLiga,
    ligaValida: ligaValida,
    verificar: verificar,
    leerTodo: leerTodo,
    guardar: guardar,
    combinar: combinar
  };
})();
