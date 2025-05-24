export enum StatusCode {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    FAILED_DEPENDENCY = 424,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503
}

export class ApiResult<T> {
    success: boolean;
    message: string;
    status_code: StatusCode;
    data?: T;
    errors?: string[];
    timestamp: Date;
    transaction_id?: string;
    metadata?: Record<string, any>;
    pagination?: {
        page: number;
        limit: number;
        total_items: number;
        total_pages: number;
    };

    private constructor(init: Partial<ApiResult<T>>) {
        this.success = init.success ?? false;
        this.message = init.message ?? '';
        this.status_code = init.status_code || StatusCode.INTERNAL_SERVER_ERROR;
        this.data = init.data;
        this.errors = init.errors;
        this.timestamp = new Date();
        this.transaction_id = init.transaction_id || crypto.randomUUID();
        this.metadata = init.metadata;
        this.pagination = init.pagination;
    }

    static success<T>(
        data: T,
        message = 'Operation successful',
        status_code = StatusCode.OK,
        metadata?: Record<string, any>,
        pagination?: ApiResult<T>['pagination']
    ): ApiResult<T> {
        return new ApiResult<T>({
            success: true,
            message,
            status_code,
            data,
            metadata,
            pagination
        });
    }

    static fail<T>(
        message: string,
        status_code = StatusCode.BAD_REQUEST,
        errors?: string[],
        metadata?: Record<string, any>
    ): ApiResult<T> {
        return new ApiResult<T>({
            success: false,
            message,
            status_code,
            errors,
            metadata
        });
    }


    static notFound<T>(message = 'Resource not found', errors?: string[]): ApiResult<T> {
        return ApiResult.fail<T>(message, StatusCode.NOT_FOUND, errors);
    }

    static unauthorized<T>(message = 'Unauthorized', errors?: string[]): ApiResult<T> {
        return ApiResult.fail<T>(message, StatusCode.UNAUTHORIZED, errors);
    }

    static forbidden<T>(message = 'Forbidden', errors?: string[]): ApiResult<T> {
        return ApiResult.fail<T>(message, StatusCode.FORBIDDEN, errors);
    }

    static conflict<T>(message = 'Conflict', errors?: string[]): ApiResult<T> {
        return ApiResult.fail<T>(message, StatusCode.CONFLICT, errors);
    }

    static failedDependency<T>(message = 'Failed Dependency', errors?: string[]): ApiResult<T> {
        return ApiResult.fail<T>(message, StatusCode.FAILED_DEPENDENCY, errors);
    }

    static tooManyRequests<T>(message = 'Too Many Requests', errors?: string[]): ApiResult<T> {
        return ApiResult.fail<T>(message, StatusCode.TOO_MANY_REQUESTS, errors);
    }

    static serverError<T>(message = 'Internal Server Error', errors?: string[]): ApiResult<T> {
        return ApiResult.fail<T>(message, StatusCode.INTERNAL_SERVER_ERROR, errors);
    }

    static serviceUnavailable<T>(message = 'Service Unavailable', errors?: string[]): ApiResult<T> {
        return ApiResult.fail<T>(message, StatusCode.SERVICE_UNAVAILABLE, errors);
    }
}