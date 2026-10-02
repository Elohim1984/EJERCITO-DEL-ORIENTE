/**
 * PORTAL ESCOLAR — Conexión con la hoja de Google de la escuela
 * --------------------------------------------------------------
 * 1. Cambie la clave de abajo por una clave propia (solo la dirección
 *    debe conocerla; es la que se pide para guardar en el portal).
 * 2. Implementar > Nueva implementación > Aplicación web
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier persona
 * 3. Copie el enlace que termina en /exec y péguelo en
 *    "Configuración" del portal.
 */
const CLAVE_DIRECCION = "CAMBIA-ESTA-CLAVE";

const VERSION = 2;
const NOMBRE_HOJA = "Datos";
const CLAVE_DE_EJEMPLO = "CAMBIA-ESTA-CLAVE";

function hoja_() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = libro.getSheetByName(NOMBRE_HOJA);
  if (!hoja) {
    hoja = libro.insertSheet(NOMBRE_HOJA);
    hoja.appendRow(["clave", "valor", "actualizado"]);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

function respuesta_(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

function filas_() {
  const hoja = hoja_();
  const ultima = hoja.getLastRow();
  if (ultima < 2) return [];
  return hoja.getRange(2, 1, ultima - 1, 2).getValues();
}

function claveCorrecta_(clave) {
  return CLAVE_DIRECCION !== CLAVE_DE_EJEMPLO && String(clave || "") === CLAVE_DIRECCION;
}

// Los datos del portal ("config:") son públicos para que el portal los muestre.
// Todo lo demás (alumnos, asistencia, calificaciones) solo se lee con la clave.
function esPublico_(clave) {
  return String(clave || "").indexOf("config:") === 0;
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if ((p.action === "get" && !esPublico_(p.key)) || (p.action === "listar" && !esPublico_(p.prefijo))) {
      if (!claveCorrecta_(p.clave)) return respuesta_({ ok: false, error: "Clave de dirección incorrecta." });
    }
    switch (p.action) {
      case "ping":
        return respuesta_({ ok: true, sistema: "portal-escolar", version: VERSION });

      case "verificar":
        return respuesta_({
          ok: true,
          sinCambiar: CLAVE_DIRECCION === CLAVE_DE_EJEMPLO,
          valida: claveCorrecta_(p.clave)
        });

      case "get": {
        const fila = filas_().find(function (f) { return f[0] === p.key; });
        return respuesta_({ ok: true, value: fila ? fila[1] : null });
      }

      case "listar": {
        const prefijo = String(p.prefijo || "");
        const filas = filas_()
          .filter(function (f) { return String(f[0]).indexOf(prefijo) === 0; })
          .map(function (f) { return { clave: f[0], valor: f[1] }; });
        return respuesta_({ ok: true, filas: filas });
      }
    }
    return respuesta_({ ok: false, error: "Acción no válida." });
  } catch (err) {
    return respuesta_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (!claveCorrecta_(p.clave)) {
    return respuesta_({ ok: false, error: "Clave de dirección incorrecta." });
  }
  const candado = LockService.getScriptLock();
  candado.waitLock(15000);
  try {
    const hoja = hoja_();
    const filas = filas_();
    const indice = filas.findIndex(function (f) { return f[0] === p.key; });

    if (p.action === "set") {
      if (!p.key) return respuesta_({ ok: false, error: "Falta la clave del dato." });
      const valor = String(p.value || "");
      if (valor.length > 49000) return respuesta_({ ok: false, error: "El dato es demasiado grande para una celda." });
      if (indice >= 0) {
        hoja.getRange(indice + 2, 2, 1, 2).setValues([[valor, new Date()]]);
      } else {
        hoja.appendRow([p.key, valor, new Date()]);
      }
      return respuesta_({ ok: true });
    }

    if (p.action === "borrar") {
      if (indice >= 0) hoja.deleteRow(indice + 2);
      return respuesta_({ ok: true });
    }

    return respuesta_({ ok: false, error: "Acción no válida." });
  } catch (err) {
    return respuesta_({ ok: false, error: String(err) });
  } finally {
    candado.releaseLock();
  }
}
