# Decisiones técnicas de implementación

**Destino en el repositorio:** `docs/handover/DECISIONES_TECNICAS.md`

Registro de las decisiones de implementación adoptadas durante la segunda etapa, con su fundamento. Su función es evitar que un equipo que retome el desarrollo las revierta sin conocer el problema que resolvían.

Cada decisión indica qué se descartó y por qué, porque en varios casos la alternativa descartada es la que parece obvia a primera vista.

---

## 1. La visibilidad de la vidriera se almacena como documento, no como tabla

**Qué se hizo.** La configuración de qué bloques del perfil son visibles en la vidriera pública se guarda en un único campo de tipo documento estructurado sobre el registro del taller, acompañado de un indicador que distingue a los talleres que ya pasaron por la configuración.

**Qué se descartó.** Un modelo relacional con una columna booleana por bloque, que era la formulación original de la especificación.

**Por qué.** Incorporar nuevos bloques al conjunto no requiere migración de base de datos: alcanza con ampliar la lista canónica en el código. Durante el propio período de desarrollo el conjunto pasó de seis a once bloques sin ninguna migración intermedia.

**Contrapartida conocida.** El campo no es consultable de forma eficiente desde la base, de modo que el filtrado por visibilidad se resuelve en la capa de aplicación, después de la consulta. Es un compromiso deliberado: el volumen de la plataforma lo hace irrelevante y la flexibilidad compensa.

---

## 2. El valor por defecto de la visibilidad es "visible"

**Qué se hizo.** Un bloque se muestra salvo que exista una indicación explícita de ocultarlo. La ausencia de configuración, o la ausencia de una clave dentro de la configuración, significa visible.

**Por qué.** Permitió incorporar la funcionalidad sin alterar el comportamiento de ningún taller preexistente. La migración inicial fue estrictamente aditiva: ningún perfil cambió de aspecto por la introducción del control.

**Advertencia para la continuidad.** Si en algún momento se decide invertir el criterio hacia una lógica de privacidad por defecto, hay que contemplar que los talleres existentes quedarían con todos sus bloques ocultos de un día para otro.

---

## 3. La elegibilidad para el directorio se evalúa en consulta, no se almacena

**Qué se hizo.** La condición que determina si un taller aparece en el directorio público se calcula en el momento de la consulta, a partir de los datos vigentes.

**Qué se descartó.** Un campo de umbral calculado y persistido sobre el taller, recalculado ante cada acción relevante.

**Por qué.** Un valor almacenado queda desincronizado de las condiciones reales cuando alguna de ellas cambia sin disparar el recálculo. Ese tipo de inconsistencia es difícil de detectar —el sistema no falla, simplemente informa mal— y costosa de reparar sobre datos en producción.

**Recomendación.** Mantener este patrón al implementar el tercer umbral de acceso.

**Consecuencia funcional a tener presente.** La elegibilidad exige al menos un rubro o proceso visible. Si un taller oculta simultáneamente los bloques de procesos y de prendas, deja de aparecer en el directorio, aunque el resto de sus datos esté completo. Su vidriera sigue siendo accesible por enlace directo, de modo que desde la propia cuenta el efecto no es perceptible.

---

## 4. El estado del período de gracia se computa desde la fecha de inicio

**Qué se hizo.** El estado que se muestra al usuario —activa, en gracia, pendiente de formalización— y el contador de días restantes se calculan a partir de la fecha de inicio del plazo, no del valor almacenado en el registro.

**Por qué.** El sistema muestra información correcta aunque la tarea programada no se haya ejecutado. Si el proceso diario falla o se demora, el taller ve igualmente su situación real. El valor almacenado existe para que la tarea programada sepa sobre qué actuar, no para determinar lo que el usuario ve.

---

## 5. El estado de cuenta es propio, no reutiliza el indicador de cuenta activa

**Qué se hizo.** Se incorporó un estado de cuenta específico con tres valores, en lugar de reutilizar el indicador booleano de cuenta activa que ya existía.

**Por qué.** Ese indicador se emplea para la suspensión administrativa, y las dos situaciones son semánticamente distintas. Un taller pendiente de formalización no está sancionado: está acompañado, conserva su información y debe poder recuperarse por sí mismo verificando su CUIT. Mezclar ambos estados en un mismo campo habría hecho imposible distinguir una baja administrativa de un vencimiento de plazo.

---

## 6. La decisión está separada de la ejecución en la tarea programada

**Qué se hizo.** Una función pura determina qué corresponde hacer con cada taller en función de fechas —nada, enviar recordatorio, transicionar— y la rutina programada se limita a ejecutar esa decisión, aislando cada taller para que un error individual no interrumpa el proceso completo.

**Por qué.** Permitió verificar el comportamiento con fechas fabricadas —día 0, 49, 50, 59, 60 y 61— sin esperar sesenta días ni manipular datos de producción. También permitió comprobar que dos ejecuciones consecutivas no producen efectos duplicados.

---

## 7. La reactivación está centralizada en un único punto

**Qué se hizo.** La restitución de una cuenta a estado activo tras verificarse el CUIT se implementó en un solo lugar del código: el mismo que procesa cualquier verificación fiscal.

**Por qué.** Se dispara con independencia de la vía por la que llegue —verificación automática, reverificación solicitada por el equipo institucional, o corrección del CUIT—. Concentrarla evita el riesgo de que una vía nueva olvide reactivar la cuenta.

**Advertencia para la continuidad.** Cualquier flujo nuevo que verifique CUIT debe pasar por ese punto, no replicar la lógica.

---

## 8. Migración con criterio de amnistía

**Qué se hizo.** Al introducir el período de gracia, los talleres ya verificados quedaron activos y los no verificados iniciaron el plazo en la fecha de la migración. Ninguno quedó en estado pendiente de formalización.

**Por qué.** Ningún taller preexistente debía verse penalizado por una situación anterior a la existencia misma de la regla.

---

## 9. Minimización del dato de inscripción tributaria

**Qué se hizo.** La vidriera pública expone el tipo de inscripción —monotributista o responsable inscripto— y nunca la categoría.

**Por qué.** La categoría revela indirectamente una franja de facturación del taller, que es información sensible desde el punto de vista comercial y no aporta al propósito de la vidriera.

---

## 10. Dos reglas de visibilidad no son configurables

**Qué se hizo.** El tiempo estándar de producción nunca se expone en la vidriera pública, con independencia del interruptor del bloque de capacidad. Las credenciales —etapa de formalización y verificación fiscal— nunca pueden ocultarse.

**Por qué.** El tiempo estándar permite calcular el costo de mano de obra del taller, y exponerlo lo coloca en desventaja frente a la presión sobre precios. Las credenciales son la base de confianza sobre la que opera el directorio: un taller que pudiera ocultarlas vaciaría de sentido la vidriera para quien la consulta.

---

## 11. La seguridad a nivel de fila es endurecimiento, no autorización

**Qué se hizo.** Se activó la seguridad a nivel de fila sobre las 44 tablas del esquema público, con revocación de permisos y privilegios por defecto a los roles anónimo y autenticado, y sin definir políticas.

**Por qué sin políticas.** La aplicación nunca accede a la base como usuario anónimo o autenticado: lo hace con credenciales de aplicación que no están sujetas a esas restricciones. La medida protege contra el acceso directo a la base a través de la interfaz automática de consulta del proveedor.

**Precisión importante.** No es una capa de autorización entre usuarios de la plataforma. La verificación de que un usuario solo accede a sus propios recursos se resuelve en los puntos de acceso de la aplicación. Leer esta medida como control de autorización llevaría a conclusiones equivocadas sobre dónde está esa protección.

---

## 12. La firma institucional no es un renombre de rol

**Qué se hizo.** Las comunicaciones dirigidas a los talleres se firman como "Equipo de Coordinación", y algunos avisos dentro de la aplicación mencionan a "la Coordinación" al referirse a quien aprueba o revisa.

**Qué no se hizo.** El rol conserva su denominación técnica original en el panel, la navegación, las rutas de acceso, el conjunto de valores de rol y las reglas de autorización.

**Por qué.** Es una convención de redacción adoptada para no dirigirse a los talleres en nombre del organismo de control, en coherencia con la orientación de acompañamiento. El renombre técnico se difirió para resolverlo junto con el desdoblamiento del rol en sub-perfiles, dado que ambas intervenciones alcanzan la misma estructura.

**Advertencia.** Esta asimetría es fuente de confusión al leer el código: el usuario recibe correos de Coordinación y el equipo opera bajo un rol llamado Estado.
