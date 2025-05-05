import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const { method, url, headers } = req;

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            message: 'Request completed',
            method,
            url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            headers: {
                'user-agent': headers['user-agent'],
                'accept-language': headers['accept-language'],
            },
        });
    });

    next();
}