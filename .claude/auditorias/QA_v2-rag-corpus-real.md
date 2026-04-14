# QA: RAG — Limpiar corpus falso y preparar para contenido real

**Spec:** `v2-rag-corpus-real.md`
**Commit de implementacion:** `1d6d7cb`
**URL de prueba:** https://plataforma-textil.vercel.app
**Fecha:** 2026-04-14
**Auditor:** Sergio

---

## Nota importante

> **El asistente RAG esta intencionalmente deshabilitado.** No hay documentos cargados todavia — el corpus se va a poblar con contenido real validado por OIT/UNTREF antes de activarlo. Tu tarea es verificar que el sistema de deshabilitacion funciona correctamente.

---

## Como trabajar con este documento

1. Abri este archivo y la plataforma en paralelo
2. Segui los pasos en orden — cada paso depende del anterior
3. Marca cada resultado con ✅ (ok), 🐛 (bug menor) o ❌ (bloqueante)
4. Si el resultado no es ✅ → abri el widget azul "Feedback" en esa pagina → tipo [bug/falta] → describi que paso
5. Quedate en la pagina donde encontraste el problema antes de abrir el widget (captura la URL automaticamente)
6. Al terminar, completa el resultado global y commitea este archivo actualizado

**Regla de oro:** un issue por hallazgo, desde la pagina donde ocurre.

> **Nota:** si los hallazgos no aparecen en GitHub Issues, verificar que `GITHUB_TOKEN` y `GITHUB_REPO` estan configurados en Vercel. Los hallazgos siempre quedan registrados en la DB aunque el token no este configurado — se pueden ver en `/admin` desde `LogActividad`.

---

## Credenciales de prueba

| Rol | Email | Password | URL de entrada |
|-----|-------|----------|----------------|
| ADMIN | `lucia.fernandez@pdt.org.ar` | `pdt2026` | `/admin` |
| TALLER Bronce | `roberto.gimenez@pdt.org.ar` | `pdt2026` | `/taller` |
| TALLER Plata | `graciela.sosa@pdt.org.ar` | `pdt2026` | `/taller` |
| TALLER Oro | `carlos.mendoza@pdt.org.ar` | `pdt2026` | `/taller` |

---

## Resultado global

- [ ] ✅ Aprobado — todo funciona
- [ ] 🔧 Aprobado con fixes — funciona pero hay bugs menores
- [ ] ❌ Rechazado — falta funcionalidad o hay bugs bloqueantes

**Decision:** [ cerrar v2 / fix inmediato / abrir item v3 ]
**Issues abiertos:** #

---

## Eje 1 — Funcionalidad

Verificar que cada criterio de aceptacion del spec esta implementado.

| # | Criterio | Resultado | Issue |
|---|----------|-----------|-------|
| 1 | Feature flag `asistente_rag` esta en OFF en produccion | | |
| 2 | `llm_enabled` esta en OFF en produccion | | |
| 3 | Widget de asistente NO aparece en `/taller/aprender/[id]` cuando `asistente_rag` esta OFF | | |
| 4 | Corpus RAG esta vacio (0 documentos en la UI del admin) | | |
| 5 | Widget muestra estado degradado ("no disponible") cuando el backend esta deshabilitado | | |
| 6 | Build de TypeScript pasa sin errores | | |

---

## Eje 2 — Navegabilidad

### Paso 1 — TALLER verifica que el widget NO aparece

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/aprender`
- **Accion:**
  1. Login como TALLER Bronce
  2. Ir a `/taller/aprender` → click en cualquier coleccion disponible para entrar a `/taller/aprender/[id]`
  3. Scroll hasta el final de la pagina
- **Esperado:** El acordeon "¿Tenes dudas? Pregunta al asistente" **NO aparece** en la pagina. La pagina termina despues del contenido de la coleccion (videos, evaluacion, certificado)
- **Resultado:**
- **Notas:** Si el widget aparece, el feature flag `asistente_rag` no esta en OFF o el check de `getFeatureFlag` no se agrego correctamente

### Paso 2 — Pagina de coleccion carga normalmente sin el widget

- **Rol:** TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/taller/aprender/[id]` (misma pagina del Paso 1)
- **Accion:**
  1. Verificar que la pagina carga completa sin errores
  2. Verificar que se ven: titulo de la coleccion, videos, evaluacion (si tiene), certificado (si ya aprobo)
  3. Abrir DevTools → Console → verificar que no hay errores
- **Esperado:** La pagina funciona normalmente. No hay errores en consola. La ausencia del widget no afecta el resto de la pagina
- **Resultado:**
- **Notas:**

### Paso 3 — ADMIN verifica flag asistente_rag en OFF

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/configuracion`
- **Accion:**
  1. Cerrar sesion, login como ADMIN
  2. Ir a `/admin/configuracion` → click en la tab "Features"
  3. Buscar el toggle `asistente_rag`
- **Esperado:** El toggle `asistente_rag` esta en OFF (desactivado)
- **Resultado:**
- **Notas:**

### Paso 4 — ADMIN verifica llm_enabled en OFF

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/integraciones/llm`
- **Accion:**
  1. Ir a `/admin/integraciones/llm`
  2. Buscar el checkbox "Habilitar asistente" (llm_enabled)
- **Esperado:** El checkbox esta desmarcado (OFF)
- **Resultado:**
- **Notas:**

### Paso 5 — ADMIN verifica que el corpus esta vacio

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/integraciones/llm`
- **Accion:**
  1. En la misma pagina `/admin/integraciones/llm`, scroll hasta la seccion "Corpus RAG" o "Documentos del corpus"
  2. Verificar la lista de documentos
- **Esperado:** La lista esta vacia — muestra 0 documentos o un estado vacio tipo "No hay documentos cargados"
- **Resultado:**
- **Notas:** Los 20 documentos falsos del desarrollo fueron eliminados con TRUNCATE

### Paso 6 — ADMIN agrega un documento de prueba

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/integraciones/llm`
- **Accion:**
  1. En la seccion del corpus, buscar el formulario para agregar documento
  2. Completar:
     - Titulo: "Documento de prueba QA"
     - Contenido: "Este es un documento de prueba para verificar que el formulario funciona correctamente."
     - Categoria: `plataforma`
  3. Click en guardar/agregar
- **Esperado:** El formulario permite crear el documento. Aparece en la lista del corpus. No hay errores
- **Resultado:**
- **Notas:** Despues de verificar que funciona, se puede eliminar el documento de prueba desde la misma UI. Si el formulario no genera embeddings (ver nota del spec §6.1), el documento queda en DB pero sin vector — esto es aceptable para esta verificacion

### Paso 7 — Sin login, el widget tampoco aparece

- **Rol:** Sin login (ventana de incognito)
- **URL de inicio:** `/taller/aprender/[id]`
- **Accion:**
  1. Abrir una ventana de incognito (sin sesion)
  2. Navegar directamente a una URL de coleccion, por ejemplo `/taller/aprender/[id]` (usar el mismo ID del Paso 1)
- **Esperado:** Redireccion a `/login` (la pagina requiere autenticacion). El widget no es accesible sin login
- **Resultado:**
- **Notas:** Este paso verifica que no hay forma de acceder al widget sin autenticacion

### Paso 8 — Activar flag temporalmente y verificar fallback visual

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026) + TALLER
- **URL de inicio:** `/admin/configuracion`
- **Accion:**
  1. Login como ADMIN
  2. Ir a `/admin/configuracion` → tab Features → activar `asistente_rag` (ON)
  3. **No tocar** `llm_enabled` — dejarlo en OFF
  4. Cerrar sesion, login como TALLER Bronce (roberto.gimenez@pdt.org.ar / pdt2026)
  5. Ir a `/taller/aprender/[id]` → scroll hasta el final → click en el acordeon del asistente
  6. Escribir una pregunta cualquiera (ej: "Como subo un documento?") y enviar
  7. Esperar la respuesta
- **Esperado:** El widget aparece (porque `asistente_rag` = ON). Al enviar la pregunta, el backend retorna 503 porque `llm_enabled` = OFF. El widget muestra el **estado degradado**: icono gris de MessageCircle + texto *"El asistente no esta disponible en este momento."* + link a soporte@plataformatextil.ar. El input desaparece y no se puede reintentar
- **Resultado:**
- **Notas:** Este paso es critico — verifica que el fallback visual funciona cuando el backend esta deshabilitado pero el widget esta visible

### Paso 9 — Volver a desactivar asistente_rag

- **Rol:** ADMIN (lucia.fernandez@pdt.org.ar / pdt2026)
- **URL de inicio:** `/admin/configuracion`
- **Accion:**
  1. Login como ADMIN
  2. Ir a `/admin/configuracion` → tab Features → desactivar `asistente_rag` (OFF)
  3. Verificar que quedo en OFF
- **Esperado:** El toggle vuelve a OFF. El widget ya no aparece para los talleres
- **Resultado:**
- **Notas:** Importante dejar los dos flags en OFF al terminar la auditoria

---

## Eje 3 — Casos borde

| # | Caso | Accion | Esperado | Resultado |
|---|------|--------|----------|-----------|
| 1 | Taller accede a coleccion sin widget | Login como cualquier taller → /taller/aprender/[id] | Pagina carga completa sin errores ni espacio vacio donde iba el widget | |
| 2 | asistente_rag ON + llm_enabled OFF | Activar solo el flag de visibilidad, dejar backend OFF → preguntar | Fallback visual "no disponible" | |
| 3 | Ambos flags OFF | Dejar todo OFF → ir a /taller/aprender/[id] | Widget no aparece en absoluto | |

---

## Eje 4 — Performance

| Verificacion | Metodo | Resultado |
|-------------|--------|-----------|
| Pagina de coleccion carga en < 3s | DevTools → Network → recargar `/taller/aprender/[id]` | |
| Sin errores en consola del browser | DevTools → Console → revisar en `/taller/aprender/[id]` | |
| Config admin carga en < 3s | DevTools → Network → recargar `/admin/integraciones/llm` | |

---

## Eje 5 — Consistencia visual

| Verificacion | Resultado | Notas |
|-------------|-----------|-------|
| Fallback del widget usa icono gris centrado (MessageCircle) | | Solo visible con asistente_rag ON + llm_enabled OFF |
| Texto "no disponible" es claro y no alarma al usuario | | |
| Link a soporte visible en el fallback | | |
| Pagina de coleccion sin widget no deja espacio vacio raro | | |
| Textos en espanol argentino | | |
| Sin texto en ingles visible al usuario | | |

---

## Resumen de issues abiertos

| Issue | Tipo | Descripcion | Prioridad sugerida |
|-------|------|-------------|-------------------|
| — | — | — | — |

---

## Notas del auditor

[Observaciones generales, sugerencias de UX, contexto adicional]

**Recordatorio:** al terminar la auditoria, verificar que ambos flags quedan en OFF:
- `/admin/configuracion` → Features → `asistente_rag` → OFF
- `/admin/integraciones/llm` → `llm_enabled` → OFF

---

## Checklist de cierre

- [ ] Todos los criterios de aceptacion del spec verificados (6 criterios)
- [ ] 9 pasos de navegacion probados
- [ ] 3 casos borde probados
- [ ] Performance revisada
- [ ] Issues abiertos en GitHub con labels correctos
- [ ] Resultado global definido
- [ ] Ambos flags dejados en OFF al terminar
- [ ] Documento commiteado a develop
