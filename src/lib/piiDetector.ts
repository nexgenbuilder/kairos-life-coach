// PII Detection patterns
const patterns = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
  phone: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  zipCode: /\b\d{5}(-\d{4})?\b/g,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
};

export interface PIIDetectionResult {
  hasPII: boolean;
  types: string[];
  sanitized: string;
}

export function detectPII(text: string): PIIDetectionResult {
  const detectedTypes: string[] = [];
  let sanitized = text;

  // Check for email
  if (patterns.email.test(text)) {
    detectedTypes.push('email addresses');
    sanitized = sanitized.replace(patterns.email, '[EMAIL_REDACTED]');
  }

  // Check for phone numbers
  if (patterns.phone.test(text)) {
    detectedTypes.push('phone numbers');
    sanitized = sanitized.replace(patterns.phone, '[PHONE_REDACTED]');
  }

  // Check for SSN
  if (patterns.ssn.test(text)) {
    detectedTypes.push('social security numbers');
    sanitized = sanitized.replace(patterns.ssn, '[SSN_REDACTED]');
  }

  // Check for credit cards
  if (patterns.creditCard.test(text)) {
    detectedTypes.push('credit card numbers');
    sanitized = sanitized.replace(patterns.creditCard, '[CARD_REDACTED]');
  }

  // Check for ZIP codes (less sensitive, but can be used for location tracking)
  if (patterns.zipCode.test(text)) {
    detectedTypes.push('ZIP codes');
    sanitized = sanitized.replace(patterns.zipCode, '[ZIP_REDACTED]');
  }

  // Check for IP addresses
  if (patterns.ipAddress.test(text)) {
    detectedTypes.push('IP addresses');
    sanitized = sanitized.replace(patterns.ipAddress, '[IP_REDACTED]');
  }

  return {
    hasPII: detectedTypes.length > 0,
    types: detectedTypes,
    sanitized
  };
}

export function formatPIIWarning(types: string[]): string {
  if (types.length === 0) return '';
  
  const typeList = types.join(', ');
  return `Detected sensitive information (${typeList}). This data will not be sent to external AI services for your privacy protection.`;
}
