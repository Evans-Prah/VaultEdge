import { Request, Response, NextFunction } from 'express';
import { camelCase } from 'lodash';

/**
 * Recursively transforms object keys to camelCase
 */
function keysToCamel(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(v => keysToCamel(v));
    } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        return Object.keys(obj).reduce((acc: any, key: string) => {
            const camelKey = camelCase(key);
            acc[camelKey] = keysToCamel(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}

/**
 * Middleware to convert incoming request body keys from snake_case to camelCase
 */
export function snakeCaseRequestMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.body && typeof req.body === 'object') {
        req.body = keysToCamel(req.body);
    }
    next();
}
