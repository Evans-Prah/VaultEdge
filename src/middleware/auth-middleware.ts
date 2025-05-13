import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import {environment} from "../config/environment";
import {TokenPayload} from "../shared/models/token-payload";
import {AppDataSource} from "../database/data-source";
import {User} from "../shared/entities/user.entity";

export type AuthenticatedUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'phoneNumber'>;

declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
            token?: string;
        }
    }
}



export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            environment.auth.jwtSecret,
            {
                issuer:   environment.auth.jwtIssuer,
                audience: environment.auth.jwtAudience,
            }
        ) as TokenPayload;

        const user = await AppDataSource.getRepository(User).findOne({ where: { id: decoded.userId } });
        if (!user) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }

        req.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
        };
        req.token = token;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }

        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: 'Token expired' });
            return;
        }
        next()
    }
}