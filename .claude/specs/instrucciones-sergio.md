# Instrucciones para Sergio — Validacion del sistema

Hola Sergio. El sistema esta completamente desarrollado e implementado. Tu tarea es recorrerlo completo como auditor tecnico — probando cada funcion, cada flujo entre actores y la experiencia de cada rol.

---

## Lo que se construyo

Se implementaron dos escenarios completos:

### Escenario 1 — Piloto de adopcion

- Registro de talleres y marcas con verificacion de CUIT contra ARCA
- Directorio publico y privado con filtros
- Academia con cursos, evaluaciones y certificados PDF verificables
- Formalizacion progresiva Bronce → Plata → Oro con gamificacion
- Dashboard del Estado con KPIs y exportes CSV
- Denuncias anonimas publicas con codigo de seguimiento
- Auditorias con informes y acciones correctivas
- Panel de administracion completo
- Rol de gestor de contenidos
- Sistema de feature flags para habilitar/deshabilitar funcionalidades
- Widget de feedback in-app

### Escenario 2 — Piloto comercial

- Publicacion de pedidos por marcas
- Notificaciones automaticas a talleres compatibles
- Sistema de cotizaciones con vencimiento
- Aceptacion de cotizaciones con acuerdo PDF generado automaticamente
- Seguimiento de ordenes con progreso
- Asistente RAG con IA en la academia

---

## URL del sistema

**Produccion:** https://plataforma-textil.vercel.app

**Acceso rapido:** https://plataforma-textil.vercel.app/acceso-rapido — botones de un click para loguearte con cada rol sin escribir credenciales.

---

## Usuarios del seed

Todas las cuentas usan password `pdt2026`

| Usuario | Email | Rol | Nivel |
|---------|-------|-----|-------|
| Lucia Fernandez | lucia.fernandez@pdt.org.ar | ADMIN | — |
| Roberto Gimenez | roberto.gimenez@pdt.org.ar | TALLER | BRONCE |
| Graciela Sosa | graciela.sosa@pdt.org.ar | TALLER | PLATA |
| Carlos Mendoza | carlos.mendoza@pdt.org.ar | TALLER | ORO |
| Valentina Ramos | valentina.ramos@pdt.org.ar | MARCA | Chica |
| Martin Echevarria | martin.echevarria@pdt.org.ar | MARCA | Mediana |
| Ana Belen Torres | anabelen.torres@pdt.org.ar | ESTADO | — |
| Sofia Martinez | sofia.martinez@pdt.org.ar | CONTENIDO | — |

---

## Cobertura automatizada existente

Ya hay **37 tests E2E con Playwright** que cubren login de todos los roles, navegacion basica, seguridad de acceso, y funcionalidades clave. Esos tests pasan — tu validacion es complementaria: busca problemas de UX, datos faltantes, flujos que no cierran, o comportamientos inesperados que los tests automaticos no detectan.

---

## Tu tarea

Segui el checklist en `.claude/specs/semana4-checklist-sergio.md`. Tiene **196 items** organizados en 3 partes:

1. **Funciones de negocio** (82 items) — cada feature por separado
2. **Flujos entre actores** (68 items) — 7 flujos de punta a punta con cambio de rol
3. **Experiencia por actor** (46 items) — coherencia de cada rol al navegar

Para cada item:
- Probalo en el browser
- En el archivo del checklist marca: `[x]` si funciona, `[F]` si falla
- Si falla, agrega una linea de observacion debajo con este formato:

```
FALLA: [descripcion de que paso, en que pantalla, con que usuario]
```

---

## Como reportar los resultados

Cuando termines o cuando encontres fallas importantes:

```bash
git add .claude/specs/semana4-checklist-sergio.md
git commit -m 'validacion: reporte de testing manual semana 4'
git push origin develop
```

Gerardo lo ve en GitHub y resuelve los bugs encontrados.

---

## Prioridad de validacion

Si el tiempo es limitado, prioriza en este orden:

1. **Flujos entre actores** (seccion 9 del checklist) — son los mas importantes
2. **Experiencia por actor** (seccion 10) — detecta problemas de coherencia
3. **Funciones individuales** (secciones 1-8) — son los detalles

---

## Preguntas

Si algo no esta claro o encontras un comportamiento inesperado que no sabes si es bug o feature, preguntale a Gerardo antes de marcarlo como FALLA.
