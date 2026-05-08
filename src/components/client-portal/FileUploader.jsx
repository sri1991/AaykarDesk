import { useDropzone } from 'react-dropzone'
import { UploadCloud, CheckCircle2, Loader2 } from 'lucide-react'
import { cx } from '../../lib/utils.js'

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}
const MAX_BYTES = 10 * 1024 * 1024

export default function FileUploader({ status, onFile, fileName, busy }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPT,
    maxFiles: 1,
    maxSize: MAX_BYTES,
    onDrop: (accepted) => accepted[0] && onFile(accepted[0]),
    disabled: busy,
  })

  if (status === 'uploaded' || status === 'verified') {
    return (
      <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
        <CheckCircle2 className="h-4 w-4" />
        <span className="flex-1 truncate">{fileName || 'Uploaded'}</span>
        <button onClick={() => onFile(null)} className="text-xs text-emerald-700 underline">
          Replace
        </button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cx(
        'flex items-center gap-2 rounded-md border-2 border-dashed px-3 py-3 cursor-pointer transition text-sm',
        isDragActive
          ? 'border-navy-500 bg-navy-50 text-navy-900'
          : 'border-navy-200 bg-white text-navy-700 hover:bg-cream-100',
        busy && 'opacity-60 pointer-events-none',
      )}
    >
      <input {...getInputProps()} />
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4 text-navy-500" />}
      <span className="flex-1">
        {busy ? 'Uploading…' : isDragActive ? 'Drop file' : 'Tap to upload (PDF, JPG, PNG · 10 MB max)'}
      </span>
    </div>
  )
}
