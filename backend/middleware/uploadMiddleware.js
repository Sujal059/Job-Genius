import multer from "multer";
import AppError from "../utils/AppError.js";

const MAX_BYTES = Number(process.env.MAX_RESUME_SIZE_BYTES) || 8 * 1024 * 1024; // 8MB default

// We keep the file in memory (not on disk) — pdf-parse just needs the
// Buffer, and we never need to persist the raw file, only its extracted
// text. This also avoids cleaning up temp files after every request.
const storage = multer.memoryStorage();

function pdfOnlyFilter(req, file, cb) {
  const isPdf =
    file.mimetype === "application/pdf" ||
    file.originalname?.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return cb(new AppError("Please upload your resume as a PDF file.", 400));
  }
  cb(null, true);
}

/**
 * Single-file resume upload, expected under the form field name "resume".
 * Usage: router.post("/", uploadResume, controllerFn)
 */
export const uploadResume = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: pdfOnlyFilter,
}).single("resume");

export default uploadResume;
