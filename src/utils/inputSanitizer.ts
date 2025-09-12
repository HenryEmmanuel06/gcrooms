/**
 * Input sanitization utilities for form data
 */

export interface SanitizedFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
}

/**
 * Sanitizes a string by removing potentially harmful characters
 * and trimming whitespace
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove potentially dangerous characters
    .replace(/[<>'"&]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitizes a name field - allows letters, spaces, hyphens, and apostrophes
 */
export function sanitizeName(name: string): string {
  const sanitized = sanitizeString(name);
  // Only allow letters, spaces, hyphens, apostrophes, and dots
  return sanitized.replace(/[^a-zA-Z\s\-'.]/g, '').trim();
}

/**
 * Sanitizes a phone number - removes all non-numeric characters except + and -
 */
export function sanitizePhoneNumber(phone: string): string {
  const sanitized = sanitizeString(phone);
  // Only allow numbers, +, -, (, ), and spaces
  return sanitized.replace(/[^0-9+\-() ]/g, '').trim();
}

/**
 * Sanitizes an email address - basic cleanup while preserving email format
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeString(email);
  // Convert to lowercase and remove any characters that shouldn't be in an email
  return sanitized.toLowerCase().replace(/[^a-z0-9@._-]/g, '');
}

/**
 * Validates basic input requirements
 */
export function validateInput(field: string, value: string): { isValid: boolean; error?: string } {
  const sanitizedValue = sanitizeString(value);

  if (!sanitizedValue) {
    return { isValid: false, error: `${field} is required` };
  }

  switch (field) {
    case 'fullName':
      if (sanitizedValue.length < 2) {
        return { isValid: false, error: 'Name must be at least 2 characters long' };
      }
      if (sanitizedValue.length > 50) {
        return { isValid: false, error: 'Name must be less than 50 characters' };
      }
      break;

    case 'phoneNumber':
      const phoneRegex = /^[\+]?[0-9\-\(\)\s]{10,15}$/;
      if (!phoneRegex.test(sanitizedValue)) {
        return { isValid: false, error: 'Please enter a valid phone number' };
      }
      break;

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedValue)) {
        return { isValid: false, error: 'Please enter a valid email address' };
      }
      break;

    default:
      break;
  }

  return { isValid: true };
}

/**
 * Sanitizes all form data at once
 */
export function sanitizeFormData(formData: {
  fullName: string;
  phoneNumber: string;
  email: string;
}): SanitizedFormData {
  return {
    fullName: sanitizeName(formData.fullName),
    phoneNumber: sanitizePhoneNumber(formData.phoneNumber),
    email: sanitizeEmail(formData.email),
  };
}

/**
 * Validates all form fields
 */
export function validateFormData(formData: SanitizedFormData): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  const nameValidation = validateInput('fullName', formData.fullName);
  if (!nameValidation.isValid) {
    errors.fullName = nameValidation.error!;
  }

  const phoneValidation = validateInput('phoneNumber', formData.phoneNumber);
  if (!phoneValidation.isValid) {
    errors.phoneNumber = phoneValidation.error!;
  }

  const emailValidation = validateInput('email', formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error!;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
