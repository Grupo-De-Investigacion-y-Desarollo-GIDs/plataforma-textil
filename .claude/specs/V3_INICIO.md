# V3 — Inicio oficial

**Fecha:** 2026-04-23
**Objetivo:** Piloto real con OIT — 1 de mayo de 2026
**Base:** V2 cerrado (224 commits, merge a main el 22/04/2026)

---

## Equipo

- **Gerardo** — specs + implementación
- **Sergio** — QA técnico
- **4 compañeros** (politólogo, economista, sociólogo, contador) — QA funcional y de dominio

---

## Flujo de trabajo

1. Gerardo escribe el spec
2. Claude Code analiza factibilidad
3. Iteración entre Gerardo y Claude Code hasta dejar el spec limpio
4. Claude Code implementa
5. Gerardo commitea y deploya
6. Se genera el QA automáticamente
7. Sergio audita el QA técnico
8. Los 4 compañeros auditan el QA funcional

---

## Base de trabajo

- **Backlog:** `V3_BACKLOG.md` — 30+ ítems organizados en 8 secciones
- **Prioridades:** sección "Prioridades para piloto OIT" en V3_BACKLOG

---

## Decisiones tomadas

- **Alcance:** Todo el backlog entra en V3. Lo que no llegue va a V4 en junio.
- **WhatsApp:** Se implementa sin API — WhatsApp solo como canal de notificación con links a la plataforma web, no como interfaz chatbot.
- **Ambientes:** Se separan dos Supabase (desarrollo y producción) antes de que los 4 compañeros empiecen a validar.
- **Piloto arranca con:** los 4 compañeros primero, después talleres reales.

---

## Primer spec

`v3-separar-ambientes.md` — separar Supabase dev/prod + deploy automático main→producción
