export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const MAX_INPUT_LENGTH = 50000;
const MIN_INPUT_LENGTH = 50;

export function validateResumeInput(text: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  if (!text || typeof text !== 'string') {
    errors.push({ field: 'resumeText', message: 'Resume text is required and must be a string.', code: 'INVALID_INPUT' });
    return { valid: false, errors };
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) errors.push({ field: 'resumeText', message: 'Resume text cannot be empty.', code: 'EMPTY_INPUT' });
  if (trimmed.length < MIN_INPUT_LENGTH) errors.push({ field: 'resumeText', message: 'Resume must be at least ' + MIN_INPUT_LENGTH + ' characters (currently ' + trimmed.length + ').', code: 'TOO_SHORT' });
  if (trimmed.length > MAX_INPUT_LENGTH) errors.push({ field: 'resumeText', message: 'Resume exceeds max ' + MAX_INPUT_LENGTH.toLocaleString() + ' characters (currently ' + trimmed.length + ').', code: 'TOO_LONG' });
  return { valid: errors.length === 0, errors };
}

export function validateJDInput(text: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  if (!text || typeof text !== 'string') {
    errors.push({ field: 'jdText', message: 'Job description text is required and must be a string.', code: 'INVALID_INPUT' });
    return { valid: false, errors };
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) errors.push({ field: 'jdText', message: 'Job description text cannot be empty.', code: 'EMPTY_INPUT' });
  if (trimmed.length < MIN_INPUT_LENGTH) errors.push({ field: 'jdText', message: 'Job description must be at least ' + MIN_INPUT_LENGTH + ' characters (currently ' + trimmed.length + ').', code: 'TOO_SHORT' });
  if (trimmed.length > MAX_INPUT_LENGTH) errors.push({ field: 'jdText', message: 'Job description exceeds max ' + MAX_INPUT_LENGTH.toLocaleString() + ' characters (currently ' + trimmed.length + ').', code: 'TOO_LONG' });
  return { valid: errors.length === 0, errors };
}

export function validateBothInputs(resumeText: unknown, jdText: unknown): ValidationResult {
  const errors = [...validateResumeInput(resumeText).errors, ...validateJDInput(jdText).errors];
  return { valid: errors.length === 0, errors };
}

export function validationErrorResponse(errors: ValidationError[]): object {
  return { error: errors.map((e) => e.message).join(' '), code: 'VALIDATION_ERROR', details: errors };
}

export function validateExportInput(body: Record<string, unknown>): ValidationResult {
  const errors: ValidationError[] = [];
  if (!body.type || !['tailored', 'comparison'].includes(body.type as string)) {
    errors.push({ field: 'type', message: "PDF type must be 'tailored' or 'comparison'.", code: 'INVALID_TYPE' });
  }
  for (const field of ['resume', 'jd', 'originalScore', 'tailoredScore', 'tailoredResume', 'gaps']) {
    if (!body[field]) errors.push({ field, message: 'Missing required field: ' + field + '.', code: 'MISSING_FIELD' });
  }
  return { valid: errors.length === 0, errors };
}
