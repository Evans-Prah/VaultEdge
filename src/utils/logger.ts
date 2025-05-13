import winston from 'winston';
import { environment } from '../config/environment';

interface LogMetadata {
    headers?: {
        authorization?: string;
        [key: string]: any;
    };
    req?: {
        method?: string;
        url?: string;
        query?: any;
        params?: any;
    };
    res?: any;
    [key: string]: any;
}

const logger = winston.createLogger({
    level: environment.logging.level,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        environment.isProduction
            ? winston.format.json()
            : winston.format.printf(({ timestamp, level, message, ...rest }) => {
                const meta = { ...rest } as LogMetadata;

                // Clean metadata before logging
                const cleanMeta: Record<string, unknown> = {};
                Object.keys(meta).forEach(key => {
                    if (key !== 'req' && key !== 'res') {
                        cleanMeta[key] = meta[key];
                    }
                });

                try {
                    return `${timestamp} [${level.toUpperCase()}]: ${message} ${
                        Object.keys(cleanMeta).length ? JSON.stringify(cleanMeta) : ''
                    }`;
                } catch (error) {
                    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
                }
            })
    ),
    transports: [
        new winston.transports.Console({
            stderrLevels: ['error'],
        }),
    ],
});

export const formatLogMetadata = (meta: LogMetadata): Record<string, any> => {
    const formatted: Record<string, any> = {};

    // Only include safe properties
    if (meta.userId) formatted.userId = meta.userId;
    if (meta.error) formatted.error = meta.error instanceof Error ? meta.error.message : meta.error;
    if (meta.path) formatted.path = meta.path;

    return formatted;
};

export default logger;