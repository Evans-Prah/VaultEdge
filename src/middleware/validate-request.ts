import { Request, Response, NextFunction } from 'express';
import {Schema} from "zod";
import {ApiResult, StatusCode} from "../types/api-result";


export const validateRequest = (
    bodySchema?: Schema,
    querySchema?: Schema,
    paramsSchema?: Schema,
)=> {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (bodySchema) {
                req.body = bodySchema.parse(req.body);
            }
            if (querySchema) {
                req.query = querySchema.parse(req.query);
            }
            if (paramsSchema) {
                req.params = paramsSchema.parse(req.params);
            }
            next();
        } catch (error) {
            const result = ApiResult.fail(
                'Validation failed',
                StatusCode.BAD_REQUEST,
                error instanceof Error ? [error.message] : ['Invalid request data']
            );
            res.status(StatusCode.BAD_REQUEST).json(result);
        }
    };
}