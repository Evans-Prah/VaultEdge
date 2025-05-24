import { ErrorRequestHandler } from "express";
import logger from "../utils/logger";
import { ApiResult, StatusCode } from "../types/api-result";

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    errors?: string[];

    constructor(message: string, statusCode: number, errors?: string[]) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next): void => {
    // Handle validation errors (library-agnostic)
    if (err.name === 'ZodError' || err.name === 'ValidationError') {
        // Extract error messages in a library-agnostic way
        const errorMessages: string[] = [];

        // Handle ZodError format
        if (err.errors && Array.isArray(err.errors)) {
            err.errors.forEach((error: any) => {
                const path = Array.isArray(error.path) ? error.path.join('.') : error.path;
                errorMessages.push(`${path}: ${error.message}`);
            });
        }

        if (errorMessages.length === 0 && err.message) {
            try {
                const parsedErrors = JSON.parse(err.message);
                if (Array.isArray(parsedErrors)) {
                    parsedErrors.forEach((error: any) => {
                        const path = Array.isArray(error.path) ? error.path.join('.') : error.path;
                        errorMessages.push(`${path}: ${error.message}`);
                    });
                }
            } catch {
                errorMessages.push(err.message);
            }
        }

        const result = ApiResult.fail(
            'Validation failed',
            StatusCode.BAD_REQUEST,
            errorMessages.length ? errorMessages : ['Invalid input data']
        );

        res.status(StatusCode.BAD_REQUEST).json(result);
        return;
    }

    const appError = err as AppError;
    if (appError.isOperational) {
        const result = ApiResult.fail(
            appError.message,
            appError.statusCode,
            appError.errors
        );

        res.status(appError.statusCode).json(result);
        return;
    }

    logger.error("Unexpected error:", { error: err.message, stack: err.stack });

    const errorMessage = process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message || "Internal server error";

    const result = ApiResult.serverError(errorMessage);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json(result);
};