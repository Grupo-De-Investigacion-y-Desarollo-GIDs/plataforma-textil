-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TALLER', 'MARCA', 'ESTADO', 'ADMIN');

-- CreateEnum
CREATE TYPE "NivelTaller" AS ENUM ('BRONCE', 'PLATA', 'ORO');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('BORRADOR', 'EN_EJECUCION', 'ESPERANDO_ENTREGA', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoOrdenManufactura" AS ENUM ('PENDIENTE', 'EN_EJECUCION', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "EstadoEscrow" AS ENUM ('BLOQUEADO', 'PENDIENTE', 'LIBERADO', 'DISPUTADO');

-- CreateEnum
CREATE TYPE "EstadoValidacion" AS ENUM ('NO_INICIADO', 'PENDIENTE', 'COMPLETADO', 'VENCIDO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "TipoAuditoria" AS ENUM ('PRIMERA_VISITA', 'VERIFICACION', 'SEGUIMIENTO', 'RE_AUDITORIA');

-- CreateEnum
CREATE TYPE "EstadoAuditoria" AS ENUM ('PROGRAMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoDenuncia" AS ENUM ('RECIBIDA', 'EN_INVESTIGACION', 'RESUELTA', 'DESESTIMADA');

-- CreateEnum
CREATE TYPE "CanalNotificacion" AS ENUM ('EMAIL', 'WHATSAPP', 'PUSH', 'PLATAFORMA');

-- CreateEnum
CREATE TYPE "EstadoAccionCorrectiva" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'VENCIDA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'TALLER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "talleres" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "nivel" "NivelTaller" NOT NULL DEFAULT 'BRONCE',
    "puntaje" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ubicacion" TEXT,
    "zona" TEXT,
    "descripcion" TEXT,
    "capacidadMensual" INTEGER NOT NULL DEFAULT 0,
    "trabajadoresRegistrados" INTEGER NOT NULL DEFAULT 0,
    "fundado" INTEGER,
    "verificadoAfip" BOOLEAN NOT NULL DEFAULT false,
    "pedidosCompletados" INTEGER NOT NULL DEFAULT 0,
    "ontimeRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "retrabajoRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "portfolioFotos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "talleres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marcas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "ubicacion" TEXT,
    "tipo" TEXT,
    "website" TEXT,
    "volumenMensual" INTEGER NOT NULL DEFAULT 0,
    "frecuenciaCompra" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pedidosRealizados" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procesos_productivos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "maquinaria" TEXT[],
    "tiempoEstimado500u" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "procesos_productivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_prenda" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precioReferencia" DOUBLE PRECISION,
    "variantes" TEXT[],
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipos_prenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prenda_procesos" (
    "id" TEXT NOT NULL,
    "prendaId" TEXT NOT NULL,
    "procesoId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "prenda_procesos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taller_procesos" (
    "id" TEXT NOT NULL,
    "tallerId" TEXT NOT NULL,
    "procesoId" TEXT NOT NULL,
    "precio" DOUBLE PRECISION,

    CONSTRAINT "taller_procesos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taller_prendas" (
    "id" TEXT NOT NULL,
    "tallerId" TEXT NOT NULL,
    "prendaId" TEXT NOT NULL,

    CONSTRAINT "taller_prendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maquinaria" (
    "id" TEXT NOT NULL,
    "tallerId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "tipo" TEXT,

    CONSTRAINT "maquinaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taller_certificaciones" (
    "id" TEXT NOT NULL,
    "tallerId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "vencimiento" TIMESTAMP(3),
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "taller_certificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "omId" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "tipoPrenda" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaObjetivo" TIMESTAMP(3),
    "estado" "EstadoPedido" NOT NULL DEFAULT 'BORRADOR',
    "progresoTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "montoTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_manufactura" (
    "id" TEXT NOT NULL,
    "moId" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "tallerId" TEXT NOT NULL,
    "proceso" TEXT NOT NULL,
    "estado" "EstadoOrdenManufactura" NOT NULL DEFAULT 'PENDIENTE',
    "progreso" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "plazoDias" INTEGER,
    "diasTranscurridos" INTEGER NOT NULL DEFAULT 0,
    "verificacionSst" BOOLEAN NOT NULL DEFAULT false,
    "alertaTiempo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_manufactura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrow_hitos" (
    "id" TEXT NOT NULL,
    "ordenManufacturaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "porcentaje" DOUBLE PRECISION NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "estado" "EstadoEscrow" NOT NULL DEFAULT 'BLOQUEADO',

    CONSTRAINT "escrow_hitos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validaciones" (
    "id" TEXT NOT NULL,
    "tallerId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "estado" "EstadoValidacion" NOT NULL DEFAULT 'NO_INICIADO',
    "detalle" TEXT,
    "documentoUrl" TEXT,
    "fechaVencimiento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "validaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_documento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "requerido" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipos_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colecciones" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT,
    "duracion" TEXT,
    "calificacion" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "institucion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colecciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "coleccionId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "youtubeUrl" TEXT NOT NULL,
    "duracion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluaciones" (
    "id" TEXT NOT NULL,
    "coleccionId" TEXT NOT NULL,
    "preguntas" JSONB NOT NULL,
    "puntajeMinimo" INTEGER NOT NULL DEFAULT 60,

    CONSTRAINT "evaluaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificados" (
    "id" TEXT NOT NULL,
    "tallerId" TEXT NOT NULL,
    "coleccionId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calificacion" INTEGER NOT NULL,
    "revocado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "certificados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progreso_capacitacion" (
    "id" TEXT NOT NULL,
    "tallerId" TEXT NOT NULL,
    "coleccionId" TEXT NOT NULL,
    "porcentajeCompletado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "videosVistos" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progreso_capacitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias" (
    "id" TEXT NOT NULL,
    "tallerId" TEXT NOT NULL,
    "inspectorId" TEXT,
    "fecha" TIMESTAMP(3),
    "tipo" "TipoAuditoria" NOT NULL DEFAULT 'PRIMERA_VISITA',
    "prioridad" TEXT,
    "estado" "EstadoAuditoria" NOT NULL DEFAULT 'PROGRAMADA',
    "resultado" TEXT,
    "hallazgos" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acciones_correctivas" (
    "id" TEXT NOT NULL,
    "auditoriaId" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoAccionCorrectiva" NOT NULL DEFAULT 'PENDIENTE',
    "plazo" TIMESTAMP(3),
    "evidenciaUrl" TEXT,

    CONSTRAINT "acciones_correctivas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "denuncias" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tallerId" TEXT,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoDenuncia" NOT NULL DEFAULT 'RECIBIDA',
    "anonima" BOOLEAN NOT NULL DEFAULT false,
    "codigo" TEXT NOT NULL,
    "evidenciaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "denuncias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "canal" "CanalNotificacion" NOT NULL DEFAULT 'PLATAFORMA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_sistema" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "grupo" TEXT,

    CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_actividad" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "accion" TEXT NOT NULL,
    "detalles" JSONB,
    "ip" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_actividad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "talleres_userId_key" ON "talleres"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "talleres_cuit_key" ON "talleres"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "marcas_userId_key" ON "marcas"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "marcas_cuit_key" ON "marcas"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "procesos_productivos_nombre_key" ON "procesos_productivos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_prenda_nombre_key" ON "tipos_prenda"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "prenda_procesos_prendaId_procesoId_key" ON "prenda_procesos"("prendaId", "procesoId");

-- CreateIndex
CREATE UNIQUE INDEX "taller_procesos_tallerId_procesoId_key" ON "taller_procesos"("tallerId", "procesoId");

-- CreateIndex
CREATE UNIQUE INDEX "taller_prendas_tallerId_prendaId_key" ON "taller_prendas"("tallerId", "prendaId");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_omId_key" ON "pedidos"("omId");

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_manufactura_moId_key" ON "ordenes_manufactura"("moId");

-- CreateIndex
CREATE UNIQUE INDEX "validaciones_tallerId_tipo_key" ON "validaciones"("tallerId", "tipo");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_documento_nombre_key" ON "tipos_documento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "evaluaciones_coleccionId_key" ON "evaluaciones"("coleccionId");

-- CreateIndex
CREATE UNIQUE INDEX "certificados_codigo_key" ON "certificados"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "progreso_capacitacion_tallerId_coleccionId_key" ON "progreso_capacitacion"("tallerId", "coleccionId");

-- CreateIndex
CREATE UNIQUE INDEX "denuncias_codigo_key" ON "denuncias"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_sistema_clave_key" ON "configuracion_sistema"("clave");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talleres" ADD CONSTRAINT "talleres_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marcas" ADD CONSTRAINT "marcas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prenda_procesos" ADD CONSTRAINT "prenda_procesos_prendaId_fkey" FOREIGN KEY ("prendaId") REFERENCES "tipos_prenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prenda_procesos" ADD CONSTRAINT "prenda_procesos_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "procesos_productivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taller_procesos" ADD CONSTRAINT "taller_procesos_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taller_procesos" ADD CONSTRAINT "taller_procesos_procesoId_fkey" FOREIGN KEY ("procesoId") REFERENCES "procesos_productivos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taller_prendas" ADD CONSTRAINT "taller_prendas_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taller_prendas" ADD CONSTRAINT "taller_prendas_prendaId_fkey" FOREIGN KEY ("prendaId") REFERENCES "tipos_prenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maquinaria" ADD CONSTRAINT "maquinaria_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taller_certificaciones" ADD CONSTRAINT "taller_certificaciones_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_manufactura" ADD CONSTRAINT "ordenes_manufactura_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_manufactura" ADD CONSTRAINT "ordenes_manufactura_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_hitos" ADD CONSTRAINT "escrow_hitos_ordenManufacturaId_fkey" FOREIGN KEY ("ordenManufacturaId") REFERENCES "ordenes_manufactura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validaciones" ADD CONSTRAINT "validaciones_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_coleccionId_fkey" FOREIGN KEY ("coleccionId") REFERENCES "colecciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluaciones" ADD CONSTRAINT "evaluaciones_coleccionId_fkey" FOREIGN KEY ("coleccionId") REFERENCES "colecciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificados" ADD CONSTRAINT "certificados_coleccionId_fkey" FOREIGN KEY ("coleccionId") REFERENCES "colecciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_capacitacion" ADD CONSTRAINT "progreso_capacitacion_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_capacitacion" ADD CONSTRAINT "progreso_capacitacion_coleccionId_fkey" FOREIGN KEY ("coleccionId") REFERENCES "colecciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acciones_correctivas" ADD CONSTRAINT "acciones_correctivas_auditoriaId_fkey" FOREIGN KEY ("auditoriaId") REFERENCES "auditorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "denuncias" ADD CONSTRAINT "denuncias_tallerId_fkey" FOREIGN KEY ("tallerId") REFERENCES "talleres"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_actividad" ADD CONSTRAINT "log_actividad_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
