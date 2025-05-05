import {Router} from "express";
import {AuthController} from "./auth.controller";

const authRouter = Router();
const authController = new AuthController();

// Public routes
authRouter.post('/register', authController.register);

export default authRouter;
