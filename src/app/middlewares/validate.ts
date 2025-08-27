import { ValidationResult } from "express-yup-middleware";

const customErrorFormatter = (errors: ValidationResult) => {
  // console.log(errors);
  const flattenedErrors: Array<{ path: string; message: string }> = [];

  if (!errors) {
    return { errors: flattenedErrors };
  }

  // Iterate through validation results for each part of the request
  for (const part of ["body", "params", "query"] as const) {
    if (errors[part]) {
      errors[part].forEach((error: any) => {
        flattenedErrors.push({
          path: `${part}.${error.propertyPath}`,
          message: error.message,
        });
      });
    }
  }

  return { errors: flattenedErrors };
};

export default customErrorFormatter;
