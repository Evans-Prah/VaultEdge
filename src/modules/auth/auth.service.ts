import {Repository} from "typeorm";
import {User} from "../../shared/entities/user.entity";
import {RegisterDto} from "./dto/register.dto";
import {ApiResult, StatusCode} from "../../types/api-result";
import {RegisterResponseDto} from "./dto/register-response.dto";
import bcrypt from 'bcrypt';
import {AppDataSource} from "../../database/data-source";
import logger, {formatLogMetadata} from "../../utils/logger";
import {LoginDto} from "./dto/login.dto";
import {LoginResponseDto} from "./dto/login-response.dto";
import {TokenPayload} from "../../shared/models/token-payload";
import jwt, {Secret, SignOptions} from "jsonwebtoken";
import {environment} from "../../config/environment";

export interface IAuthService {
    register(dto: RegisterDto): Promise<ApiResult<RegisterResponseDto>>;
    login(dto: LoginDto): Promise<ApiResult<LoginResponseDto>>;
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

          logger.info('Registering user', formatLogMetadata({
              email: dto.email,
          }));

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


          return ApiResult.success(responseDto, 'User registered successfully', StatusCode.CREATED);
      } catch (error) {
            logger.error('Error registering user', formatLogMetadata({
                error: error,
                email: dto.email,
            }));
          return ApiResult.serverError('Something went wrong while registering user, please try again later');
      }
    }

    async login(dto: LoginDto): Promise<ApiResult<LoginResponseDto>> {
        try {

            logger.info('Logging in user', formatLogMetadata({
                email: dto.email,
            }));

            const user = await this.userRepository.findOne({
                where: {email: dto.email},
            });

            if (!user) {
                return ApiResult.unauthorized('Invalid email or password');
            }

            const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

            if (!isPasswordValid) {
                return ApiResult.unauthorized('Invalid email or password');
            }

            const tokenResponse = this.generateToken(user);

            const responseDto = new LoginResponseDto({
                accessToken: tokenResponse.token,
                userId: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
            });

            logger.info('User logged in successfully', formatLogMetadata({
                email: dto.email,
            }));

            return ApiResult.success(responseDto, 'User logged in successfully');
        } catch (error) {
            logger.error('Error logging in user', formatLogMetadata({
                error: error,
                email: dto.email,
            }));
            return ApiResult.serverError('Something went wrong while logging in, please try again later');
        }
    }

    private generateToken(user: User) {
        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            iat: Math.floor(Date.now() / 1000),
        };

        const secret: Secret = environment.auth.jwtSecret;

        const options: SignOptions = {
            expiresIn: 30 * 60, // 30 minutes
            issuer:    environment.auth.jwtIssuer,
            audience:  environment.auth.jwtAudience,
        };

        const token = jwt.sign(payload, secret, options);

        return { token, expiresIn: environment.auth.jwtExpiresIn };
    }
}