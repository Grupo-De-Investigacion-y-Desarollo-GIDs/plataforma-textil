# Versiones para publicar en la web

Estos dos archivos son los que van a `/terminos` y `/privacidad`. **Son los únicos que se publican.**

Los archivos de la carpeta superior —`POLITICA_DE_PRIVACIDAD.md` y `TERMINOS_Y_CONDICIONES.md`— siguen siendo los documentos de entrega a OIT y **no se publican**: llevan las anotaciones internas, los marcadores de definiciones pendientes y las notas de revisión, que son correspondencia del proyecto y no texto legal.

---

## Qué se quitó respecto del documento de entrega

**Todo el aparato interno.** La nota de estado del encabezado, la leyenda de versión preliminar, la sección de notas para la revisión, y el bloque de definiciones institucionales pendientes del final de los Términos.

**Los nueve marcadores.** No quedó ninguno. Cada uno se resolvió con una formulación publicable en lugar de eliminar el contenido:

| Dónde estaba | Cómo quedó |
|---|---|
| Domicilio institucional (§2 y §15) | Se indica que puede solicitarse a la dirección de contacto. No se inventa una dirección |
| Acuerdos de procesamiento (§7.2) | Se afirma que las transferencias se realizan bajo los acuerdos de cada proveedor, sin referencia al riesgo interno |
| Región por proveedor (§8) | Las regiones que se conocen se indican en §7.2; el marcador se retiró |
| Plazos de retención (§9, tres marcadores) | Se declara que los plazos específicos por tipo de dato están en definición institucional y se incorporarán una vez establecidos |
| Certificaciones de seguridad (§11) | Se retiró. La sección ya no enumera controles |
| Protocolo de incidentes (§12) | Se retiró. Los compromisos de notificación quedan; el protocolo interno no se menciona |

**Las referencias a documentos internos.** Ya no se mencionan los riesgos del ISRA por número, ni la ruta del repositorio donde vive la documentación de cookies.

---

## Los dos cambios de fondo

**La sección 11 dejó de enumerar los controles de seguridad.**

El documento de entrega los lista uno por uno: bcrypt, TLS, cifrado en reposo, control por roles, limitación de tasa, auditoría de endpoints, atributos de las cookies. Ninguna norma exige publicar ese detalle —el artículo 6 de la Ley 25.326 pide finalidad, destinatarios, responsable, domicilio, carácter de las respuestas y derechos—, y publicarlo juega en contra: indica qué defensas existen y, por omisión, cuáles no.

La versión web dice que se aplican medidas apropiadas, nombra las categorías —cifrado, control de acceso por rol, auditoría de acciones sensibles, revisión periódica— y agrega que el detalle se documenta internamente y está a disposición de las autoridades competentes. Es el estándar habitual y no reduce la transparencia sobre lo que importa al titular de los datos.

**Los nombres técnicos de las cookies se reemplazaron por su función.**

El documento de entrega da los nombres exactos y sus prefijos de seguridad. La versión web describe qué hace cada una, cuánto dura y con qué protecciones se emite, sin dar los identificadores. La transparencia se conserva; el detalle que solo sirve para atacar, no.

---

## Lo que se mantuvo, y por qué

Todo el resto va, y no es información de más: las secciones 1 a 8 son exactamente lo que el artículo 6 de la Ley 25.326 obliga a informar.

En particular **la tabla de proveedores se mantiene completa**. Es la que responde a "quiénes pueden ser destinatarios de los datos", y es lo que permite a un taller saber que su CUIT pasa por un servicio intermediario antes de llegar al organismo. Retirarla sería incumplir, no proteger.

También se mantiene la declaración de que **no existe función de autoservicio** para eliminar la cuenta ni descargar los datos, y que esos derechos se ejercen por solicitud. Es incómodo pero es cierto, y era el defecto principal del texto anterior de febrero: declaraba los derechos sin decir cómo ejercerlos.

---

## Pendiente

El **domicilio institucional** para notificaciones formales. Hoy la política indica que puede solicitarse por correo. Cuando OIT lo defina, corresponde incorporarlo a §2 y §15 de la versión web y publicar una actualización.
