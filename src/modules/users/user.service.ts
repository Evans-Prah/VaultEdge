import {ApiResult, StatusCode} from "../../types/api-result";
import {UpdateUserDto, UserProfileDto} from "./dto/user-profile.dto";
import logger, {formatLogMetadata} from "../../utils/logger";
import {AppDataSource} from "../../database/data-source";
import {KYCStatus, User} from "../../shared/entities/user.entity";
import {Repository} from "typeorm";
import {EventPublisher} from "../../utils/event-publisher";

export interface IUserService {
    profile(userId: string): Promise<ApiResult<UserProfileDto>>;
    updateProfile(userId: string, dto: UpdateUserDto): Promise<ApiResult<UserProfileDto>>;
    startKycVerification(userId: string): Promise<ApiResult<UserProfileDto>>;
    completeKycVerification(userId: string, isApproved: boolean): Promise<ApiResult<UserProfileDto>>;
}

export class UserService implements IUserService {
    private userRepository: Repository<User>;
    constructor(
        userRepository: Repository<User> = AppDataSource.getRepository(User)
    ) {
        this.userRepository = userRepository;
    }

    /**
     * Retrieves the profile of a user
     * @param userId - The ID of the user
     * @returns A promise that resolves to an ApiResult containing the user's profile data
     */
    async profile(userId: string): Promise<ApiResult<UserProfileDto>> {
        try {

            logger.info('Getting user profile', formatLogMetadata({
                userId: userId
            }));

            const user = await this.userRepository.findOne({ where: { id: userId } });

            if (!user) {
                return ApiResult.notFound('User not found');
            }

            const userProfile = UserProfileDto.fromEntity(user);

            return ApiResult.success(userProfile, 'User profile retrieved successfully', StatusCode.OK);
        } catch (e) {
            logger.error('Error retrieving user profile', formatLogMetadata({
                error: e,
                userId: userId
            }));
            return ApiResult.serverError('Error retrieving user profile');
        }
    }

    /**
     * Updates the profile of a user
     * @param userId - The ID of the user
     * @param dto - The data transfer object containing the updated profile data
     * @returns A promise that resolves to an ApiResult containing the updated user's profile data
     */
    async updateProfile(userId: string, dto: UpdateUserDto): Promise<ApiResult<UserProfileDto>> {
        try {
            logger.info('Updating user profile', formatLogMetadata({
                userId: userId
            }));

            const user = await this.userRepository.findOne({ where: { id: userId } });

            if (!user) {
                return ApiResult.notFound('User not found');
            }

            const userData = {
                firstName: dto.firstName || user.firstName,
                otherNames: dto.otherNames || user.otherNames,
                lastName: dto.lastName || user.lastName,
                phoneNumber: dto.phoneNumber || user.phoneNumber,
                dateOfBirth: dto.dateOfBirth || user.dateOfBirth,
                address: dto.address || user.address,
            }

            const updatedUser = await this.userRepository.update(userId, userData);
            if (!updatedUser) {
                return ApiResult.notFound('User not found');
            }

            const updatedUserData = await this.userRepository.findOne({ where: { id: userId } });
            if (!updatedUserData) {
                return ApiResult.notFound('User not found');
            }

            const userProfile = UserProfileDto.fromEntity(updatedUserData);

            return ApiResult.success(userProfile, 'User profile updated successfully', StatusCode.OK);
        } catch (e) {
            logger.error('Error updating user profile', formatLogMetadata({
                error: e,
                userId: userId
            }));
            return ApiResult.serverError('Error updating user profile');
        }
    }

    /**
     * Starts the KYC verification process for a user
     * @param userId - The ID of the user
     * @returns A promise that resolves to an ApiResult containing the user's profile data
     */
    async startKycVerification(userId: string): Promise<ApiResult<UserProfileDto>> {
        try {
            logger.info('Starting KYC verification', formatLogMetadata({
                userId: userId
            }));

            const user = await this.userRepository.findOne({ where: { id: userId } });

            if (!user) {
                return ApiResult.notFound('User not found');
            }
            if (user.kycStatus === KYCStatus.VERIFIED) {
                return ApiResult.conflict('User already verified');
            }
            if (user.kycStatus === KYCStatus.IN_PROGRESS) {
                return ApiResult.conflict('User already in KYC process');
            }
            if (user.kycStatus === KYCStatus.NOT_STARTED) {
                user.kycStatus = KYCStatus.IN_PROGRESS;
                await this.userRepository.save(user);
            }

            user.kycStatus = KYCStatus.IN_PROGRESS;
            await this.userRepository.save(user);
            const userProfile = UserProfileDto.fromEntity(user);

            // Publish an event to start KYC verification
            const eventPublisher = new EventPublisher();
            await eventPublisher.publish('KYC_VERIFICATION_STARTED', {
                userId: user.id,
                email: user.email,
                kycStatus: user.kycStatus,
                startedAt: new Date(),
            });

            logger.info('KYC verification started', formatLogMetadata({
                userId: userId
            }));

            return ApiResult.success(userProfile, 'KYC verification started successfully', StatusCode.OK);
        } catch (e) {
            logger.error('Error starting KYC verification', formatLogMetadata({
                error: e,
                userId: userId
            }));
            return ApiResult.serverError('Error starting KYC verification');
        }
    }

    /**
     * Completes the KYC verification process for a user
     * @param userId - The ID of the user
     * @param isApproved - Indicates whether the KYC verification is approved or rejected
     * @returns A promise that resolves to an ApiResult containing the user's profile data
     */
    async completeKycVerification(userId: string, isApproved: boolean): Promise<ApiResult<UserProfileDto>> {
        try {
            logger.info('Completing KYC verification', formatLogMetadata({
                userId: userId
            }));

            const user = await this.userRepository.findOne({where: {id: userId}});

            if (!user) {
                return ApiResult.notFound('User not found');
            }
            if (user.kycStatus === KYCStatus.VERIFIED) {
                return ApiResult.conflict('User already verified');
            }
            if (user.kycStatus === KYCStatus.NOT_STARTED) {
                return ApiResult.conflict('User not in KYC process');
            }

            user.kycStatus = isApproved ? KYCStatus.VERIFIED : KYCStatus.REJECTED;
            await this.userRepository.save(user);
            const userProfile = UserProfileDto.fromEntity(user);

            // Publish an event to complete KYC verification
            const eventPublisher = new EventPublisher();
            await eventPublisher.publish('KYC_VERIFICATION_COMPLETED', {
                userId: user.id,
                email: user.email,
                kycStatus: user.kycStatus,
                completedAt: new Date(),
            });

            logger.info('KYC verification completed', formatLogMetadata({
                userId: userId
            }));

            return ApiResult.success(userProfile, 'KYC verification completed successfully', StatusCode.OK);
        } catch (e) {
            logger.error('Error completing KYC verification', formatLogMetadata({
                error: e,
                userId: userId
            }));
            return ApiResult.serverError('Error completing KYC verification');
        }
    }

}