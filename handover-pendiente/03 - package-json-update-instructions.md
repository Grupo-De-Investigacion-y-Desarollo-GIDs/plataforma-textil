# Actualización del `package.json`

El `package.json` actual del proyecto no tiene los campos institucionales (description, author, license, repository). Como parte del handover básico, hay que agregarlos.

---

## Campos a agregar/actualizar

Agregar estos campos al `package.json` (al nivel raíz del JSON, no dentro de `scripts` ni `dependencies`).

```json
{
  "name": "pdt",
  "version": "0.1.0",
  "private": true,
  "description": "Plataforma Digital Textil — Donde se encuentran talleres y marcas para producir formalmente. Desarrollado por UNTREF con el apoyo de la OIT.",
  "author": "UNTREF + OIT <contacto@plataformatextil.com.ar>",
  "license": "MIT",
  "homepage": "https://plataformatextil.com.ar",
  "repository": {
    "type": "git",
    "url": "https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil.git"
  },
  "bugs": {
    "url": "https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/issues"
  },
  "keywords": [
    "oit",
    "ilo",
    "untref",
    "argentina",
    "textil",
    "formalizacion",
    "trabajo-decente",
    "nextjs",
    "prisma",
    "supabase"
  ],
  "scripts": {
    // ... mantener los scripts existentes sin cambios
  },
  // ... resto del archivo igual
}
```

---

## Cómo aplicar este cambio

Con Claude Code:

```
Actualizá el package.json del repo agregando los siguientes campos institucionales al nivel raíz, manteniendo intactos los campos existentes (scripts, dependencies, devDependencies, etc):

- description: "Plataforma Digital Textil — Donde se encuentran talleres y marcas para producir formalmente. Desarrollado por UNTREF con el apoyo de la OIT."
- author: "UNTREF + OIT <contacto@plataformatextil.com.ar>"
- license: "MIT"
- homepage: "https://plataformatextil.com.ar"
- repository: objeto con type "git" y url "https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil.git"
- bugs: objeto con url "https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/issues"
- keywords: array con ["oit", "ilo", "untref", "argentina", "textil", "formalizacion", "trabajo-decente", "nextjs", "prisma", "supabase"]

NO modifiques los scripts, dependencies, devDependencies ni ningún otro campo existente. Solo agregás los nuevos campos.

Después verificá que `npm install` sigue funcionando sin errores.

Commit como: `chore: agregar metadata institucional al package.json`
```

---

## Resultado esperado

Después del cambio, el inicio del `package.json` debería verse así:

```json
{
  "name": "pdt",
  "version": "0.1.0",
  "private": true,
  "description": "Plataforma Digital Textil — Donde se encuentran talleres y marcas para producir formalmente. Desarrollado por UNTREF con el apoyo de la OIT.",
  "author": "UNTREF + OIT <contacto@plataformatextil.com.ar>",
  "license": "MIT",
  "homepage": "https://plataformatextil.com.ar",
  "repository": {
    "type": "git",
    "url": "https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil.git"
  },
  "bugs": {
    "url": "https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil/issues"
  },
  "keywords": [
    "oit",
    "ilo",
    "untref",
    "argentina",
    "textil",
    "formalizacion",
    "trabajo-decente",
    "nextjs",
    "prisma",
    "supabase"
  ],
  "scripts": {
    "dev": "next dev",
    // ... resto igual
  }
}
```
