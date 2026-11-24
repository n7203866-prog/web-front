// lib/fileValidation.ts - Frontend file validation utilities

/**
 * ✅ FIX #6: Frontend file validation before upload
 * Prevents invalid files from being sent to backend
 */

// Magic bytes for file type detection
const MAGIC_BYTES: Record<string, { magic: Uint8Array; mimes: string[] }> = {
  pdf: {
    magic: new Uint8Array([0x25, 0x50, 0x44, 0x46]), // %PDF
    mimes: ['application/pdf'],
  },
  jpeg: {
    magic: new Uint8Array([0xff, 0xd8, 0xff]),
    mimes: ['image/jpeg', 'image/jpg'],
  },
  png: {
    magic: new Uint8Array([0x89, 0x50, 0x4e, 0x47]), // \x89PNG
    mimes: ['image/png'],
  },
  webp: {
    magic: new Uint8Array([0x52, 0x49, 0x46, 0x46]), // RIFF
    mimes: ['image/webp'],
  },
  gif: {
    magic: new Uint8Array([0x47, 0x49, 0x46]),
    mimes: ['image/gif'],
  },
};

const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_FILE_SIZE = 1; // 1 byte

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  extension?: string;
  mimeType?: string;
  size?: number;
}

/**
 * Validate file on frontend before upload
 */
export async function validateFileForUpload(file: File): Promise<FileValidationResult> {
  // 1. Check file exists
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'Invalid file object' };
  }

  // 2. Check file size
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (file.size < MIN_FILE_SIZE) {
    return { valid: false, error: `File is too small (minimum ${MIN_FILE_SIZE} byte)` };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  // 3. Check extension
  const filename = file.name || 'unknown';
  const extension = filename.includes('.') ? filename.split('.').pop()?.toLowerCase() : '';

  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `File type ".${extension}" is not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // 4. Validate MIME type
  const expectedMimes = MAGIC_BYTES[extension]?.mimes || [];
  if (file.type && !expectedMimes.includes(file.type)) {
    console.warn(
      `⚠️ MIME type mismatch: file claims "${file.type}" but extension suggests "${extension}". ` +
      `This may be a spoofed file. Proceeding with caution.`
    );
  }

  // 5. Validate magic bytes (file signature)
  try {
    const buffer = await file.slice(0, 16).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const magicInfo = MAGIC_BYTES[extension];

    if (magicInfo) {
      const expectedMagic = magicInfo.magic;
      let magicMatches = true;

      // Check if file starts with expected magic bytes
      for (let i = 0; i < Math.min(expectedMagic.length, bytes.length); i++) {
        if (bytes[i] !== expectedMagic[i]) {
          magicMatches = false;
          break;
        }
      }

      if (!magicMatches) {
        return {
          valid: false,
          error: `File signature does not match ".${extension}" format. This may be a malicious file.`,
        };
      }
    }
  } catch (error) {
    console.error('Error validating file magic bytes:', error);
    // Don't fail validation, just warn
    console.warn('⚠️ Could not validate file signature, proceeding anyway');
  }

  return {
    valid: true,
    extension,
    mimeType: file.type || MAGIC_BYTES[extension]?.mimes[0],
    size: file.size,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Create user-friendly error message for file validation
 */
export function getFileValidationErrorMessage(error: string): string {
  if (error.includes('empty')) {
    return '📄 Please select a file';
  }
  if (error.includes('too large')) {
    return '📦 File is too large (max 5MB)';
  }
  if (error.includes('not allowed')) {
    return '❌ File type not allowed';
  }
  if (error.includes('signature')) {
    return '🚨 File appears to be malicious or corrupted';
  }
  return `❌ ${error}`;
}
