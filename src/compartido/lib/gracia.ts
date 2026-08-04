// Etapa 2.3-B: gracia de 60 dias para verificar CUIT.
//
// Este modulo es PURO (sin Prisma, sin `new Date()` interno): las fechas se inyectan,
// asi la clasificacion es testeable sin esperar 60 dias reales. Lo usan:
//   - los banners del dashboard (B0, en vivo con `new Date()` del server component)
//   - el cron (B1) para decidir email dia ~50 e inactivacion dia 60
//   - el alta de un taller (B0) para el estado inicial (`estadoCuentaInicial`)

/** Dias de gracia para verificar el CUIT antes de pasar a INACTIVA. */
export const DIAS_GRACIA = 60

/**
 * Umbral de "vence pronto" (ventana del recordatorio de B1). A partir de este dia y
 * hasta el 60, el cron manda el email — es una VENTANA (>=50), no el dia 50 exacto,
 * para tolerar una corrida perdida del cron.
 */
export const DIAS_VENCE_PRONTO = 50

const MS_POR_DIA = 86_400_000

/**
 * Estado FINO de la gracia, computado en vivo desde `inicioGracia`. Distinto del
 * `estadoCuenta` ALMACENADO (coarse: ACTIVA/EN_GRACIA/INACTIVA que mantienen alta +
 * backfill + cron). `VENCE_PRONTO` y `NO_APLICA` no existen como estado almacenado:
 *   - VENCE_PRONTO = sub-ventana de EN_GRACIA (dia >=50) para el email de B1.
 *   - NO_APLICA    = corresponde a ACTIVA (verificado o sin reloj de gracia).
 */
export type EstadoGracia = 'NO_APLICA' | 'EN_GRACIA' | 'VENCE_PRONTO' | 'INACTIVA'

export interface ResultadoGracia {
  estado: EstadoGracia
  /** Dias transcurridos desde `inicioGracia` (0 si no aplica). */
  diasTranscurridos: number
  /** Dias hasta el dia 60 (para el countdown del banner). 0 si vencio o no aplica. */
  diasRestantes: number
}

type TallerGracia = {
  verificadoAfip?: boolean | null
  inicioGracia?: Date | null
}

/**
 * Clasifica la situacion de gracia de un taller a una fecha dada (`ahora`). PURA.
 *
 * - Verificado o sin `inicioGracia` -> NO_APLICA (no hay reloj corriendo).
 * - dia < 50   -> EN_GRACIA
 * - 50 <= dia < 60 -> VENCE_PRONTO (ventana del email)
 * - dia >= 60  -> INACTIVA
 *
 * El dia se cuenta en UTC-agnostico por diferencia de timestamps (Date es un instante):
 * `floor((ahora - inicioGracia) / dia)`. Dia 0 = mismo dia que inicioGracia.
 */
export function clasificarGracia(taller: TallerGracia, ahora: Date): ResultadoGracia {
  if (taller.verificadoAfip || !taller.inicioGracia) {
    return { estado: 'NO_APLICA', diasTranscurridos: 0, diasRestantes: 0 }
  }
  const diasTranscurridos = Math.floor((ahora.getTime() - taller.inicioGracia.getTime()) / MS_POR_DIA)
  const diasRestantes = Math.max(0, DIAS_GRACIA - diasTranscurridos)

  if (diasTranscurridos >= DIAS_GRACIA) {
    return { estado: 'INACTIVA', diasTranscurridos, diasRestantes: 0 }
  }
  if (diasTranscurridos >= DIAS_VENCE_PRONTO) {
    return { estado: 'VENCE_PRONTO', diasTranscurridos, diasRestantes }
  }
  return { estado: 'EN_GRACIA', diasTranscurridos, diasRestantes }
}

/**
 * Estado de cuenta inicial al crear un taller (B0). Verificado -> ACTIVA sin reloj;
 * sin verificar -> EN_GRACIA con el reloj arrancando en `ahora` (su alta). Devuelve
 * string literals que Prisma acepta directo en el `create` (sin importar el enum
 * generado, para no acoplar este modulo puro a @prisma/client).
 */
export function estadoCuentaInicial(
  verificadoAfip: boolean,
  ahora: Date,
): { estadoCuenta: 'ACTIVA' | 'EN_GRACIA'; inicioGracia: Date | null } {
  return verificadoAfip
    ? { estadoCuenta: 'ACTIVA', inicioGracia: null }
    : { estadoCuenta: 'EN_GRACIA', inicioGracia: ahora }
}

/**
 * Campos a escribir cuando un taller EN_GRACIA o INACTIVA verifica su CUIT (B1):
 * vuelve a ACTIVA y se limpia todo el reloj (inicioGracia, inactivadaAt y el marcador
 * de idempotencia del recordatorio). PURA — la usa `sincronizarTaller` al setear
 * `verificadoAfip: true`, asi la reactivacion es automatica y sin trámite extra.
 */
export function datosReactivacion(): {
  estadoCuenta: 'ACTIVA'
  inicioGracia: null
  inactivadaAt: null
  recordatorioCuitEnviadoAt: null
} {
  return {
    estadoCuenta: 'ACTIVA',
    inicioGracia: null,
    inactivadaAt: null,
    recordatorioCuitEnviadoAt: null,
  }
}

/**
 * Accion que el cron diario (B1) debe tomar sobre un taller EN_GRACIA a la fecha `ahora`.
 * PURA — separa la DECISION (testeable con fechas fabricadas) de la EJECUCION (writes +
 * emails en la route). El cron ya filtra por `estadoCuenta = EN_GRACIA`; esta funcion
 * re-chequea de forma defensiva y clasifica:
 *
 *   - INACTIVAR    : el reloj llego a >=60 dias (clasificacion INACTIVA).
 *   - RECORDATORIO : esta en la ventana [50, 60) y NO se envio el recordatorio todavia
 *                    (idempotencia por `recordatorioCuitEnviadoAt`).
 *   - NADA         : verificado, no EN_GRACIA, dia <50, o recordatorio ya enviado.
 *
 * La INACTIVACION tiene prioridad sobre el RECORDATORIO: si el cron se saltea corridas y
 * el taller salta directo a >=60 sin haber recibido el recordatorio, se inactiva (y la
 * route manda el email de inactivacion, no el de recordatorio).
 */
export type AccionGracia = 'NADA' | 'RECORDATORIO' | 'INACTIVAR'

export function planificarAccionGracia(
  taller: TallerGracia & {
    estadoCuenta?: string | null
    recordatorioCuitEnviadoAt?: Date | null
  },
  ahora: Date,
): AccionGracia {
  if (taller.verificadoAfip || taller.estadoCuenta !== 'EN_GRACIA') return 'NADA'

  const { estado } = clasificarGracia(taller, ahora)
  if (estado === 'INACTIVA') return 'INACTIVAR'
  if (estado === 'VENCE_PRONTO' && !taller.recordatorioCuitEnviadoAt) return 'RECORDATORIO'
  return 'NADA'
}
