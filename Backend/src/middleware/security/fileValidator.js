/**
 * @file fileValidator.js
 * @description File upload security middleware with magic-byte validation and path traversal protection.
 *
 * Layers implemented:
 *  1. Magic-byte validation — reads the actual file signature (first bytes) to verify
 *     the real file type, defeating extension/MIME spoofing attacks.
 *  2. Dangerous extension blocklist — rejects executable and web-shell file types
 *     regardless of MIME type reported by the client.
 *  3. Path traversal guard — ensures local file download paths cannot escape the
 *     designated uploads/ directory using ../ sequences.
 *  4. Filename sanitization — strips null bytes and path characters from filenames.
 *
 * Attack vectors mitigated:
 *  - Malicious file upload / web shell upload (OWASP A05:2021)
 *  - Path traversal / directory traversal (OWASP A01:2021)
 *  - Double extension bypass (e.g. shell.php.pdf)
 *  - Null-byte injection in filenames (e.g. file.pdf%00.php)
 */

import fs from 'fs';
import path from 'path';
import AppError from '../../utils/AppError.js';

// ─── 1. Magic Byte Signatures ────────────────────────────────────────────────
// Map of MIME type → hex byte signatures (first N bytes of file)
const MAGIC_BYTES = {
  // Images
  'image/jpeg':     ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffdb', 'ffd8ffee'],
  'image/png':      ['89504e47'],
  'image/webp':     ['52494646'],    // RIFF....WEBP
  'image/gif':      ['47494638'],    // GIF8
  // Documents
  'application/pdf': ['25504446'],   // %PDF
  // Zip-based formats (docx, pptx, xlsx are ZIP internally)
  'application/zip':                     ['504b0304', '504b0506', '504b0708'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':  ['504b0304'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['504b0304'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':         ['504b0304'],
  // Legacy Office formats
  'application/msword':      ['d0cf11e0'],
  'application/vnd.ms-excel': ['d0cf11e0'],
  'application/vnd.ms-powerpoint': ['d0cf11e0'],
  // Media
  'video/mp4':  ['00000018', '00000020', '66747970'],
  'video/webm': ['1a45dfa3'],
};

// ─── 2. Dangerous Extension Blocklist ───────────────────────────────────────
const BLOCKED_EXTENSIONS = new Set([
  '.php', '.php3', '.php4', '.php5', '.phtml', '.phar',
  '.asp', '.aspx', '.ashx', '.asmx',
  '.jsp', '.jspx', '.jspf',
  '.cgi', '.pl', '.py', '.rb', '.sh', '.bash', '.zsh',
  '.exe', '.bat', '.cmd', '.com', '.msi', '.dll', '.so',
  '.jar', '.war', '.ear',
  '.htaccess', '.htpasswd',
  '.config', '.ini', '.env',
  '.svg',  // SVGs can contain inline scripts
]);

// ─── 3. Read Magic Bytes Helper ──────────────────────────────────────────────

/**
 * Reads the first 8 bytes of a file and returns them as a lowercase hex string.
 * @param {string} filePath
 * @returns {Promise<string>}
 */
const readMagicBytes = (filePath) => {
  return new Promise((resolve, reject) => {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(8);
    try {
      fs.readSync(fd, buffer, 0, 8, 0);
      resolve(buffer.toString('hex').toLowerCase());
    } catch (err) {
      reject(err);
    } finally {
      fs.closeSync(fd);
    }
  });
};

/**
 * Checks if the file's actual magic bytes match expected signatures for its MIME type.
 * @param {string} filePath - Absolute path to the file
 * @param {string} mimeType - MIME type claimed by the client
 * @returns {Promise<boolean>}
 */
const verifyMagicBytes = async (filePath, mimeType) => {
  const signatures = MAGIC_BYTES[mimeType];
  // If we have no signature mapping for this MIME type, allow it (unknown type)
  if (!signatures) return true;

  try {
    const magic = await readMagicBytes(filePath);
    return signatures.some((sig) => magic.startsWith(sig));
  } catch {
    // If we can't read the file, block it to be safe
    return false;
  }
};

// ─── 4. Filename Sanitizer ───────────────────────────────────────────────────

/**
 * Sanitizes a filename by removing path traversal characters and null bytes.
 * @param {string} filename
 * @returns {string}
 */
export const sanitizeFilename = (filename) => {
  if (!filename) return 'upload';
  // Truncate at null byte (simulating operating system null-byte string termination)
  const noNullByte = filename.split('\0')[0];
  return path
    .basename(noNullByte)              // Strip any directory components
    .replace(/[<>:"/\\|?*]/g, '_')  // Replace dangerous filesystem characters
    .substring(0, 255);             // Enforce max filename length
};

// ─── 5. Main File Validation Middleware ──────────────────────────────────────

/**
 * Middleware that validates an uploaded file after multer has saved it.
 * Performs:
 *  - Dangerous extension check
 *  - Double extension check
 *  - Magic-byte verification
 *  - Filename sanitization
 *
 * Must be placed AFTER multer middleware in the route chain.
 */
export const validateUploadedFile = async (req, res, next) => {
  if (!req.file) return next(); // No file, nothing to validate

  const originalName = req.file.originalname || '';
  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  // 5a. Sanitize the stored filename
  req.file.originalname = sanitizeFilename(originalName);

  // 5b. Extract ALL extensions (catches double-extension attacks like shell.php.pdf)
  const nameParts = originalName.split('.');
  const extensions = nameParts.slice(1).map((ext) => `.${ext.toLowerCase()}`);

  const hasDangerousExtension = extensions.some((ext) => BLOCKED_EXTENSIONS.has(ext));
  if (hasDangerousExtension) {
    // Clean up temp file
    if (filePath) fs.unlink(filePath, () => {});
    return next(new AppError(
      `File type is not allowed. The following extensions are blocked for security reasons.`,
      400
    ));
  }

  // 5c. Magic-byte verification
  if (filePath) {
    const magicBytesValid = await verifyMagicBytes(filePath, mimeType);
    if (!magicBytesValid) {
      fs.unlink(filePath, () => {}); // Remove the suspicious file
      return next(new AppError(
        `The uploaded file's content does not match its declared type. Upload rejected.`,
        400
      ));
    }
  }

  next();
};

// ─── 6. Path Traversal Guard ─────────────────────────────────────────────────

/**
 * Validates that a resolved file path stays within the allowed base directory.
 * Prevents path traversal attacks like ../../../../etc/passwd.
 *
 * @param {string} requestedPath - Path from user input (e.g. req.params.fileId)
 * @param {string} baseDir       - Absolute path to the allowed base directory
 * @returns {{ safe: boolean, resolvedPath: string }}
 */
export const guardPathTraversal = (requestedPath, baseDir) => {
  const resolved = path.resolve(baseDir, requestedPath);
  const normalizedBase = path.resolve(baseDir);
  const safe = resolved.startsWith(normalizedBase + path.sep) || resolved === normalizedBase;
  return { safe, resolvedPath: resolved };
};

/**
 * Express middleware factory for path traversal protection on download routes.
 * @param {string} baseDir - The allowed base directory (absolute path)
 */
export const pathTraversalGuard = (baseDir) => (req, res, next) => {
  const userPath = req.params[0] || req.params.fileId || req.params.path || '';
  const { safe } = guardPathTraversal(userPath, baseDir);
  if (!safe) {
    return next(new AppError('Invalid file path.', 400));
  }
  next();
};
