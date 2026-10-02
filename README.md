# Portal escolar "Ejército del Oriente"

Portal de la escuela, con el mismo diseño que el portal de la Telesecundaria "Amado Nervo".
Se va completando poco a poco: cada herramienta aparece como **En preparación** hasta que se configura.

## Cómo entrar

- Código de acceso provisional: `ORIENTE2026`. Cámbienlo antes de compartir la página.

## Cómo se llena la información

La escuela guarda todo directo en **su propia hoja de Google** y el portal lo muestra al instante:

1. La dirección sigue `guia-conexion.html` (una sola vez): crea su hoja, pega `apps-script.gs`, pone su clave y publica.
2. Entra a `configuracion.html` con el enlace de su hoja y su clave de dirección.
3. Llena los 5 pasos: Escuela, Equipo, Grupos, Calendario y Avisos. Cada "Guardar" se refleja en el portal.
4. Una sola vez: el enlace de la hoja se pega en `ligaHoja` de `config.js` para que todos los visitantes vean los datos.

## Archivos

- `index.html`: portal público (pide código de acceso).
- `configuracion.html`: formulario paso a paso para la dirección.
- `guia-conexion.html`: guía para conectar la hoja de Google.
- `apps-script.gs`: código que se pega en la hoja de Google de la escuela.
- `config.js`: valores base, enlace de la hoja y tarjetas de herramientas.
- `datos.js`: lectura y guardado en la hoja. `estilos.css`: diseño. `escudo.png`: logo.

## Pendiente: herramientas
- [ ] Diagnóstico académico, VAK, Diagnóstico integral, Reglamento, EIA
- [ ] Programa Analítico, PEMC, PIC
- [ ] Control Escolar (alumnos, asistencia, calificaciones) — usará la misma hoja de Google
