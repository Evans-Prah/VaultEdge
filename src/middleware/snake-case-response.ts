import { Request, Response, NextFunction } from 'express';
import { snakeCase } from 'lodash';

/**
 * Recursively transforms object keys to snake_case
 */
function keysToSnake(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(v => keysToSnake(v));
    } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        return Object.keys(obj).reduce((acc: any, key: string) => {
            const snakeKey = snakeCase(key);
            acc[snakeKey] = keysToSnake(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}

/**
 * Middleware to override res.json and convert response keys to snake_case
 */
export function snakeCaseResponseMiddleware(req: Request, res: Response, next: NextFunction) {
    const oldJson = res.json.bind(res);
    res.json = (data: any) => {
        const transformed = keysToSnake(data);
        return oldJson(transformed);
    };
    next();
}
