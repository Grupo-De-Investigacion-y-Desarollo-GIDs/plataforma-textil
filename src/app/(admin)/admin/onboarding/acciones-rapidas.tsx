'use client'

import { useState } from 'react'
import { Button } from '@/compartido/componentes/ui/button'
import { useToast } from '@/compartido/componentes/ui/toast'
import { EditorMensajeIndividual } from '@/admin/componentes/editor-mensaje-individual'
import { Mail, MessageSquare } from 'lucide-react'
import type { EtapaOnboarding } from '@/compartido/lib/onboarding'

interface Props {
  userId: string
  userName: string
  userRole: string
  userPhone: string | null
  etapa: EtapaOnboarding
}

export function AccionesRapidasOnboarding({ userId, userName, userRole, userPhone, etapa }: Props) {
  const [enviandoInvitacion, setEnviandoInvitacion] = useState(false)
  const [mostrarEditor, setMostrarEditor] = useState(false)
  const { toast } = useToast()

  async function reenviarInvitacion() {
    setEnviandoInvitacion(true)
    try {
      const res = await fetch('/api/admin/onboarding/reenviar-invitacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      if (!res.ok) throw new Error('Error al reenviar')
      toast('Invitacion reenviada', 'success')
    } catch {
      toast('No se pudo reenviar la invitacion', 'error')
    } finally {
      setEnviandoInvitacion(false)
    }
  }

  if (etapa === 'INVITADO') {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={reenviarInvitacion}
        loading={enviandoInvitacion}
      >
        <Mail className="w-3.5 h-3.5 mr-1" />
        Reenviar invitacion
      </Button>
    )
  }

  if (etapa === 'REGISTRADO' || etapa === 'INACTIVO') {
    return (
      <>
        <Button size="sm" variant="secondary" onClick={() => setMostrarEditor(true)}>
          <MessageSquare className="w-3.5 h-3.5 mr-1" />
          Enviar mensaje
        </Button>
        {mostrarEditor && (
          <EditorMensajeIndividual
            destinatarioId={userId}
            destinatarioNombre={userName}
            destinatarioRol={userRole as 'TALLER' | 'MARCA' | 'ADMIN' | 'ESTADO' | 'CONTENIDO'}
            destinatarioTienePhone={!!userPhone}
            onCerrar={() => setMostrarEditor(false)}
          />
        )}
      </>
    )
  }

  return <span className="text-xs text-gray-400">—</span>
}
