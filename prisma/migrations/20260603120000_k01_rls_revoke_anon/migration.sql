-- K-01 — Seguridad RLS: cerrar leak de dev + blindar (defensa en profundidad)
--
-- Contexto: con la anon key publica, PostgREST en dev (fjddgukwydsdcrqoxvns)
-- servia datos reales de tablas sensibles (users con hashes bcrypt, etc.).
-- Causa: RLS OFF + grants por defecto de Supabase al rol anon/authenticated.
--
-- Esta migracion:
--   Capa A: ENABLE ROW LEVEL SECURITY en las 44 tablas de public.* (deny por
--           defecto a anon/authenticated; el rol postgres -dueño- y service_role
--           bypassan RLS, por lo que Prisma y Storage NO se ven afectados).
--   Capa B: REVOKE de grants + USAGE + default privileges a anon/authenticated.
--   Capa C: ninguna policy (la app nunca lee la DB como anon; las paginas
--           publicas leen via Prisma server-side).
--
-- Reversible: ver rollback en .claude/specs/k-01-rls-supabase.md (§8).

-- ============================================================
-- Capa A — ENABLE ROW LEVEL SECURITY (44 tablas)
-- ============================================================
ALTER TABLE public.acciones_correctivas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuraciones_upload ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas_arca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_rag ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_hitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_evaluacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_actividad ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maquinaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motivos_no_match ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_internas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_seguimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.novedades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observaciones_campo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes_manufactura ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_invitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prenda_procesos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procesos_productivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progreso_capacitacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reglas_nivel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taller_certificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taller_plantilla ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taller_prendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taller_procesos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talleres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_documento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_prenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Capa B — REVOKE grants a anon / authenticated (belt-and-suspenders)
-- Lleva a dev al estado endurecido (deny duro a nivel schema).
-- ============================================================
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
REVOKE USAGE ON SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

-- Capa C — sin policies: la app no accede como anon/authenticated.
