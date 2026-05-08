import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileText } from 'lucide-react'
import { cx } from '../../lib/utils.js'

const MAX_BYTES = 25 * 1024 * 1024

export default function NoticeUpload({ file, onFile, error }) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: MAX_BYTES,
    onDrop: (accepted) => accepted[0] && onFile(accepted[0]),
  })

  const reject = fileRejections[0]?.errors?.[0]?.message

  return (
    <div>
      <div
        {...getRootProps()}
        className={cx(
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-8 py-16 cursor-pointer transition',
          isDragActive
            ? 'border-navy-500 bg-navy-50'
            : 'border-navy-200 bg-cream-100 hover:bg-cream-200',
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-10 w-10 text-navy-500 mb-3" />
        <p className="font-display text-base font-medium text-navy-900">
          {isDragActive ? 'Drop the notice PDF here' : 'Drop a notice PDF, or click to browse'}
        </p>
        <p className="text-sm text-navy-600 mt-1">
          PDF only, up to 25 MB. The AI will extract section, deadline, and the document checklist.
        </p>
      </div>

      {file && (
        <div className="mt-4 flex items-center gap-3 rounded-md border border-navy-100 bg-white px-4 py-3">
          <FileText className="h-5 w-5 text-navy-500" />
          <div className="flex-1">
            <div className="text-sm font-medium text-navy-900">{file.name}</div>
            <div className="text-xs text-navy-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB · PDF
            </div>
          </div>
          <button onClick={() => onFile(null)} className="btn-ghost text-xs">
            Remove
          </button>
        </div>
      )}

      {(error || reject) && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error || reject}
        </div>
      )}
    </div>
  )
}
