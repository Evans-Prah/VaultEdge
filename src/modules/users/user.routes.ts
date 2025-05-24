import {Router} from "express";
import {UserController} from "./user.controller";
import {authMiddleware} from "../../middleware/auth-middleware";
import {createRouteHandler} from "../../utils/route-handler";
import {validateRequest} from "../../middleware/validate-request";
import {updateProfileSchema} from "./schemas/user-schema";

const userRouter = Router();
const userController = new UserController();

// Protected routes
// userRouter.get('/', authMiddleware, userController.getProfile);
// userRouter.put('/', authMiddleware, userController.updateProfile);
// userRouter.patch('/start-kyc-verification', authMiddleware, userController.startKycVerification);
// userRouter.patch('/complete-kyc-verification', authMiddleware, userController.completeKycVerification);


/**
 * User profile routes
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
userRouter.get(
    '/',
    authMiddleware,
    createRouteHandler(userController.getProfile)
);

/**
 * @swagger
 * /users:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDto'
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
userRouter.put(
    '/',
    authMiddleware,
    validateRequest(updateProfileSchema),
    createRouteHandler(userController.updateProfile)
);

/**
 * @swagger
 * /users/kyc/start:
 *   patch:
 *     summary: Start KYC verification process
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC verification started successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       409:
 *         description: User already verified or in KYC process
 *       500:
 *         description: Internal server error
 */
userRouter.patch(
    '/kyc/start',
    authMiddleware,
    createRouteHandler(userController.startKycVerification)
);

/**
 * @swagger
 * /users/kyc/complete:
 *   patch:
 *     summary: Complete KYC verification process
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isApproved
 *         required: true
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Whether the KYC verification is approved or rejected
 *     responses:
 *       200:
 *         description: KYC verification completed successfully
 *       400:
 *         description: Invalid isApproved value
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       409:
 *         description: User already verified or not in KYC process
 *       500:
 *         description: Internal server error
 */
userRouter.patch(
    '/kyc/complete',
    authMiddleware,
    createRouteHandler(userController.completeKycVerification)
);



export default userRouter;
