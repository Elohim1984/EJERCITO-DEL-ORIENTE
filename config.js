/* =====================================================================
   CONFIGURACIÓN BASE DEL PORTAL
   ---------------------------------------------------------------------
   Estos son los valores iniciales. Cuando la escuela conecta su hoja de
   Google y llena "Configuración", lo que guarde ahí reemplaza estos datos
   automáticamente y se ve en el portal sin tocar este archivo.
   ===================================================================== */
window.PORTAL = {
  // Enlace de la hoja de Google (Apps Script) de la escuela.
  // Se pega aquí UNA sola vez, cuando la escuela termine de conectarla,
  // para que todos los visitantes vean la información guardada.
  ligaHoja: "https://script.google.com/macros/s/AKfycbyouYuTVj8YIzUuFmNMXoU8ZBVgexxALWWLFepSxh0NmqjTrQlLRgdUSIke0qQLTJ1_PQ/exec",

  escudo: "escudo.png",

  escuela: {
    nombre:        "Ejército del Oriente",
    tipo:          "Telesecundaria",
    cct:           "",
    turno:         "",
    sostenimiento: "",
    zona:          "",
    localidad:     "",
    municipio:     "",
    estado:        "Puebla",
    domicilio:     "",
    telefono:      "",
    correo:        "",
    ciclo:         "2026–2027",
    codigoPortal:  "ORIENTE2026"
  },

  calendario: {
    inicio: "2026-08-31",
    fin:    "2027-07-09",
    dias:   "185",
    fuente: "SEP Puebla",
    fechas: []
  },

  personal: { director: "", docentes: [] },
  grupos:   [],
  avisos:   [],

  /* Herramientas del portal.
     estado: "lista" (se puede abrir) o "pendiente" (aparece como "En preparación"). */
  herramientas: [
    { etiqueta: "Examen diagnóstico", color: "azul",  titulo: "Diagnóstico académico",
      texto: "Reactivos por grado en los campos formativos NEM. Aplicación en línea y panel de resultados por grupo.",
      estado: "pendiente", enlace: "" },
    { etiqueta: "Estilos de aprendizaje", color: "verde", titulo: "Diagnóstico VAK",
      texto: "Situaciones para identificar si cada alumno aprende mejor de forma visual, auditiva o kinestésica.",
      estado: "pendiente", enlace: "" },
    { etiqueta: "Diagnóstico integral", color: "ocre", titulo: "Socioemocional, familiar y de contexto",
      texto: "Formulario integral para alumnos: socioemocional, contexto familiar, estilos de aprendizaje y académico.",
      estado: "pendiente", enlace: "" },
    { etiqueta: "Normativa", color: "azul", titulo: "Reglamento de Convivencia",
      texto: "Documento de convivencia escolar: derechos, obligaciones y protocolo ante faltas, para alumnos y familias.",
      estado: "pendiente", enlace: "" },
    { etiqueta: "EIA", color: "verde", titulo: "Ejercicios Integradores del Aprendizaje",
      texto: "Diagnóstico oficial SEP de inicio de ciclo, en pantalla: alumnos responden y el docente valora con la rúbrica.",
      estado: "pendiente", enlace: "" },
    { etiqueta: "Planeación", color: "azul", titulo: "Programa Analítico por Campos Formativos",
      texto: "Diagnóstico escolar y Programa Analítico de todos los grados del ciclo.",
      estado: "pendiente", enlace: "" },
    { etiqueta: "Planeación", color: "verde", titulo: "Programa Escolar de Mejora Continua (PEMC)",
      texto: "Los ámbitos del PEMC con las gráficas de resultados de los diagnósticos y su análisis.",
      estado: "pendiente", enlace: "" },
    { etiqueta: "Planeación", color: "ocre", titulo: "Proyecto de Integración Comunitaria (PIC)",
      texto: "Proyecto de Integración Comunitaria por grado. Documento de consulta para el colectivo.",
      estado: "pendiente", enlace: "" },
    { etiqueta: "Administración", color: "ocre", titulo: "Control Escolar",
      texto: "Inscripciones, directorio, estadística, asistencia, calificaciones, incidencias, avisos, calendario y personal.",
      estado: "lista", enlace: "control-escolar.html" }
  ],

  // Mostrar la sección "Avance de configuración" (poner false cuando todo esté listo)
  mostrarAvance: true
};
