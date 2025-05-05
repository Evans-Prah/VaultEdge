import {Repository} from "typeorm";
import {User} from "../../shared/entities/user.entity";
import {RegisterDto} from "./dto/register.dto";
import {ApiResult, StatusCode} from "../../types/api-result";
import {RegisterResponseDto} from "./dto/register-response.dto";
import bcrypt from 'bcrypt';
import {AppDataSource} from "../../database/data-source";
import logger from "../../utils/logger";

export interface IAuthService {
    register(dto: RegisterDto): Promise<ApiResult<RegisterResponseDto>>;
}

export class AuthService implements IAuthService {
    private userRepository: Repository<User>;
    constructor(
        userRepository: Repository<User> = AppDataSource.getRepository(User)
    ) {
        this.userRepository = userRepository;
    }
    /**
     * Registers a new user
     * @param dto - The registration data transfer object
     * @returns A promise that resolves to an ApiResult containing the registration response
     */
    async register(dto: RegisterDto): Promise<ApiResult<RegisterResponseDto>> {
      try {
          logger.info('Registering user',{email: dto.email} );

          const existingUser = await this.userRepository.findOne({
              where: { email: dto.email },
          })

          if (existingUser) {
              return ApiResult.conflict('User already exists');
          }

          const passwordHash = await bcrypt.hash(dto.password, 10);
          const user = this.userRepository.create({
              email: dto.email,
              passwordHash,
              firstName: dto.firstName,
              otherNames: dto.otherNames,
              lastName: dto.lastName,
              phoneNumber: dto.phoneNumber,
              dateOfBirth: dto.dateOfBirth,
          });

          const newUser = await this.userRepository.save(user);

          const responseDto = new RegisterResponseDto({
              id: newUser.id,
              email: newUser.email,
              createdAt: newUser.createdAt,
              updatedAt: newUser.updatedAt,
          });

            logger.info('User registered successfully', { userId: newUser.id });

          return ApiResult.success(responseDto, 'User registered successfully', StatusCode.CREATED);
      } catch (error) {
          logger.error('Error registering user', error);
          return ApiResult.serverError('Something went wrong while registering user, please try again later');
      }
    }
}