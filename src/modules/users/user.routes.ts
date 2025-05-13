import {Router} from "express";
import {UserController} from "./user.controller";
import {authMiddleware} from "../../middleware/auth-middleware";

const userRouter = Router();
const userController = new UserController();

// Protected routes
userRouter.get('/', authMiddleware, userController.getProfile);
userRouter.put('/', authMiddleware, userController.updateProfile);
userRouter.patch('/start-kyc-verification', authMiddleware, userController.startKycVerification);
userRouter.patch('/complete-kyc-verification', authMiddleware, userController.completeKycVerification);

export default userRouter;
