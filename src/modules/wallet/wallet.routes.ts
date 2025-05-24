import {Router} from "express";
import {WalletController} from "./wallet.controller";
import {authMiddleware} from "../../middleware/auth-middleware";
import {createRouteHandler} from "../../utils/route-handler";
import userRouter from "../users/user.routes";

const walletRouter = Router();
const walletController = new WalletController();

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateWalletDto:
 *       type: object
 *       required:
 *         - name
 *         - currency
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the wallet
 *         currency:
 *           type: string
 *           description: Currency code for the wallet (e.g., USD, EUR)
 *         description:
 *           type: string
 *           description: Optional description of the wallet
 *     UpdateWalletDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Updated name of the wallet
 *         description:
 *           type: string
 *           description: Updated description of the wallet
 */

/**
 * Wallet routes
 * @swagger
 * tags:
 *   name: Wallets
 *   description: Wallet management
 */

/**
 * @swagger
 * /wallets:
 *   post:
 *     summary: Create a new wallet
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWalletDto'
 *           example:
 *             name: "Main Wallet"
 *             currency: "USD"
 *             description: "My primary USD wallet"
 *     responses:
 *       201:
 *         description: Wallet created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
walletRouter.post(
    '/',
    authMiddleware,
    createRouteHandler(walletController.createWallet)
);

/**
 * @swagger
 * /wallets:
 *   get:
 *     summary: Get all user wallets
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallets retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
walletRouter.get(
    '/',
    authMiddleware,
    createRouteHandler(walletController.getWallets)
);

/**
 * @swagger
 * /wallets/{id}:
 *   get:
 *     summary: Get wallet by ID
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallet ID
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wallet not found
 *       500:
 *         description: Internal server error
 */
walletRouter.get(
    '/:id',
    authMiddleware,
    createRouteHandler(walletController.getWallet)
);

/**
 * @swagger
 * /wallets/{id}:
 *   put:
 *     summary: Update wallet
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallet ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWalletDto'
 *           example:
 *             name: "Updated Wallet Name"
 *             description: "Updated wallet description"
 *     responses:
 *       200:
 *         description: Wallet updated successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wallet not found
 *       500:
 *         description: Internal server error
 */
walletRouter.put(
    '/:id',
    authMiddleware,
    createRouteHandler(walletController.updateWallet)
);

/**
 * @swagger
 * /wallets/{id}:
 *   delete:
 *     summary: Delete wallet
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallet ID
 *     responses:
 *       200:
 *         description: Wallet deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wallet not found
 *       500:
 *         description: Internal server error
 */
walletRouter.delete(
    '/:id',
    authMiddleware,
    createRouteHandler(walletController.deleteWallet)
);

/**
 * @swagger
 * /wallets/{id}/freeze:
 *   patch:
 *     summary: Freeze wallet
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallet ID
 *     responses:
 *       200:
 *         description: Wallet frozen successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wallet not found
 *       500:
 *         description: Internal server error
 */
walletRouter.patch(
    '/:id/freeze',
    authMiddleware,
    createRouteHandler(walletController.freezeWallet)
);

/**
 * @swagger
 * /wallets/{id}/unfreeze:
 *   patch:
 *     summary: Unfreeze wallet
 *     tags: [Wallets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallet ID
 *     responses:
 *       200:
 *         description: Wallet unfrozen successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Wallet not found
 *       500:
 *         description: Internal server error
 */
walletRouter.patch(
    '/:id/unfreeze',
    authMiddleware,
    createRouteHandler(walletController.unfreezeWallet)
);

export default walletRouter;
