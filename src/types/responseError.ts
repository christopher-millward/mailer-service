import { ValidationError } from "express-validator";

/**
 * @interface ResponseError
 * @description Extends the native Error object to include additional attributes for enhanced
 *              error handling in middleware, specifically tailored for API response management.
 * 
 * **Attributes:**
 * - `name` (string) - Name of the error (default in Error).
 * - `message` (string) - Message describing the error (default in Error).
 * - `stack` (string | undefined) - Stack trace, if available (default in Error).
 * - `status` (number | undefined) - HTTP status code associated with the error (e.g., 400 for validation errors).
 * - `errors` (Result<ValidationError> | undefined) - Validation errors, if any, from express-validator. This property
 *     holds an array of validation error objects containing details about each validation failure.
 * 
 * The `ResponseError` interface provides a structure for handling errors more effectively in the 
 * application, allowing middleware to include both standard error properties and custom properties
 * like `status` and `errors` for API-specific error reporting.
 */
export interface ResponseError extends Error {
    status?: number;
    errors?: ValidationError[];
}
