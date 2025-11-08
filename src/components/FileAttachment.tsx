import { useState, useRef } from 'react'
import { Paperclip, X, File, Image as ImageIcon, Video, FileText, Music } from 'lucide-react'
import { Attachment } from '../types'

interface FileAttachmentProps {
  attachments: Attachment[]
  onAddAttachment: (attachment: Attachment) => void
  onRemoveAttachment: (attachmentId: string) => void
  disabled?: boolean
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptedTypes = {
    'image/*': 'image',
    'video/*': 'video', 
    'audio/*': 'audio',
    'application/pdf': 'document',
    'text/*': 'document',
    'application/msword': 'document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document'
  }

  const getFileType = (file: File): 'image' | 'video' | 'audio' | 'document' => {
    for (const [mimeType, type] of Object.entries(acceptedTypes)) {
      if (mimeType.endsWith('/*')) {
        const baseType = mimeType.replace('/*', '')
        if (file.type.startsWith(baseType)) {
          return type as any
        }
      } else if (file.type === mimeType) {
        return type as any
      }
    }
    return 'document'
  }

  const getFileIcon = (type: 'image' | 'video' | 'audio' | 'document') => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />
      case 'video':
        return <Video className="w-4 h-4" />
      case 'audio':
        return <Music className="w-4 h-4" />
      case 'document':
        return <FileText className="w-4 h-4" />
      default:
        return <File className="w-4 h-4" />
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || disabled) return

    const maxFileSize = 10 * 1024 * 1024 // 10MB
    const maxFiles = 5

    if (attachments.length >= maxFiles) {
      alert(`最大${maxFiles}個までファイルを添付できます`)
      return
    }

    for (let i = 0; i < files.length && attachments.length + i < maxFiles; i++) {
      const file = files[i]

      if (file.size > maxFileSize) {
        alert(`ファイル ${file.name} が大きすぎます。最大サイズは ${formatFileSize(maxFileSize)} です`)
        continue
      }

      try {
        const base64Data = await readFileAsBase64(file)
        const attachment: Attachment = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          type: getFileType(file),
          name: file.name,
          mimeType: file.type,
          data: base64Data,
          size: file.size
        }

        onAddAttachment(attachment)
      } catch (error) {
        console.error('Failed to read file:', error)
        alert(`ファイル ${file.name} の読み込みに失敗しました`)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="space-y-3">
      {/* 添付ファイル一覧 */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-text-tertiary font-medium">添付ファイル</div>
          <div className="space-y-1">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 p-2 bg-surface-secondary border border-surface-border rounded-lg"
              >
                <div className="text-text-secondary">
                  {getFileIcon(attachment.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-primary truncate">
                    {attachment.name}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {formatFileSize(attachment.size)}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveAttachment(attachment.id)}
                  disabled={disabled}
                  className="p-1 hover:bg-surface-border rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-3 h-3 text-text-secondary" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ファイル添付エリア */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-primary bg-primary-light/5' 
            : 'border-surface-border hover:border-primary-light hover:bg-surface-secondary'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={Object.keys(acceptedTypes).join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <Paperclip className="w-6 h-6 text-text-secondary mx-auto mb-2" />
        <div className="text-sm text-text-primary">
          {isDragging ? 'ここにドロップ' : 'ファイルを添付'}
        </div>
        <div className="text-xs text-text-tertiary mt-1">
          クリックまたはドラッグ＆ドロップ (最大10MB, 最大5ファイル)
        </div>
        <div className="text-xs text-text-tertiary mt-1">
          対応: 画像, 動画, 音声, PDF, テキスト, Word
        </div>
      </div>
    </div>
  )
}
