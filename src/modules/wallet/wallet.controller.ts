import { Request, Response } from "express";
import {IWalletService, WalletService} from "./wallet.service";
import {StatusCode} from "../../types/api-result";
import {createWalletSchema, updateWalletSchema} from "./schemas/wallet-schema";
import {CreateWalletDto, GetWalletsQueryParams, UpdateWalletDto} from "./dto/wallet.dto";

export class WalletController {
    private  walletService: IWalletService;

    constructor(walletService: IWalletService = new WalletService()) {
        this.walletService = walletService;
    }

    createWallet = async (req: Request, res: Response): Promise<void> =>{
        const userId = req.user?.id;
        if (!userId) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: 'Unauthorized' });
            return;
        }

        const payload = createWalletSchema.parse(req.body) as CreateWalletDto;
        const result = await this.walletService.createWallet(userId, payload);
        res.status(result.status_code).json(result);
    }

    getWallets = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: 'Unauthorized' });
            return;
        }

        const queryParams: GetWalletsQueryParams = {
            page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
            status: req.query.status as any,
            type: req.query.type as any,
            currency: req.query.currency as any,
            sortBy: req.query.sortBy as any,
            sortOrder: req.query.sortOrder as any
        };

        const result = await this.walletService.getWallets(userId, queryParams);
        res.status(result.status_code).json(result);
    }

    getWallet = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: 'Unauthorized' });
            return;
        }

        const walletId = req.params.id;
        const result = await this.walletService.getWalletById(userId, walletId);
        res.status(result.status_code).json(result);
    }

    updateWallet = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: 'Unauthorized' });
            return;
        }

        const walletId = req.params.id;
        const payload = updateWalletSchema.parse(req.body) as UpdateWalletDto;
        const result = await this.walletService.updateWallet(userId, walletId, payload);
        res.status(result.status_code).json(result);
    }

    deleteWallet = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: 'Unauthorized' });
            return;
        }

        const walletId = req.params.id;
        const result = await this.walletService.deleteWallet(userId, walletId);
        res.status(result.status_code).json(result);
    }

    freezeWallet = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: 'Unauthorized' });
            return;
        }

        const walletId = req.params.id;
        const result = await this.walletService.freezeWallet(userId, walletId);
        res.status(result.status_code).json(result);
    }

    unfreezeWallet = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: 'Unauthorized' });
            return;
        }

        const walletId = req.params.id;
        const result = await this.walletService.unfreezeWallet(userId, walletId);
        res.status(result.status_code).json(result);
    }
}