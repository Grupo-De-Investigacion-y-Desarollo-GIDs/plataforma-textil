---
spec: v3-tipos-documento-db
version: V3
bloque: 3
titulo: "Tipos de documento gestionados desde la base de datos"
fecha: 2026-04-28
autor: Gerardo (Claude Code)
---

# QA: Tipos de documento DB (D-02)

## Eje 1 — Funcionalidad core

### 1.1 Puntos por tipo de documento configurables
- [ ] Login como ESTADO (anabelen.torres@pdt.org.ar / pdt2026)
- [ ] Ir a /estado/documentos
- [ ] Verificar que cada tipo muestra sus puntos (ej: CUIT 15 pts, Empleados 20 pts)
- [ ] Editar un tipo → cambiar puntos de 15 a 25 → guardar
- [ ] Verificar que el cambio se refleja en la lista

### 1.2 Configuracion de niveles
- [ ] Ir a /estado/configuracion-niveles
- [ ] Verificar 3 cards: BRONCE (0 pts), PLATA (50 pts), ORO (100 pts)
- [ ] Click editar en PLATA → ver formulario con puntos minimos, AFIP, certificados
- [ ] Click "Ver impacto del cambio" → ver preview de talleres afectados

### 1.3 Preview de impacto antes de guardar
- [ ] Editar regla PLATA: subir puntos minimos a 200
- [ ] Click "Ver impacto" → debe mostrar que talleres PLATA bajarian a BRONCE
- [ ] Cancelar sin guardar → verificar que no se aplicaron cambios

### 1.4 Guardar cambio de regla
- [ ] Editar regla PLATA: cambiar un valor menor (ej: descripcion)
- [ ] Guardar → toast de confirmacion
- [ ] Recargar pagina → cambio persistido

### 1.5 Dashboard taller con puntos dinamicos
- [ ] Login como TALLER (roberto.gimenez@pdt.org.ar / pdt2026)
- [ ] Ver desglose de puntaje en el dashboard
- [ ] Los puntos por documentos deben reflejar los puntosOtorgados de DB (no el fijo de 10)

## Eje 2 — Seguridad y permisos

### 2.1 Solo ESTADO puede editar reglas de nivel
- [ ] Login como ADMIN
- [ ] Puede VER /estado/configuracion-niveles (lectura)
- [ ] No puede editar (no tiene boton editar o el PUT retorna 403)

### 2.2 TALLER no accede a configuracion-niveles
- [ ] Login como TALLER
- [ ] Intentar acceder a /estado/configuracion-niveles → redirect unauthorized

## Eje 3 — Datos y migracion

### 3.1 Puntos diferenciados por nivel
- [ ] Verificar en DB o UI que tipos BRONCE tienen 10 pts, PLATA 15 pts, ORO 20 pts

### 3.2 Reglas de nivel iniciales correctas
- [ ] BRONCE: 0 pts minimos, sin AFIP, sin certificados
- [ ] PLATA: 50 pts minimos, requiere AFIP, 1 certificado
- [ ] ORO: 100 pts minimos, requiere AFIP, 0 certificados (no rompe talleres existentes)

### 3.3 Talleres mantienen su nivel actual
- [ ] Taller BRONCE sigue en BRONCE
- [ ] Taller PLATA sigue en PLATA
- [ ] Taller ORO sigue en ORO

## Eje 4 — Cache e invalidacion

### 4.1 Cambio de regla se refleja en < 1 minuto
- [ ] Editar regla como ESTADO
- [ ] Esperar 60 segundos
- [ ] Login como taller → dashboard refleja la regla nueva

## Eje 5 — Script de recalculo

### 5.1 Dry run no aplica cambios
- [ ] Ejecutar: npx tsx tools/recalcular-niveles.ts --dry-run
- [ ] Verificar output muestra talleres y cambios potenciales
- [ ] Verificar que la DB no cambio (niveles iguales)
