# Setup del entorno de desarrollo — Sergio

Guia paso a paso para configurar el entorno de desarrollo del proyecto PDT (Plataforma Digital Textil).

---

## 1. Requisitos previos

Instalar lo siguiente antes de empezar:

### Windows + WSL2
- Tener WSL2 con Ubuntu instalado. Si no lo tenes: https://learn.microsoft.com/en-us/windows/wsl/install
- Abrir todas las terminales desde WSL2 (no PowerShell nativo)

### Git
```bash
sudo apt update && sudo apt install git -y
git --version  # verificar
```

### Node.js 24.x (LTS)
Recomendado instalar con nvm:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 24
nvm use 24
node -v  # debe ser v24.x
npm -v   # debe ser v11.x
```

### Vercel CLI
```bash
npm i -g vercel@latest
vercel --version  # verificar
```

### Claude Code
```bash
npm i -g @anthropic-ai/claude-code
claude --version  # verificar
```

---

## 2. Clonar el repositorio

```bash
cd /mnt/d  # o el directorio donde trabajes
git clone https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil.git
cd plataforma-textil
git checkout develop
```

---

## 3. Configurar git

```bash
git config user.name "Sergio Anduat"
git config user.email "tu-email@ejemplo.com"
git config --list | grep user  # verificar
```

---

## 4. Instalar dependencias

```bash
npm install
```

Esto instala todas las dependencias y genera el Prisma Client automaticamente (via postinstall).

---

## 5. Configurar Vercel y bajar variables de entorno

### 5.1 Login en Vercel
```bash
vercel login
```
Seguir las instrucciones (se abre el navegador para autenticar).

### 5.2 Linkear el proyecto
```bash
vercel link
```
Cuando pregunte:
- Set up? → **Y**
- Scope → seleccionar **gbreards-projects**
- Link to existing project? → **Y**
- Project name → **plataforma-textil**

### 5.3 Bajar variables de entorno
```bash
vercel env pull .env.local
```

Esto crea `.env.local` con todas las variables necesarias (DATABASE_URL, NEXTAUTH_SECRET, etc.).

### 5.4 Crear .env para Prisma CLI
Prisma CLI no lee `.env.local`, necesita un `.env` separado:

```bash
grep -E "^(DATABASE_URL|DIRECT_URL)=" .env.local > .env
```

### 5.5 Agregar NEXTAUTH_URL
```bash
echo 'NEXTAUTH_URL=http://localhost:3000' >> .env.local
```

### 5.6 Verificar conexion a base de datos
```bash
npx prisma db pull --print | head -5
```
Si muestra el schema, la conexion funciona.

---

## 6. Instalar skills globales de Claude Code

Correr estos comandos uno por uno:

### Supabase
```bash
npx skills add supabase/agent-skills --global --yes
npx skills add Nice-Wolf-Studio/claude-code-supabase-skills --global --yes
```

### Vercel
```bash
npx skills add vercel-labs/agent-skills --global --yes
```

### Anthropic oficiales (documentos, PDF, code review, etc.)
```bash
npx skills add anthropics/skills --global --yes
```

### Code review y arquitectura
```bash
npx skills add BeforeMerge/beforemerge-skills --skill beforemerge-nextjs-review --global --yes
npx skills add BeforeMerge/beforemerge-skills --skill beforemerge-supabase-review --global --yes
npx skills add BeforeMerge/beforemerge-skills --skill beforemerge-fullstack-architecture-review --global --yes
git clone https://github.com/awesome-skills/code-review-skill.git ~/.claude/skills/code-review-skill
```

### Aprendizaje continuo entre sesiones
```bash
npx skills add affaan-m/everything-claude-code --skill continuous-learning-v2 --global --yes
```

### Verificar instalacion
```bash
ls ~/.claude/skills/
```
Debe mostrar ~35 skills instalados.

---

## 7. Verificar que todo funciona

### Build de produccion
```bash
npm run build
```
Debe compilar sin errores y mostrar la tabla de rutas.

### Dev server
```bash
npm run dev
```
Abrir http://localhost:3000 en el navegador.

### Tests
```bash
npm test
```

---

## 8. Como abrir el proyecto cada vez

### Opcion A: Terminal + Claude Code
```bash
cd /mnt/d/plataforma-textil  # o donde lo hayas clonado
git checkout develop
git pull origin develop
claude
```

### Opcion B: VS Code + Claude Code extension
1. Abrir VS Code
2. File → Open Folder → seleccionar la carpeta del proyecto
3. Terminal integrada: verificar que esta en WSL2
4. Usar la extension de Claude Code desde el panel lateral

---

## Estructura de ramas

- `main` — produccion (no pushear directo)
- `develop` — rama de desarrollo activa
- Feature branches — crear desde develop para cada tarea: `git checkout -b feature/nombre-tarea`

## Flujo de trabajo

1. `git checkout develop && git pull origin develop`
2. `git checkout -b feature/mi-tarea`
3. Desarrollar y testear
4. `git push origin feature/mi-tarea`
5. Crear PR a develop en GitHub
6. Review y merge

---

## Troubleshooting

### "Failed to fetch fonts" en build
Las fuentes estan en `public/fonts/` como archivos locales. Si falla el build por fonts, verificar que existen:
```bash
ls public/fonts/
# Debe mostrar: NotoSans-latin.woff2, NotoSans-latin-ext.woff2, Overpass-latin.woff2, Overpass-latin-ext.woff2
```

### "Environment variable not found: DIRECT_URL"
Crear el archivo `.env` con las variables de DB:
```bash
grep -E "^(DATABASE_URL|DIRECT_URL)=" .env.local > .env
```

### Prisma no conecta a la DB
Verificar que `.env.local` tiene las variables correctas:
```bash
grep DATABASE_URL .env.local
```
Si esta vacio, volver a correr `vercel env pull .env.local`.

### "middleware" deprecated warning
Es un warning de Next.js 16 (recomienda migrar a `proxy.ts`). No es bloqueante, ignorar por ahora.

---

## Contacto

- Gerardo Breard — gbreard@gmail.com
- Repo: https://github.com/Grupo-De-Investigacion-y-Desarollo-GIDs/plataforma-textil
- Deploy: https://plataforma-textil.vercel.app
