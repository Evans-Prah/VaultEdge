import { ErrorRequestHandler } from "express";
import logger from "../utils/logger";

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next): void => {
    const appError = err as AppError;

    if (appError.isOperational) {
        res.status(appError.statusCode).json({
            status: "error",
            message: appError.message,
        });
        return;
    }

    logger.error("Unexpected error:", { error: err.message, stack: err.stack });

    res.status(500).json({
        status: "error",
        message:
            process.env.NODE_ENV === "production"
                ? "Something went wrong"
                : err.message || "Internal server error",
    });
};