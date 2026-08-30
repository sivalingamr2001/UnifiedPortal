export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
  custom?: (val: any) => string | undefined;
}

export type Schema<T> = {
  [K in keyof T]?: ValidationRule;
};

export type FieldErrors = Record<string, string>;

export function validate<T>(schema: Schema<T>, data: any): { data: T; fieldErrors?: FieldErrors } {
  const fieldErrors: FieldErrors = {};
  const validatedData: any = { ...data };

  for (const key in schema) {
    const rules = schema[key];
    if (!rules) continue;

    const value = data[key];

    // Required check
    if (rules.required) {
      if (value === undefined || value === null || value === "" || (typeof value === "string" && value.trim() === "")) {
        fieldErrors[key] = rules.message || `${String(key)} is required`;
        continue;
      }
    }

    if (value !== undefined && value !== null && value !== "") {
      // MinLength check
      if (rules.minLength && String(value).length < rules.minLength) {
        fieldErrors[key] = rules.message || `${String(key)} must be at least ${rules.minLength} characters`;
      }
      // MaxLength check
      if (rules.maxLength && String(value).length > rules.maxLength) {
        fieldErrors[key] = rules.message || `${String(key)} must be at most ${rules.maxLength} characters`;
      }
      // Pattern check
      if (rules.pattern && !rules.pattern.test(String(value))) {
        fieldErrors[key] = rules.message || `${String(key)} format is invalid`;
      }
      // Custom check
      if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) {
          fieldErrors[key] = customError;
        }
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { data: data as T, fieldErrors };
  }

  return { data: validatedData as T };
}
