import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import clsx from "clsx";

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Every feature page uses this for the resume upload step. Validates PDF
 * type + size client-side (the backend re-validates too — never trust the
 * browser alone) and shows a clean "file selected" state once chosen.
 */
export function FileDropzone({ file, onFileSelected, label = "Upload your resume" }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  const validateAndSet = useCallback(
    (candidate) => {
      setLocalError("");
      if (!candidate) return;
      const isPdf = candidate.type === "application/pdf" || candidate.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        setLocalError("Please choose a PDF file.");
        return;
      }
      if (candidate.size > MAX_BYTES) {
        setLocalError("That file is larger than 8MB.");
        return;
      }
      onFileSelected(candidate);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      validateAndSet(e.dataTransfer.files?.[0]);
    },
    [validateAndSet]
  );

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-line bg-sunken px-4 py-3">
        <FileText size={20} className="shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-main">{file.name}</p>
          <p className="font-mono text-xs text-faint">{(file.size / 1024).toFixed(0)} KB</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onFileSelected(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="shrink-0 text-faint transition-colors hover:text-danger"
          aria-label="Remove file"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={clsx(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-10 text-center transition-colors",
          isDragging ? "border-accent bg-accent-soft" : "border-line bg-sunken hover:border-line-glow"
        )}
      >
        <UploadCloud size={26} className={isDragging ? "text-accent" : "text-faint"} />
        <p className="text-sm text-main">{label}</p>
        <p className="text-xs text-faint">Drag &amp; drop a PDF here, or click to browse (max 8MB)</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => validateAndSet(e.target.files?.[0])}
        />
      </label>
      {localError && <p className="mt-2 text-xs text-danger">{localError}</p>}
    </div>
  );
}

export default FileDropzone;
