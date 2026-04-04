# Spec: Landing con dos entradas

- **Semana:** 1
- **Asignado a:** Sergio
- **Dependencias:** Ninguna — puede hacerse en paralelo con otros specs

---

## 1. Contexto

La landing actual tiene 8 links al registro, 3 de ellos sin rol definido. La decision de diseno es que toda entrada al registro debe tener rol pre-seleccionado. Hay que reforzar visualmente las dos entradas principales (Soy taller / Soy marca) y eliminar la ambiguedad de los links sin rol.

---

## 2. Que construir

- Hero: copy actualizado a "Soy taller" / "Soy marca"
- Seccion "Quien sos?": reducir a 2 cards prominentes + texto pequeno para Estado
- Header: dos botones pequenos "Soy taller" / "Soy marca" en lugar de "Crear cuenta" generico
- CTA Final: bifurcar en dos botones con rol pre-seleccionado
- Footer y links secundarios: apuntar a `/registro?rol=TALLER` como default
- Eliminar todos los links a `/registro` sin `?rol=`

---

## 3. Datos

- No hay cambios de schema ni APIs
- Los contadores del hero (talleres, marcas, certificados) se mantienen igual — ya usan datos reales de Prisma

---

## 4. Prescripciones tecnicas

### Archivo a modificar — `src/app/page.tsx`

#### Cambio 1 — Header (lineas 39-61)

Reemplazar el boton "Crear cuenta" → `/registro` por dos botones pequenos lado a lado. Mantener el boton "Ingresar" existente:

```tsx
<Link
  href="/registro?rol=TALLER"
  className="text-sm text-brand-blue border border-brand-blue px-3 py-1.5 rounded-lg font-overpass font-semibold hover:bg-blue-50 transition-colors"
>
  Soy taller
</Link>
<Link
  href="/registro?rol=MARCA"
  className="hidden sm:inline text-sm bg-brand-blue text-white px-3 py-1.5 rounded-lg font-overpass font-semibold hover:bg-blue-800 transition-colors"
>
  Soy marca
</Link>
```

Nota: "Soy marca" lleva `hidden sm:inline` para ocultarse en mobile (ver casos borde).

#### Cambio 2 — Hero CTAs (lineas 75-88)

Cambiar solo el copy de los botones, mantener los hrefs y estilos:

- CTA primario: cambiar "Registra tu taller" → "Soy taller", mantener `/registro?rol=TALLER`
- CTA secundario: cambiar "Busca proveedores" → "Soy marca", mantener `/registro?rol=MARCA`

#### Cambio 3 — Seccion "Quien sos?" (lineas 107-182)

Cambiar el grid de `md:grid-cols-3` a `md:grid-cols-2` y agregar `max-w-4xl mx-auto`:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
```

Eliminar la card Estado completa (el div que contiene emoji `🏛️`, titulo "Soy Estado", lista y mailto).

Las dos cards restantes (Taller y Marca) se agrandan — cambiar `p-7` a `p-9` y el emoji de `text-3xl` a `text-5xl`.

Agregar debajo del grid de cards, dentro del mismo `<div className="max-w-6xl mx-auto">`:

```tsx
<p className="text-center text-sm text-gray-500 mt-8">
  ¿Sos de un organismo publico?{' '}
  <a
    href="mailto:soporte@plataformatextil.ar?subject=Solicitud de acceso - Estado"
    className="text-brand-blue font-semibold hover:underline"
  >
    Solicita acceso institucional
  </a>
</p>
```

#### Cambio 4 — Seccion Capacitacion (linea 319)

Cambiar el link "Ver todos los cursos" de `/registro?rol=TALLER` a mantenerlo igual — ya tiene `?rol=TALLER`, no requiere cambio.

#### Cambio 5 — CTA Final (lineas 377-396)

Cambiar el H2 de "Empeza hoy a formalizar tu taller" a "Empeza hoy".

Reemplazar el boton unico "Crear mi cuenta" → `/registro` por dos botones:

```tsx
<div className="flex flex-col sm:flex-row gap-3 justify-center">
  <Link
    href="/registro?rol=TALLER"
    className="inline-flex items-center justify-center gap-2 bg-white text-brand-blue px-10 py-4 rounded-lg font-overpass font-bold text-base hover:bg-blue-50 transition-colors"
  >
    Soy taller <ArrowRight className="w-5 h-5" />
  </Link>
  <Link
    href="/registro?rol=MARCA"
    className="inline-flex items-center justify-center gap-2 border-2 border-white text-white px-10 py-4 rounded-lg font-overpass font-bold text-base hover:bg-blue-900 transition-colors"
  >
    Soy marca <ArrowRight className="w-5 h-5" />
  </Link>
</div>
```

Cambiar la bajada de "El registro es gratuito y toma menos de 5 minutos" a mantenerla igual — aplica a ambos roles.

#### Cambio 6 — Footer (lineas 414-420)

Cambiar el link "Registrarse" → `/registro` a `/registro?rol=TALLER`:

```tsx
<li><Link href="/registro?rol=TALLER" className="hover:text-white transition-colors">Registrarse</Link></li>
```

---

## 5. Casos borde

- **Mobile:** el header no tiene espacio para dos botones — "Soy marca" se oculta con `hidden sm:inline` y solo se muestra "Soy taller" (el actor principal de la plataforma). En el resto de la pagina (hero, seccion identidad, CTA final) ambos botones son visibles porque hay mas espacio vertical.
- **Usuario llega a `/registro` sin `?rol=`:** sigue funcionando — muestra paso 0 de seleccion de rol. No es un error, solo no es el flujo ideal. Esto puede pasar si alguien comparte el link manualmente.
- **Footer con default TALLER:** el link generico "Registrarse" apunta a `/registro?rol=TALLER` porque es el actor principal. Si una marca usa ese link, vera el paso 1 con contexto de taller pero puede volver al paso 0 y cambiar rol.

---

## 6. Criterio de aceptacion

- [ ] Ningun link en la landing apunta a `/registro` sin `?rol=` excepto si el usuario llega manualmente
- [ ] El footer apunta a `/registro?rol=TALLER`
- [ ] Seccion "Quien sos?" tiene 2 cards prominentes (Taller y Marca) con `p-9` y emoji `text-5xl`
- [ ] Debajo de las 2 cards hay texto "Sos de un organismo publico? Solicita acceso institucional" con mailto
- [ ] La card Estado fue eliminada
- [ ] Header tiene dos botones "Soy taller" / "Soy marca"
- [ ] En mobile el header muestra solo "Soy taller" ("Soy marca" oculto con `hidden sm:inline`)
- [ ] Hero dice "Soy taller" / "Soy marca" en los CTAs
- [ ] CTA Final tiene dos botones con rol pre-seleccionado y H2 dice "Empeza hoy"
- [ ] Build pasa sin errores

---

## 7. Tests (verificacion manual)

1. Abrir la landing en desktop → verificar dos botones en header, dos cards en seccion identidad, dos botones en CTA final
2. Abrir en mobile (o responsive mode 375px) → verificar que el header muestra solo "Soy taller" y no se rompe el layout
3. Hacer click en cada boton "Soy taller" → verificar que lleva a `/registro?rol=TALLER`
4. Hacer click en cada boton "Soy marca" → verificar que lleva a `/registro?rol=MARCA`
5. Verificar que el texto de Estado con mailto funciona y abre el cliente de correo
6. Inspeccionar el HTML — buscar `href="/registro"` sin `?rol=` — no debe existir
