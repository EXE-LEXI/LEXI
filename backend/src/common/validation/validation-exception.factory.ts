import { BadRequestException } from "@nestjs/common";
import { ValidationError } from "class-validator";

export type ValidationErrorDetail = {
  field: string;
  messages: string[];
};

export function createValidationException(errors: ValidationError[]) {
  return new BadRequestException({
    error: "VALIDATION_ERROR",
    message: "Validation failed",
    details: flattenValidationErrors(errors),
  });
}

export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = ""
): ValidationErrorDetail[] {
  return errors.flatMap((error) => {
    const fieldPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const details: ValidationErrorDetail[] = [];
    const messages = error.constraints ? Object.values(error.constraints) : [];

    if (messages.length > 0) {
      details.push({
        field: fieldPath,
        messages,
      });
    }

    if (error.children?.length) {
      details.push(...flattenValidationErrors(error.children, fieldPath));
    }

    return details;
  });
}
