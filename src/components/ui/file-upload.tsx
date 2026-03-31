'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  accept?: string
  maxSizeMB?: number
  onChange: (files: File[]) => void
  className?: string
}

export function FileUpload({ accept, maxSizeMB = 10, onChange, className }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return
    const valid = Array.from(newFiles).filter(f => f.size <= maxSizeMB * 1024 * 1024)
    const updated = [...files, ...valid]
    setFiles(updated)
    onChange(updated)
  }

  function removeFile(index: number) {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
    onChange(updated)
  }

  return (
    <div className={cn('w-full', className)}>
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
        <p className="text-sm text-gray-600">Arrastrá archivos o <span className="text-brand-blue font-semibold">hacé click</span></p>
        <p className="text-xs text-gray-400 mt-1">Máximo {maxSizeMB}MB por archivo</p>
        <input ref={inputRef} type="file" accept={accept} multiple onChange={(e) => addFiles(e.target.files)} className="hidden" />
      </div>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
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
