'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import { cn } from '@/compartido/lib/utils'

interface FileUploadProps {
  accept?: string
  maxSizeMB?: number
  maxFiles?: number
  showPreviews?: boolean
  onChange: (files: File[]) => void
  className?: string
}

export function FileUpload({ accept, maxSizeMB = 10, maxFiles, showPreviews, onChange, className }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const acceptedTypes = accept ? accept.split(',').map(t => t.trim()) : []

  function isFormatValid(file: File): boolean {
    if (acceptedTypes.length === 0) return true
    return acceptedTypes.some(type => {
      if (type.startsWith('.')) return file.name.toLowerCase().endsWith(type)
      if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', '/'))
      return file.type === type
    })
  }

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return
    setError(null)

    const incoming = Array.from(newFiles)

    // Validar formato
    const invalidFormat = incoming.filter(f => !isFormatValid(f))
    if (invalidFormat.length > 0) {
      setError(`Formato no soportado: ${invalidFormat.map(f => f.name).join(', ')}. Formatos aceptados: ${accept}`)
      return
    }

    // Validar tamaño
    const tooLarge = incoming.filter(f => f.size > maxSizeMB * 1024 * 1024)
    if (tooLarge.length > 0) {
      setError(`${tooLarge.map(f => f.name).join(', ')} supera el máximo de ${maxSizeMB}MB`)
      return
    }

    const combined = [...files, ...incoming]
    const limited = maxFiles ? combined.slice(0, maxFiles) : combined
    setFiles(limited)
    onChange(limited)
  }

  function removeFile(index: number) {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    onChange(updated)
  }

  const limitReached = maxFiles ? files.length >= maxFiles : false

  return (
    <div className={cn('w-full', className)}>
      {!limitReached ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            dragOver ? 'border-brand-blue bg-brand-bg-light' : 'border-gray-300 hover:border-brand-blue'
          )}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Arrastra archivos o <span className="text-brand-blue font-semibold">hace click</span></p>
          <p className="text-xs text-gray-400 mt-1">Maximo {maxSizeMB}MB por archivo</p>
          <input ref={inputRef} type="file" accept={accept} multiple onChange={(e) => addFiles(e.target.files)} className="hidden" />
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center bg-gray-50">
          <p className="text-sm font-medium text-gray-600">Máximo de {maxFiles} archivos alcanzado</p>
          <p className="text-xs text-gray-400 mt-1">Eliminá un archivo para subir otro</p>
        </div>
      )}
      {error && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                {showPreviews && file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <FileText className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
              </div>
              <button onClick={() => removeFile(i)} className="p-1 hover:bg-gray-200 rounded">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
