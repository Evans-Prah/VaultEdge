import {IUserService, UserService} from "./user.service";
import {NextFunction, Request, Response} from "express";
import {UpdateUserDto} from "./dto/user-profile.dto";
import {TypedRequest} from "../../types/express-extension";

type KycCompletionQuery = {
    isApproved: string;
};

export class UserController {
    private userService: IUserService;

    constructor(userService: IUserService = new UserService()) {
        this.userService = userService;
    }

    /**
     * Retrieves the profile of a user
     * @returns A promise that resolves to an ApiResult containing the user's profile data
     */
    /**
     * @swagger
     * /users/profile:
     *   get:
     *     summary: Get user profile
     *     tags: [Users]
     *     responses:
     *       200:
     *         description: User profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                 email:
     *                   type: string
     *                 firstName:
     *                   type: string
     *                 otherNames:
     *                   type: string
     *                 lastName:
     *                   type: string
     *                 phoneNumber:
     *                   type: string
     */
    getProfile = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {

        if (!req.user?.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const result = await this.userService.profile(req.user.id);
        res.status(result.status_code).json(result);
    };

    /**
     * @swagger
     * /users/{id}:
     *   put:
     *     summary: Update user profile
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: User ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               firstName:
     *                 type: string
     *               otherNames:
     *                 type: string
     *               lastName:
     *                 type: string
     *               phoneNumber:
     *                 type: string
     *               dateOfBirth:
     *                 type: string
     *                 format: date
     *               address:
     *                 type: string
     *     responses:
     *       200:
     *         description: User profile updated successfully
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     *       500:
     *         description: Internal server error
     */
    updateProfile = async (
        req: TypedRequest<UpdateUserDto>,
        res: Response,
        next: NextFunction) : Promise<void> => {

        // if (!req.user) {
        //     res.status(401).json({ message: 'Unauthorized' });
        //     return;
        // }
        //
        // const payload = req.body as UpdateUserDto;
        // const result = await this.userService.updateProfile(req.user.id, payload);
        // res.status(result.status_code).json(result);

        if (!req.user?.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const result = await this.userService.updateProfile(req.user.id, req.body);
        res.status(result.status_code).json(result);
    }


    /**
     * @swagger
     * /users/{id}/start-kyc-verification:
     *   patch:
     *     summary: Start KYC verification process for a user
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: User ID
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
    startKycVerification = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {

        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const result = await this.userService.startKycVerification(req.user.id);
        res.status(result.status_code).json(result);
    }

    /**
     * @swagger
     * /users/{id}/complete-kyc-verification:
     *   patch:
     *     summary: Complete KYC verification process for a user
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: User ID
     *       - in: query
     *         name: isApproved
     *         required: true
     *         schema:
     *           type: boolean
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
    completeKycVerification = async (
        req: TypedRequest<{}, KycCompletionQuery>,
        res: Response,
        next: NextFunction
    ) : Promise<void> => {

        if (!req.user?.id) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { isApproved } = req.query;

        if (isApproved !== 'true' && isApproved !== 'false') {
            res.status(400).json({ message: 'Invalid isApproved value' });
            return;
        }

        const isApprovedBoolean = isApproved === 'true';
        const result = await this.userService.completeKycVerification(req.user.id, isApprovedBoolean);
        res.status(result.status_code).json(result);
    }
}