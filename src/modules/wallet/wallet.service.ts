import {EventPublisher} from "../../utils/event-publisher";
import {ApiResult, StatusCode} from "../../types/api-result";
import {
    CreateWalletDto,
    GetWalletsQueryParams,
    PaginatedWalletsResponse,
    UpdateWalletDto,
    WalletDto
} from "./dto/wallet.dto";
import logger, {formatLogMetadata} from "../../utils/logger";
import {Repository} from "typeorm";
import {Wallet, WalletStatus} from "../../shared/entities/wallet.entity";
import {AppDataSource} from "../../database/data-source";
import {User} from "../../shared/entities/user.entity";

export interface IWalletService {
    createWallet(userId: string, createWalletDto: CreateWalletDto): Promise<ApiResult<WalletDto>>;
    getWallets(userId: string, queryParams: GetWalletsQueryParams): Promise<ApiResult<PaginatedWalletsResponse>>;
    getWalletById(userId: string, walletId: string): Promise<ApiResult<WalletDto>>;
    updateWallet(userId: string, walletId: string, updateWalletDto: UpdateWalletDto): Promise<ApiResult<WalletDto>>;
    deleteWallet(userId: string, walletId: string): Promise<ApiResult<null>>;
    freezeWallet(userId: string, walletId: string): Promise<ApiResult<WalletDto>>;
    unfreezeWallet(userId: string, walletId: string): Promise<ApiResult<WalletDto>>;
}

export class WalletService {
    private readonly eventPublisher: EventPublisher;
    private readonly walletRepository: Repository<Wallet>;
    private readonly userRepository: Repository<User>;

    constructor(
        eventPublisher: EventPublisher = new EventPublisher(),
        walletRepository: Repository<Wallet> = AppDataSource.getRepository(Wallet),
        userRepository: Repository<User> = AppDataSource.getRepository(User)
    ) {
        this.eventPublisher = eventPublisher;
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
    }

    async createWallet(userId: string, createWalletDto: CreateWalletDto): Promise<ApiResult<WalletDto>> {
        try {
            logger.info('Creating wallet with userId: {userId}. Request:{request}', formatLogMetadata({
                userId: userId,
                request: createWalletDto
            }) );

            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                return ApiResult.notFound('User not found');
            }

            const existingWallet = await this.walletRepository.findOne({
                where: {
                    userId: userId,
                    type: createWalletDto.type,
                    currency: createWalletDto.currency
                }
            });

            if (existingWallet) {
                return ApiResult.conflict('Wallet already exists');
            }

            const activeWallets = await this.walletRepository.count({
                where: {
                    userId: userId,
                    status: WalletStatus.ACTIVE
                }
            });

            if (activeWallets >= 5) {
                return ApiResult.forbidden('User has reached the maximum number of active wallets');
            }

            const wallet =  this.walletRepository.create({
                userId: userId,
                type: createWalletDto.type,
                currency: createWalletDto.currency,
                status: WalletStatus.ACTIVE
            });

            const newWallet = await this.walletRepository.save(wallet);

            try {
                await this.eventPublisher.publish("wallet.created", {
                    userId: userId,
                    walletId: newWallet.id,
                    type: newWallet.type,
                    currency: newWallet.currency,
                    status: newWallet.status
                });
            } catch (publishError) {
                logger.warn('Failed to publish wallet.created event, but wallet was created', formatLogMetadata({
                    error: publishError,
                    userId: userId,
                    walletId: newWallet.id
                }));
            }

            const walletDto: WalletDto = {
                id: newWallet.id,
                type: newWallet.type,
                currency: newWallet.currency,
                balance: newWallet.balance,
                status: newWallet.status,
                createdAt: newWallet.createdAt,
                updatedAt: newWallet.updatedAt
            };

            return ApiResult.success(walletDto, 'Wallet created successfully', 201);

        } catch (e){
            logger.error('Error creating wallet', formatLogMetadata({
                error: e,
                userId: userId
            }));
            return ApiResult.serverError('Error creating wallet');
        }
    }


    async getWallets(userId: string, queryParams: GetWalletsQueryParams): Promise<ApiResult<PaginatedWalletsResponse>> {
        try {
            logger.info('Getting wallets for userId: {userId}', formatLogMetadata({
                userId: userId
            }));

            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                return ApiResult.notFound('User not found');
            }

            const page = queryParams.page || 1;
            const limit = queryParams.limit || 10;
            const skip = (page - 1) * limit;

            const whereConditions: any = { userId };
            if (queryParams.status) {
                whereConditions.status = queryParams.status;
            }
            if (queryParams.type) {
                whereConditions.type = queryParams.type;
            }
            if (queryParams.currency) {
                whereConditions.currency = queryParams.currency;
            }

            const total = await this.walletRepository.count({ where: whereConditions });

            const sortBy = queryParams.sortBy || 'createdAt';
            const sortOrder = queryParams.sortOrder || 'DESC';

            const wallets = await this.walletRepository.find({
                where: whereConditions,
                order: {
                    [sortBy]: sortOrder
                },
                skip,
                take: limit
            });

            const walletResponse: PaginatedWalletsResponse = {
                items: wallets.map(wallet => ({
                    id: wallet.id,
                    type: wallet.type,
                    currency: wallet.currency,
                    balance: wallet.balance,
                    status: wallet.status,
                    createdAt: wallet.createdAt,
                    updatedAt: wallet.updatedAt
                })),
                pagination: {
                    page: page,
                    limit: limit,
                    totalItems: total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            return ApiResult.success(walletResponse, 'Wallets retrieved successfully', 200);

        } catch (e) {
            logger.error('Error getting wallets', formatLogMetadata({
                error: e,
                userId: userId
            }));
            return ApiResult.serverError('Error getting wallets for user');
        }
    }

    async getWalletById(userId: string, walletId: string): Promise<ApiResult<WalletDto>> {
        try {
            logger.info('Getting wallet with id: {walletId} for userId: {userId}', formatLogMetadata({
                userId: userId,
                walletId: walletId
            }));

            const wallet = await this.walletRepository.findOne({ where: { id: walletId, userId: userId } });
            if (!wallet) {
                return ApiResult.notFound('Wallet not found');
            }

            const walletResponse: WalletDto = {
                id: wallet.id,
                type: wallet.type,
                currency: wallet.currency,
                balance: wallet.balance,
                status: wallet.status,
                createdAt: wallet.createdAt,
                updatedAt: wallet.updatedAt
            };

            return ApiResult.success(walletResponse, 'Wallet retrieved successfully', 200);

        } catch (e) {
            logger.error('Error getting wallet', formatLogMetadata({
                error: e,
                userId: userId,
                walletId: walletId
            }));
            return ApiResult.serverError('Error getting wallet');
        }
    }

    async updateWallet(userId: string, walletId: string, updateWalletDto: UpdateWalletDto): Promise<ApiResult<WalletDto>> {
        try {
            logger.info('Updating wallet with id: {walletId} for userId: {userId}', formatLogMetadata({
                userId: userId,
                walletId: walletId
            }));

            const wallet = await this.walletRepository.findOne({ where: { id: walletId, userId: userId } });
            if (!wallet) {
                return ApiResult.notFound('Wallet not found');
            }

            const updatedWallet = await this.walletRepository.save({
                ...wallet,
                ...updateWalletDto
            });

            const walletResponse: WalletDto = {
                id: updatedWallet.id,
                type: updatedWallet.type,
                currency: updatedWallet.currency,
                balance: updatedWallet.balance,
                status: updatedWallet.status,
                createdAt: updatedWallet.createdAt,
                updatedAt: updatedWallet.updatedAt
            };

            return ApiResult.success(walletResponse, 'Wallet updated successfully', 200);

        } catch (e) {
            logger.error('Error updating wallet', formatLogMetadata({
                error: e,
                userId: userId,
                walletId: walletId
            }));
            return ApiResult.serverError('Error updating wallet');
        }
    }

    async deleteWallet(userId: string, walletId: string): Promise<ApiResult<null>> {
        try {
            logger.info('Deleting wallet with id: {walletId} for userId: {userId}', formatLogMetadata({
                userId: userId,
                walletId: walletId
            }));

            const wallet = await this.walletRepository.findOne({ where: { id: walletId, userId: userId } });
            if (!wallet) {
                return ApiResult.notFound('Wallet not found');
            }

           if (wallet.balance > 0) {
                return ApiResult.conflict('Wallet has a balance, cannot delete');
            }

            await this.walletRepository.delete(walletId);

            return ApiResult.success(null, 'Wallet deleted successfully', StatusCode.NO_CONTENT);

        } catch (e) {
            logger.error('Error deleting wallet', formatLogMetadata({
                error: e,
                userId: userId,
                walletId: walletId
            }));
            return ApiResult.serverError('Error deleting wallet');
        }
    }

    async freezeWallet(userId: string, walletId: string): Promise<ApiResult<WalletDto>> {
        try {
            logger.info('Freezing wallet with id: {walletId} for userId: {userId}', formatLogMetadata({
                userId: userId,
                walletId: walletId
            }));

            const wallet = await this.walletRepository.findOne({ where: { id: walletId, userId: userId } });
            if (!wallet) {
                return ApiResult.notFound('Wallet not found');
            }

            if (wallet.status === WalletStatus.FROZEN) {
                return ApiResult.conflict('Wallet is already frozen');
            }

            wallet.status = WalletStatus.FROZEN;
            const updatedWallet = await this.walletRepository.save(wallet);

            const walletResponse: WalletDto = {
                id: updatedWallet.id,
                type: updatedWallet.type,
                currency: updatedWallet.currency,
                balance: updatedWallet.balance,
                status: updatedWallet.status,
                createdAt: updatedWallet.createdAt,
                updatedAt: updatedWallet.updatedAt
            };

            return ApiResult.success(walletResponse, 'Wallet frozen successfully', 200);

        } catch (e) {
            logger.error('Error freezing wallet', formatLogMetadata({
                error: e,
                userId: userId,
                walletId: walletId
            }));
            return ApiResult.serverError('Error freezing wallet');
        }
    }

    async unfreezeWallet(userId: string, walletId: string): Promise<ApiResult<WalletDto>> {
        try {
            logger.info('Unfreezing wallet with id: {walletId} for userId: {userId}', formatLogMetadata({
                userId: userId,
                walletId: walletId
            }));

            const wallet = await this.walletRepository.findOne({ where: { id: walletId, userId: userId } });
            if (!wallet) {
                return ApiResult.notFound('Wallet not found');
            }

            if (wallet.status !== WalletStatus.FROZEN) {
                return ApiResult.conflict('Wallet is not frozen');
            }

            wallet.status = WalletStatus.ACTIVE;
            const updatedWallet = await this.walletRepository.save(wallet);

            const walletResponse: WalletDto = {
                id: updatedWallet.id,
                type: updatedWallet.type,
                currency: updatedWallet.currency,
                balance: updatedWallet.balance,
                status: updatedWallet.status,
                createdAt: updatedWallet.createdAt,
                updatedAt: updatedWallet.updatedAt
            };

            return ApiResult.success(walletResponse, 'Wallet unfrozen successfully', 200);

        } catch (e) {
            logger.error('Error unfreezing wallet', formatLogMetadata({
                error: e,
                userId: userId,
                walletId: walletId
            }));
            return ApiResult.serverError('Error unfreezing wallet');
        }
    }
}