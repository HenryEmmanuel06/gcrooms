// Security utilities for input validation and sanitization

// Basic HTML sanitization (removes script tags and dangerous attributes)
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous attributes
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, ''); // onclick, onload, etc.
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  
  // Remove dangerous tags
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta', 'style'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  return sanitized; // Don't trim here to preserve spaces
};

// Text sanitization for database storage (preserves internal spaces)
export const sanitizeText = (input: string, maxLength: number = 1000): string => {
  if (!input) return '';
  
  // Basic HTML sanitization
  let sanitized = sanitizeHtml(input);
  
  // Limit length first to avoid processing very long strings
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Remove null bytes and control characters (except spaces, newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Only trim leading/trailing whitespace, preserve internal spaces
  return sanitized;
};

// Validate and sanitize numeric input
export const sanitizeNumber = (input: string, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number | null => {
  if (!input || input.trim() === '') return null;
  
  const num = parseFloat(input.trim());
  
  if (isNaN(num) || !isFinite(num)) return null;
  if (num < min || num > max) return null;
  
  return num;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate price format
export const isValidPrice = (price: string): boolean => {
  const priceRegex = /^\d+(\.\d{1,2})?$/;
  return priceRegex.test(price) && parseFloat(price) > 0;
};

// Validate coordinates
export const isValidCoordinate = (lat: string, lng: string): boolean => {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  
  return !isNaN(latNum) && !isNaN(lngNum) && 
         latNum >= -90 && latNum <= 90 && 
         lngNum >= -180 && lngNum <= 180;
};

// File validation utilities
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Check file magic numbers (file signatures)
export const validateFileSignature = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer);
      const header = Array.from(arr.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Common image file signatures
      const signatures = {
        'ffd8ff': 'image/jpeg', // JPEG
        '89504e47': 'image/png', // PNG
        '52494646': 'image/webp', // WEBP (RIFF header)
      };
      
      const isValid = Object.keys(signatures).some(sig => header.startsWith(sig));
      resolve(isValid);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
};

// Validate file upload
export const validateImageFile = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size exceeds 5MB limit' };
  }
  
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' };
  }
  
  // Check file signature
  const hasValidSignature = await validateFileSignature(file);
  if (!hasValidSignature) {
    return { isValid: false, error: 'Invalid file format or corrupted file' };
  }
  
  return { isValid: true };
};

// Rate limiting utility
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(private maxRequests: number = 10, private windowMs: number = 60000) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
  
  reset(identifier: string): void {
    this.requests.delete(identifier);
  }
}

// Generate secure filename
export const generateSecureFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  
  // Sanitize extension
  const safeExtension = ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? extension : 'jpg';
  
  return `room_${timestamp}_${randomString}.${safeExtension}`;
};

// Sanitize street address input
export const sanitizeStreet = (input: string): string => {
  if (!input) return '';
  
  // Basic HTML sanitization
  let sanitized = sanitizeHtml(input);
  
  // Limit length to reasonable street address length
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100);
  }
  
  // Remove null bytes and control characters (except spaces)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Allow only letters, numbers, spaces, hyphens, apostrophes, commas, and periods
  sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-',.]/g, '');
  
  // Normalize whitespace (replace multiple spaces with single space)
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Trim leading/trailing whitespace
  return sanitized.trim();
};

// Validate street address
export const isValidStreet = (street: string): boolean => {
  if (!street || street.trim().length === 0) return false;
  if (street.trim().length < 2) return false;
  if (street.trim().length > 100) return false;
  
  // Check for valid street characters
  const streetRegex = /^[a-zA-Z0-9\s\-',.]+$/;
  return streetRegex.test(street.trim());
};
