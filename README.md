# Portal escolar "Ejército del Oriente"

Portal de la escuela, con el mismo diseño que el portal de la Telesecundaria "Amado Nervo".
Se va completando poco a poco: cada herramienta aparece como **En preparación** hasta que se configura.

## Cómo entrar

- Código de acceso provisional: `ORIENTE2026`. Cámbienlo antes de compartir la página.

## Dónde se cambian los datos

Todo está al inicio de `index.html`, en el bloque **CONFIGURACIÓN DE LA ESCUELA**:

- `window.ESCUELA`: nombre, tipo, CCT, turno, sostenimiento, zona, localidad, municipio, estado, ciclo, código de acceso, escudo y calendario.
- `window.HERRAMIENTAS`: las tarjetas del portal. Para habilitar una herramienta se cambia su `estado` a `"lista"` y se pone el nombre de su archivo en `enlace`.

## Lo que falta por llenar

**Datos de la escuela**
- [ ] Tipo o nivel educativo (telesecundaria, primaria, etc.)
- [ ] Clave CCT
- [ ] Turno
- [ ] Sostenimiento
- [ ] Zona (rural/urbana)
- [ ] Localidad, municipio y estado
- [ ] Escudo o logo (subir la imagen al repositorio)
- [ ] Código de acceso propio
- [ ] Confirmar las fechas del calendario oficial

**Herramientas** (en el orden que la escuela las necesite)
- [ ] Diagnóstico académico (examen)
- [ ] Diagnóstico VAK (estilos de aprendizaje)
- [ ] Diagnóstico integral
- [ ] Reglamento de Convivencia
- [ ] Ejercicios Integradores del Aprendizaje (EIA)
- [ ] Programa Analítico
- [ ] PEMC
- [ ] PIC
- [ ] Control Escolar (inscripciones, asistencia, calificaciones, avisos, CTE, documentos de dirección)

Para el Control Escolar y los diagnósticos que guardan respuestas se necesitará además una hoja de Google
(Apps Script) propia de esta escuela, separada de la de Amado Nervo.
