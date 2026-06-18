import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  UploadCloud,
  Loader2,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  File as FileIcon,
} from 'lucide-react'
import {
  cx,
  buildDropzoneAccept,
  acceptedTypesLabel,
  isImageFileType,
  formatFileSize,
  formatUploadTime,
  truncateFilename,
  fileExtension,
} from '../../lib/utils.js'

const MAX_BYTES = 10 * 1024 * 1024

function FileTypeIcon({ name, type }) {
  const ext = fileExtension(name)
  if (ext === 'xlsx' || ext === 'csv' || (type || '').includes('spreadsheet')) {
    return <FileSpreadsheet className="h-6 w-6 text-emerald-700" />
  }
  if (ext === 'pdf' || (type || '').includes('pdf')) {
    return <FileText className="h-6 w-6 text-red-600" />
  }
  return <FileIcon className="h-6 w-6 text-navy-500" />
}

export default function FileUploader({ status, onFile, busy, acceptedFileTypes, upload, previewUrl }) {
  const [error, setError] = useState(null)
  const typesLabel = acceptedTypesLabel(acceptedFileTypes)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: buildDropzoneAccept(acceptedFileTypes),
    maxFiles: 1,
    maxSize: MAX_BYTES,
    disabled: busy,
    onDrop: (accepted) => {
      if (accepted[0]) {
        setError(null)
        onFile(accepted[0])
      }
    },
    onDropRejected: (rejections) => {
      const tooLarge = rejections.some((r) =>
        r.errors?.some((e) => e.code === 'file-too-large'),
      )
      setError(
        tooLarge
          ? 'This file is larger than 10 MB. Please upload a smaller file.'
          : `This document accepts ${typesLabel} only. Please upload a ${typesLabel} file.`,
      )
    },
  })

  if (status === 'uploaded' || status === 'verified') {
    const name = upload?.file_name || 'Uploaded file'
    const showImage = previewUrl && isImageFileType(upload?.file_type || name)
    return (
      <div className="flex items-center gap-3 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2">
        <div className="shrink-0 grid place-items-center h-[60px] w-[60px] rounded border border-emerald-200 bg-white overflow-hidden">
          {showImage ? (
            <img src={previewUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <FileTypeIcon name={name} type={upload?.file_type} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-emerald-900 truncate" title={name}>
            {truncateFilename(name, 40)}
          </div>
          <div className="text-xs text-emerald-800/80 mt-0.5">
            Uploaded {formatUploadTime(upload?.uploaded_at)}
            {upload?.file_size != null && ` · ${formatFileSize(upload.file_size)}`}
          </div>
        </div>
        <button
          onClick={() => onFile(null)}
          className="text-xs text-emerald-700 underline shrink-0"
        >
          Replace
        </button>
      </div>
    )
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={cx(
          'flex items-center gap-2 rounded-md border-2 border-dashed px-3 py-3 cursor-pointer transition text-sm',
          isDragActive
            ? 'border-navy-500 bg-navy-50 text-navy-900'
            : error
            ? 'border-red-300 bg-red-50 text-navy-700'
            : 'border-navy-200 bg-white text-navy-700 hover:bg-cream-100',
          busy && 'opacity-60 pointer-events-none',
        )}
      >
        <input {...getInputProps()} />
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="h-4 w-4 text-navy-500" />
        )}
        <span className="flex-1">
          {busy
            ? 'Uploading…'
            : isDragActive
            ? 'Drop file'
            : `Tap to upload (${typesLabel} · 10 MB max)`}
        </span>
      </div>
      {error && (
        <div className="mt-1.5 flex items-start gap-1.5 text-xs text-red-700">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
