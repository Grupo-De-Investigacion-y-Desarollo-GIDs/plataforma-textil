# Condiciones de puesta en producción

**Destino en el repositorio:** `docs/handover/CONDICIONES_PRODUCCION.md`

Acciones de verificación y configuración que deben completarse al publicar la plataforma. Se registran porque varias no producen error visible si se omiten: el sistema arranca igual y el problema se descubre semanas después.

---

## 1. Clave de la tarea programada

**Variable:** `CRON_SECRET`, en producción y en el ambiente de vista previa.

La tarea diaria que gobierna el período de gracia de 60 días exige esta clave en la cabecera de autorización. Sin ella el punto de acceso responde con rechazo y la tarea no se ejecuta.

**Por qué importa verificarlo explícitamente:** la ausencia **no genera ningún error visible en la aplicación**. Los talleres en período de gracia dejan de recibir el recordatorio del día 50 y las transiciones de estado no ocurren, sin ninguna señal para el equipo.

El estado que ve el usuario se computa a partir de la fecha de inicio del plazo y no del valor almacenado, de modo que la información mostrada permanece correcta. Lo que se pierde es la acción, no la visualización.

**Verificación sugerida:** invocar el punto de acceso con la cabecera correspondiente y confirmar que responde con éxito en lugar de rechazo.

---

## 2. Dirección base de la aplicación

**Variable:** `NEXTAUTH_URL`, con el dominio institucional.

Cuando no está definida, el código construye los enlaces de los correos, de los enlaces de acceso directo y de los códigos de verificación sobre la dirección provisoria del proveedor de alojamiento. Los correos salen con enlaces que no corresponden al dominio institucional.

---

## 3. Correo de lanzamiento del período de gracia

**No se envía de forma automática.** Por acuerdo del equipo, el correo que comunica a los talleres ya registrados el inicio del período de gracia se dispara manualmente al salir a producción.

El disparo requiere coordinación previa y aviso a UNTREF y a los participantes del piloto en paralelo, de modo que la comunicación institucional y la del sistema no lleguen desalineadas.

**Punto de acceso:** requiere confirmación explícita por parámetro. Es una operación de una sola vez.

---

## 4. Canal de denuncias

Existe en el código un punto de acceso público que admite el registro de denuncias con descripción en texto libre y archivo adjunto, sin necesidad de registro previo.

Está gobernado por un indicador de funcionalidad cuya lectura **devuelve verdadero cuando la clave no existe en la base de datos**, y los datos de inicialización la crean en verdadero. En consecuencia, el punto de acceso queda habilitado salvo que se lo configure explícitamente en falso.

La incorporación de un canal de denuncias es una decisión institucional que el proceso de diseño dejó abierta. **Si el canal no forma parte de la propuesta, corresponde desactivarlo de forma explícita o retirar el código antes de publicar.**

Mientras permanezca activo, la plataforma recibe contenido de terceros que puede incluir datos sensibles, sin que ese tratamiento esté declarado en la evaluación de impacto en la privacidad.

---

## 5. Textos legales y consentimiento

Sustituir en la aplicación los Términos y Condiciones y la Política de Privacidad por las versiones revisadas, e incorporar en el flujo de registro las casillas de aceptación.

**Ambas acciones van juntas.** Las versiones anteriores declaran derechos de supresión y portabilidad sin explicitar la vía de ejercicio, cuando los mecanismos de autoservicio correspondientes no existen. Solicitar consentimiento sobre esos textos agravaría el problema en lugar de resolverlo.

---

## 6. Dominio institucional

El dominio de la plataforma es `plataformatextil.com.ar`.

Verificar que no queden en el código direcciones bajo `plataformatextil.ar`, sin el componente `.com`. Alcanzan a las direcciones de soporte de las páginas de ayuda, el pie institucional, el asistente y la instrucción de sistema del asistente; a las direcciones de privacidad de la página pública correspondiente; y a la dirección de remitente del panel de integraciones.

**Caso particular:** la dirección de verificación que se imprime en el archivo de los certificados de la Academia. Los certificados ya emitidos y descargados por los talleres apuntan a un dominio que no resuelve. La corrección del código resuelve los futuros; para los ya emitidos corresponde decidir entre reemitirlos o habilitar una redirección desde el dominio anterior.

Verificar además que los registros de autenticación de correo del dominio —SPF, DKIM y DMARC— estén configurados, dado que la evaluación de riesgos los declara como control frente a la suplantación de remitente.

---

## 7. Cabeceras de seguridad

Configurar en la aplicación la política de seguridad de contenido y las cabeceras de seguridad: protección contra encuadre en marcos externos, control de tipo de contenido, política de referente y transporte estrictamente seguro.

---

## 8. Carga y publicación de los cursos

Incorporar a la Academia los cursos terminados una vez completada la validación institucional de sus contenidos.

El curso sobre riesgos del trabajo requiere una fuente sectorial específica para talleres textiles, su presentación y sus subtítulos antes de publicarse. Hasta entonces corresponde exhibirlo como próxima incorporación en lugar de demorar el conjunto.

**Circuito de actualización:** los cursos remiten a procedimientos y montos que cambian. Conviene fijar desde el inicio una revisión periódica de vigencia, y la posibilidad de retirar temporalmente un curso cuando una fuente oficial modifique de manera sustantiva el procedimiento explicado.

---

## Resumen de verificación

| # | Acción | Produce error visible si se omite |
|---|---|---|
| 1 | `CRON_SECRET` configurada | **No** |
| 2 | `NEXTAUTH_URL` con el dominio institucional | No |
| 3 | Correo de lanzamiento disparado y coordinado | No |
| 4 | Canal de denuncias desactivado explícitamente | No |
| 5 | Textos legales sustituidos y consentimiento incorporado | No |
| 6 | Direcciones de dominio corregidas | No |
| 7 | Cabeceras de seguridad configuradas | No |
| 8 | Cursos cargados y publicados | Sí |

Siete de las ocho no se manifiestan como fallo. Ese es el motivo de esta lista.
