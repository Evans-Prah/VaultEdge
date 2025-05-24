import {NextFunction, Request, Response} from "express";
import {TypedRequest} from "../types/express-extension";
import {ParsedQs} from "qs";

type ControllerFunction = (
    req: TypedRequest<any, any>,
    res: Response,
    next: NextFunction
) => Promise<void> | void;

/**
 * Wraps a controller function to handle errors and pass them to the next middleware.
 * @param handler - The controller function to wrap.
 * @returns A new function that wraps the original handler and catches errors.
 */
export const createRouteHandler = <
    TBody = any,
    TQuery extends ParsedQs = ParsedQs,
    TParams extends Record<string, string> = Record<string, string>
>(
    handler: (
        req: TypedRequest<TBody, TQuery, TParams>,
        res: Response,
        next: NextFunction
    ) => Promise<void>
): ControllerFunction => {
    return handler as ControllerFunction;
};