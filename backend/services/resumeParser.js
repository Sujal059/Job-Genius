import pdfParse from "pdf-parse";
import AppError from "../utils/AppError.js";

// Resumes are 1-3 pages; this cap is a generous safety net against someone
// accidentally uploading a huge PDF (e.g. a portfolio) and blowing up the
// AI prompt size / cost.
const MAX_CHARS_SENT_TO_AI = 20000;
const MIN_MEANINGFUL_CHARS = 30;

/**
 * Extracts and lightly cleans the text of an uploaded resume PDF.
 *
 * @param {Buffer} fileBuffer - Raw PDF bytes from multer's memory storage.
 * @returns {Promise<{ text: string, pageCount: number, truncated: boolean }>}
 */
export async function parseResumePdf(fileBuffer) {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new AppError("Please attach your resume as a PDF file.", 400);
  }

  let parsed;
  try {
    parsed = await pdfParse(fileBuffer);
  } catch (err) {
    throw new AppError(
      "We couldn't read that PDF. It may be corrupted, password-protected, or in an unsupported format.",
      400
    );
  }

  const cleaned = (parsed.text || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (cleaned.length < MIN_MEANINGFUL_CHARS) {
    throw new AppError(
      "We couldn't find readable text in that PDF. If it's a scanned image, please upload a text-based PDF resume instead.",
      400
    );
  }

  const truncated = cleaned.length > MAX_CHARS_SENT_TO_AI;

  return {
    text: truncated ? cleaned.slice(0, MAX_CHARS_SENT_TO_AI) : cleaned,
    pageCount: parsed.numpages || 1,
    truncated,
  };
}

export default { parseResumePdf };
