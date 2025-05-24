import { Request } from 'express';
import { ParsedQs } from 'qs';

/**
 * This interface extends the Express Request object to include typed body, query, and params.
 */
export interface TypedRequest<
    TBody = any,
    TQuery extends ParsedQs = ParsedQs,
    TParams extends Record<string, string> = Record<string, string>,
> extends Request {
    body: TBody;
    query: TQuery;
    params: TParams;
}