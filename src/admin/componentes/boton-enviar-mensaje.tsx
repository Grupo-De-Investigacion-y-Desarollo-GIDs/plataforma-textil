'use client'

import { useState } from 'react'
import { Button } from '@/compartido/componentes/ui/button'
import { EditorMensajeIndividual } from './editor-mensaje-individual'
import { MessageSquare } from 'lucide-react'

interface Props {
  destinatarioId: string
  destinatarioNombre: string
  destinatarioRol: 'TALLER' | 'MARCA' | 'ADMIN' | 'ESTADO' | 'CONTENIDO'
  destinatarioTienePhone: boolean
}

export function BotonEnviarMensaje(props: Props) {
  const [mostrarEditor, setMostrarEditor] = useState(false)

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        icon={<MessageSquare className="w-4 h-4" />}
        onClick={() => setMostrarEditor(true)}
      >
        Enviar mensaje
      </Button>
      {mostrarEditor && (
        <EditorMensajeIndividual
          {...props}
          onCerrar={() => setMostrarEditor(false)}
        />
      )}
    </>
  )
}
