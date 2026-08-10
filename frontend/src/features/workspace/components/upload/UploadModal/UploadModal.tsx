import { useRef, useState, useCallback } from 'react';
import { Upload, X, FileText, FolderOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_MB } from '../../../constants';
import './UploadModal.css';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onUploadSuccess: () => void;
}

interface PendingFile {
  file: File;
  name: string;
  sizeLabel: string;
  error?: string; // client-side validation error
}

const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Returns an error string if the file fails validation, or null if valid. */
function validateFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const isValidType =
    file.type === 'application/pdf' || ext === 'pdf';

  if (!isValidType) {
    return `"${file.name}" is not a PDF. Only PDF files are accepted.`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" is ${formatBytes(file.size)}, which exceeds the ${MAX_FILE_SIZE_MB} MB limit.`;
  }
  return null;
}

export function UploadModal({ isOpen, onClose, projectId, onUploadSuccess }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    setUploadError(null);

    const newFiles = Array.from(files).map((f) => ({
      file: f,
      name: f.name,
      sizeLabel: formatBytes(f.size),
      error: validateFile(f) ?? undefined,
    }));

    setPendingFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadError(null);
  };

  const validFiles = pendingFiles.filter((f) => !f.error);

  const handleUpload = async () => {
    if (validFiles.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const { documentService } = await import('../../../services/documentService');
      await Promise.all(validFiles.map((pf) => documentService.uploadDocument(projectId, pf.file)));
      setUploadSuccess(true);
      setPendingFiles([]);
      onUploadSuccess();
      // Small delay so the user sees the success state before the modal closes
      setTimeout(() => {
        setUploadSuccess(false);
        onClose();
      }, 800);
    } catch (err: any) {
      const message =
        err?.message || 'Upload failed. Please check the file and try again.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setPendingFiles([]);
    setUploadError(null);
    setUploadSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  const hasInvalidFiles = pendingFiles.some((f) => f.error);

  return (
    <div
      className="rf-upload-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Upload documents"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="rf-upload-modal animate-scale-in">
        {/* ── Header ── */}
        <div className="rf-upload-modal__header">
          <div className="rf-upload-modal__title-row">
            <Upload size={18} aria-hidden="true" />
            <h2 className="rf-upload-modal__title">Upload Documents</h2>
          </div>
          <button
            className="rf-upload-modal__close"
            onClick={handleClose}
            aria-label="Close upload dialog"
            id="upload-modal-close"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* ── Error Banner ── */}
        {uploadError && (
          <div className="rf-upload-modal__error-banner" role="alert" aria-live="assertive">
            <AlertCircle size={15} aria-hidden="true" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* ── Success Banner ── */}
        {uploadSuccess && (
          <div className="rf-upload-modal__success-banner" role="status">
            <CheckCircle2 size={15} aria-hidden="true" />
            <span>Files uploaded successfully!</span>
          </div>
        )}

        {/* ── Drop Zone ── */}
        <div
          className={`rf-upload-zone ${isDragging ? 'rf-upload-zone--dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          role="region"
          aria-label="Drop zone for file upload"
        >
          {pendingFiles.length === 0 ? (
            <>
              <div className="rf-upload-zone__icon" aria-hidden="true">
                <Upload size={32} />
              </div>
              <p className="rf-upload-zone__title">
                {isDragging ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="rf-upload-zone__hint">
                PDF only · Max {MAX_FILE_SIZE_MB} MB per file
              </p>
            </>
          ) : (
            <div className="rf-upload-zone__files">
              {pendingFiles.map((file, i) => (
                <div
                  key={i}
                  className={`rf-upload-file ${file.error ? 'rf-upload-file--invalid' : ''}`}
                >
                  <div className="rf-upload-file__icon" aria-hidden="true">
                    <FileText size={16} />
                  </div>
                  <div className="rf-upload-file__info">
                    <span className="rf-upload-file__name">{file.name}</span>
                    {file.error ? (
                      <span className="rf-upload-file__error">{file.error}</span>
                    ) : (
                      <span className="rf-upload-file__size">{file.sizeLabel}</span>
                    )}
                  </div>
                  <button
                    className="rf-upload-file__remove"
                    onClick={() => removeFile(i)}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Browse input ── */}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="rf-upload-modal__file-input"
          onChange={(e) => addFiles(e.target.files)}
          aria-label="Choose files to upload"
          id="file-upload-input"
        />

        {/* ── Footer ── */}
        <div className="rf-upload-modal__footer">
          <button
            className="rf-upload-modal__browse"
            onClick={() => inputRef.current?.click()}
            id="browse-files-btn"
          >
            <FolderOpen size={15} aria-hidden="true" />
            Browse Files
          </button>
          <button
            className="rf-upload-modal__upload-btn"
            disabled={validFiles.length === 0 || isUploading || hasInvalidFiles}
            id="upload-submit-btn"
            onClick={handleUpload}
            aria-label={`Upload ${validFiles.length} file${validFiles.length !== 1 ? 's' : ''}`}
          >
            {isUploading
              ? 'Uploading…'
              : validFiles.length > 0
              ? `Upload (${validFiles.length})`
              : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}
