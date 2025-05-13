import { Request, Response, NextFunction } from 'express';
import {AuthService, IAuthService} from "./auth.service";
import {RegisterDto} from "./dto/register.dto";
import {registerSchema} from "./schemas/register.schema";
import {loginSchema} from "./schemas/login.schema";
import {LoginDto} from "./dto/login.dto";


export class AuthController {
    private authService: IAuthService;

    constructor(authService: IAuthService = new AuthService()) {
        this.authService = authService;
    }

    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *                 minLength: 8
     *                 maxLength: 128
     *               firstName:
     *                 type: string
     *                 maxLength: 255
     *               otherNames:
     *                 type: string
     *                 maxLength: 255
     *               lastName:
     *                 type: string
     *                 maxLength: 255
     *               phoneNumber:
     *                 type: string
     *                 maxLength: 20
     *               dateOfBirth:
     *                 type: string
     *                 format: date-time
     *
     */
    register = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const validatedData = registerSchema.parse(req.body) as RegisterDto;
            const result = await this.authService.register(validatedData);
            res.status(result.status_code).json(result);
        } catch (err) {
            next(err);
        }
    };

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Login a user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *
     */
    login = async (
        req: Request,
        res: Response,
        next: NextFunction): Promise<void> => {
        try {
            const payload = loginSchema.parse(req.body) as LoginDto;
            const result = await this.authService.login(payload);
            res.status(result.status_code).json(result);
        } catch (err) {
            next(err);
        }
    }
}