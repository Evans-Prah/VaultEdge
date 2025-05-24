import {WalletStatus, WalletType} from "../../../shared/entities/wallet.entity";

export interface WalletDto {
    id: string;
    currency: string;
    balance: number;
    status: WalletStatus;
    type: WalletType;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateWalletDto {
    type: WalletType;
    currency: string;
}

export interface UpdateWalletDto {
    type: WalletType;
    status: WalletStatus;
}

export interface PaginatedWalletsResponse {
    items: WalletDto[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

export interface GetWalletsQueryParams {
    page?: number;
    limit?: number;
    status?: WalletStatus;
    type?: WalletType;
    currency?: string;
    sortBy?: 'createdAt' | 'balance';
    sortOrder?: 'ASC' | 'DESC';
}