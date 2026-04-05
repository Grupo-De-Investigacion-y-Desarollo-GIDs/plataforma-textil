# Spec: Google OAuth + Magic Link

- **Semana:** 1
- **Asignado a:** Gerardo
- **Dependencias:** semana1-registro-3-pasos mergeado (StepEntidadInfo debe estar extraido como componente compartido — ver seccion 4, Paso previo)

---

## 1. Contexto

El sistema actual solo tiene email+contrasena. Hay que agregar Google OAuth y magic link como metodos alternativos. Cuando un usuario nuevo se autentica por primera vez con Google o magic link, no tiene rol ni CUIT — el sistema lo detecta y lo manda a completar el registro. Si abandona, queda marcado como registro incompleto y el admin lo ve en el dashboard para contactarlo manualmente.

---

## 2. Que construir

- Google OAuth como provider en NextAuth
- Magic link (Email provider) como provider en NextAuth, reutilizando SendGrid REST API existente
- Flujo de registro incompleto: usuario nuevo sin rol → redirige a `/registro/completar`
- Flag `registroCompleto` en User para identificar usuarios que abandonaron
- Seccion "Registros incompletos" en `/admin/usuarios`
- Botones Google y magic link en `/login`
- Manejo de error cuando usuario existente (email+contrasena) intenta loguearse con Google

---

## 3. Datos

### Migracion — agregar campo a User

```prisma
model User {
  ...
  registroCompleto Boolean @default(true)
  ...
}
```

Valor default `true` para no afectar usuarios existentes. Se setea `false` cuando el PrismaAdapter crea un usuario nuevo via OAuth o magic link. Se setea `true` cuando completa el CUIT y el rol en `/registro/completar`.

Migracion: `npx prisma migrate dev --name agregar_registro_completo_user`

### Variables de entorno — agregar a `.env.local`, `.env.example` y Vercel

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Gerardo debe crear las credenciales en Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID. URLs de callback:
- Production: `https://plataforma-textil.vercel.app/api/auth/callback/google`
- Local: `http://localhost:3000/api/auth/callback/google`

---

## 4. Prescripciones tecnicas

### Paso previo — extraer StepEntidadInfo como componente compartido

Antes de implementar este spec, el componente `StepEntidadInfo` (creado en `semana1-registro-3-pasos`) debe extraerse de `src/app/(auth)/registro/page.tsx` a un archivo compartido:

```
src/compartido/componentes/auth/step-entidad-info.tsx
```

Exportar el componente, su schema Zod (`entidadInfoSchema`) y su type (`EntidadInfoData`). Actualizar `registro/page.tsx` para importarlo desde ahi. Este cambio se hace como primer commit de este spec.

### Archivo a modificar — tipos de NextAuth

Crear `src/compartido/types/next-auth.d.ts` para extender los tipos de session:

```typescript
import 'next-auth'

declare module 'next-auth' {
  interface User {
    role?: string
    registroCompleto?: boolean
  }
  interface Session {
    user: {
      id: string
      role: string
      registroCompleto: boolean
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
    id?: string
    registroCompleto?: boolean
  }
}
```

### Archivo a modificar — `src/compartido/lib/auth.ts`

#### Override del PrismaAdapter

Reemplazar el uso directo de `PrismaAdapter(prisma)` por un adapter customizado. Esto resuelve el bug de timing: cuando un usuario nuevo entra por OAuth o magic link, `registroCompleto` se setea `false` en el momento de creacion, no despues.

```typescript
import Google from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { sendEmail, buildMagicLinkEmail } from './email'

const baseAdapter = PrismaAdapter(prisma)

const adapter = {
  ...baseAdapter,
  createUser: async (data: Parameters<typeof baseAdapter.createUser>[0]) => {
    // Usuarios creados por adapter (OAuth/magic link) empiezan con registro incompleto
    return prisma.user.create({
      data: {
        ...data,
        registroCompleto: false,
      },
    })
  },
}
```

Usar `adapter` en lugar de `PrismaAdapter(prisma)` en la config de NextAuth.

#### Agregar providers

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({ /* ... existente sin cambios ... */ }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendEmail({
          to: identifier,
          ...buildMagicLinkEmail(url),
        })
      },
    }),
  ],
})
```

No agregar `allowDangerousEmailAccountLinking` en ningun provider — el default de NextAuth (bloqueado) es correcto por seguridad.

#### Agregar callback signIn para manejar OAuthAccountNotLinked

Agregar en la config de NextAuth, despues de los providers:

```typescript
callbacks: {
  ...authConfig.callbacks,
  async signIn({ user, account }) {
    // Para OAuth/email, verificar si el email ya existe con otro provider
    if (account?.provider === 'google' || account?.provider === 'email') {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! },
        include: { accounts: true },
      })
      if (existingUser && existingUser.accounts.length === 0 && existingUser.password) {
        // Usuario con email+contrasena intentando entrar con OAuth
        // Bloquear — debe usar su contrasena
        return '/login?error=OAuthAccountNotLinked'
      }
    }
    return true
  },
},
```

Nota: este callback se ejecuta ANTES del JWT callback. No modifica `registroCompleto` — eso lo hace el adapter override.

### Archivo a modificar — `src/compartido/lib/auth.config.ts`

Agregar `registroCompleto` a los callbacks JWT y session. Sin Prisma, solo lee del objeto `user` que el adapter ya preparo correctamente:

```typescript
export default {
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: () => null,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.id = user.id
        token.registroCompleto = (user as { registroCompleto?: boolean }).registroCompleto ?? true
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        ;(session.user as { registroCompleto: boolean }).registroCompleto =
          (token.registroCompleto as boolean) ?? true
      }
      return session
    },
  },
} satisfies NextAuthConfig
```

Nota: se agrega `pages.error: '/login'` para que errores como `OAuthAccountNotLinked` redirijan al login con query param.

### Archivo a modificar — `src/compartido/lib/email.ts`

Agregar funcion `buildMagicLinkEmail` al final del archivo:

```typescript
export function buildMagicLinkEmail(url: string): { subject: string; html: string } {
  return {
    subject: 'Tu link de acceso a PDT',
    html: emailWrapper(`
      <h2 style="margin: 0 0 12px;">Link de acceso</h2>
      <p>Hace click en el boton para ingresar a la Plataforma Digital Textil. El link expira en 24 horas.</p>
      ${btnPrimario(url, 'Ingresar a PDT')}
      <p style="color: #94a3b8; font-size: 13px; margin-top: 16px;">Si no solicitaste este acceso, podes ignorar este email.</p>
    `),
  }
}
```

Reutiliza `emailWrapper` y `btnPrimario` que ya existen en el archivo.

### Archivo a modificar — `src/middleware.ts`

Agregar `/registro/completar` a las rutas permitidas y agregar check de `registroCompleto` ANTES de la proteccion por rol.

Despues de la linea `if (isPublicRoute) { return NextResponse.next() }` y despues de la redireccion a login para no logueados, agregar:

```typescript
// Usuarios con registro incompleto (OAuth/magic link sin completar)
const registroCompleto = (req.auth?.user as { registroCompleto?: boolean })?.registroCompleto
if (isLoggedIn && registroCompleto === false) {
  if (pathname === '/registro/completar' || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  return NextResponse.redirect(new URL('/registro/completar', nextUrl))
}
```

Este check va ANTES de la proteccion por rol (linea 54). Permite acceso a `/registro/completar` y a las APIs (para el POST de completar registro).

### Archivo nuevo — `src/app/(auth)/registro/completar/page.tsx`

Client component. Se muestra cuando un usuario autenticado no tiene rol ni entidad.

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { StepEntidadInfo, EntidadInfoData } from '@/compartido/componentes/auth/step-entidad-info'

type Role = 'TALLER' | 'MARCA'

export default function CompletarRegistroPage() {
  const router = useRouter()
  const [step, setStep] = useState<0 | 1>(0) // 0 = elegir rol, 1 = datos entidad
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Paso 0: seleccion de rol (reutilizar StepRole del registro o crear inline)
  // Paso 1: StepEntidadInfo con el rol seleccionado

  async function handleSubmit(data: EntidadInfoData) {
    if (!role) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/registro/completar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          nombre: data.nombreEntidad,
          cuit: data.cuit,
        }),
      })

      const body = await res.json()
      if (!res.ok) {
        setError(body.error || 'Error al completar el registro')
        setLoading(false)
        return
      }

      router.push(role === 'TALLER' ? '/taller' : '/marca/directorio')
      router.refresh()
    } catch {
      setError('Ocurrio un error inesperado. Intenta de nuevo.')
      setLoading(false)
    }
  }

  // Render: paso 0 = seleccion de rol, paso 1 = StepEntidadInfo
  // El StepIndicator muestra 2 pasos
  // ...
}
```

El componente `StepRole` del registro original puede reutilizarse (extraer tambien si conviene) o recrearse inline — es un componente simple con 2 botones.

### Archivo nuevo — `src/app/api/auth/registro/completar/route.ts`

POST protegido (requiere sesion). Recibe `{ role, nombre, cuit }`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/compartido/lib/auth'
import { prisma } from '@/compartido/lib/prisma'
import { verificarCuit } from '@/compartido/lib/afip'
import { z } from 'zod'

const schema = z.object({
  role: z.enum(['TALLER', 'MARCA']),
  nombre: z.string().trim().min(1, 'Nombre requerido'),
  cuit: z.string().trim().min(1, 'CUIT requerido'),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const raw = await req.json()
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const { role, nombre, cuit } = parsed.data

  // Verificar que el usuario no tenga ya Taller o Marca
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { taller: true, marca: true },
  })
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }
  if (user.taller || user.marca) {
    return NextResponse.json({ error: 'Ya tenes una entidad registrada' }, { status: 409 })
  }

  // Verificar CUIT con AfipSDK
  const afipResult = await verificarCuit(cuit)
  if (!afipResult.valid) {
    return NextResponse.json({ error: afipResult.error || 'CUIT invalido' }, { status: 400 })
  }

  // Transaccion: crear entidad + actualizar usuario
  await prisma.$transaction([
    role === 'TALLER'
      ? prisma.taller.create({
          data: { userId: user.id, nombre, cuit: cuit.replace(/-/g, ''), verificadoAfip: true },
        })
      : prisma.marca.create({
          data: { userId: user.id, nombre, cuit: cuit.replace(/-/g, ''), verificadoAfip: true },
        }),
    prisma.user.update({
      where: { id: user.id },
      data: { role, registroCompleto: true },
    }),
  ])

  return NextResponse.json({ ok: true })
}
```

### Archivo a modificar — `src/app/(auth)/login/page.tsx`

Agregar despues del formulario existente (antes del link "No tenes cuenta?"):

```tsx
{/* Separador */}
<div className="relative my-6">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-gray-200" />
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="bg-white px-2 text-gray-500">O continua con</span>
  </div>
</div>

{/* Google */}
<button
  type="button"
  onClick={() => signIn('google', { callbackUrl: '/' })}
  className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-overpass font-medium text-gray-700 hover:bg-gray-50 transition-colors"
>
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
  Continuar con Google
</button>

{/* Magic link */}
<MagicLinkForm />
```

Crear `MagicLinkForm` como componente inline en el mismo archivo:

```tsx
function MagicLinkForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSending(true)
    await signIn('email', { email, callbackUrl: '/', redirect: false })
    setSent(true)
    setSending(false)
  }

  if (sent) {
    return (
      <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
        Enviamos un link de acceso a <strong>{email}</strong>. Revisa tu bandeja de entrada.
      </div>
    )
  }

  return (
    <form onSubmit={handleMagicLink} className="mt-3 flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Tu email para recibir un link"
        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
        required
      />
      <Button type="submit" loading={sending} size="sm">
        Enviar link
      </Button>
    </form>
  )
}
```

Agregar manejo del error `OAuthAccountNotLinked`. Leer el query param `error` de la URL:

```tsx
const errorParam = searchParams.get('error')

// Mostrar junto con los otros errores
{errorParam === 'OAuthAccountNotLinked' && (
  <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
    Ya tenes una cuenta con email y contrasena. Usa tu contrasena para ingresar, o solicita un link de acceso.
  </div>
)}
```

### Archivo a modificar — `src/app/(admin)/admin/usuarios/page.tsx`

Agregar seccion "Registros incompletos" al principio de la pagina, antes de la tabla principal:

```typescript
const registrosIncompletos = await prisma.user.findMany({
  where: { registroCompleto: false },
  select: { id: true, name: true, email: true, createdAt: true },
  orderBy: { createdAt: 'desc' },
})
```

Mostrar como tabla con columnas: email, nombre (o "—"), fecha de intento (formateada), boton "Contactar" → `mailto:{email}`.

Solo mostrar la seccion si hay registros incompletos (`registrosIncompletos.length > 0`).

---

## 5. Casos borde

- **Usuario existente con email+contrasena intenta loguearse con Google (mismo email):** el callback `signIn` detecta que el usuario tiene password y no tiene cuenta OAuth vinculada → redirige a `/login?error=OAuthAccountNotLinked` → muestra mensaje "Ya tenes una cuenta con email y contrasena, usa tu contrasena para ingresar". No se usa `allowDangerousEmailAccountLinking` por seguridad.
- **Usuario nuevo con Google abandona `/registro/completar`:** queda con `registroCompleto: false`. Si intenta acceder a cualquier ruta protegida, el middleware lo redirige a `/registro/completar`. Visible en admin para contacto manual.
- **Magic link expirado:** NextAuth muestra error estandar, usuario puede solicitar uno nuevo desde `/login`.
- **Google OAuth falla (credenciales mal configuradas):** error redirige a `/login?error=...`, el login por email+contrasena sigue disponible como alternativa.
- **CUIT invalido en `/registro/completar`:** misma logica que en el registro normal — AfipSDK valida, si falla muestra error.
- **Usuario con `registroCompleto: false` intenta acceder a `/taller`:** middleware intercepta y redirige a `/registro/completar`.
- **AfipSDK no responde durante completar registro:** misma logica que spec afipsdk — advertencia amarilla, permite continuar.
- **Doble completar registro (race condition):** la API verifica que no exista Taller/Marca antes de crear — retorna 409 si ya existe.

---

## 6. Criterio de aceptacion

- [ ] Migracion `agregar_registro_completo_user` corre sin errores
- [ ] `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` configurados en `.env.local`, `.env.example` y Vercel
- [ ] Tipo `Session` extendido con `registroCompleto: boolean`
- [ ] `StepEntidadInfo` extraido a `src/compartido/componentes/auth/step-entidad-info.tsx` y usado en ambos registros
- [ ] Boton "Continuar con Google" aparece en `/login` con icono SVG
- [ ] Input de magic link aparece en `/login` con estado "enviado" despues del click
- [ ] Usuario nuevo con Google → redirige a `/registro/completar`
- [ ] Usuario existente con email+contrasena que intenta Google → ve mensaje "Ya tenes cuenta con email y contrasena"
- [ ] Usuario existente con Google → entra al dashboard directo
- [ ] `/registro/completar` con CUIT valido crea Taller/Marca y redirige al dashboard
- [ ] Usuario con `registroCompleto: false` que intenta entrar a `/taller` → redirige a `/registro/completar`
- [ ] Seccion "Registros incompletos" aparece en `/admin/usuarios` con datos reales
- [ ] Magic link llega por email (en produccion) y permite ingresar
- [ ] Build pasa sin errores

---

## 7. Tests (verificacion manual)

1. Crear credenciales Google OAuth en Google Cloud Console con callback URL correcto
2. Loguearse con Google con cuenta nueva → debe llegar a `/registro/completar`
3. Completar registro con CUIT de UNTREF (30-68525606-8) → debe llegar al dashboard con rol correcto
4. Loguearse con Google con cuenta ya registrada → debe entrar directo
5. Crear usuario con email+contrasena, luego intentar Google con mismo email → debe ver mensaje de error amarillo
6. Solicitar magic link → verificar que llega el email (en produccion) o que aparece en consola (en dev)
7. Usar magic link con cuenta nueva → debe llegar a `/registro/completar`
8. Verificar en `/admin/usuarios` que aparecen los registros incompletos
9. Intentar navegar a `/taller` con `registroCompleto: false` → debe redirigir a `/registro/completar`
