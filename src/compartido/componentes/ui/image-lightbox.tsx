'use client'

export function ImageLightbox({
  src,
  onClose,
}: {
  src: string
  onClose: () => void
}) {
  return (
    <dialog
      open
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 cursor-pointer"
      style={{
        width: '100vw',
        height: '100vh',
        maxWidth: 'unset',
        maxHeight: 'unset',
        border: 'none',
        margin: 0,
        padding: '2rem',
      }}
    >
      <img
        src={src}
        alt="Ampliada"
        loading="lazy"
        className="max-w-full max-h-full object-contain rounded-lg cursor-default"
        onClick={(e) => e.stopPropagation()}
      />
    </dialog>
  )
}
