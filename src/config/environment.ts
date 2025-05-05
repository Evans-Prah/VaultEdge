export const environment = {
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    server: {
        port: parseInt(process.env.PORT || '5782', 10),
        bodyLimit: process.env.BODY_LIMIT || '10mb',
        corsOrigin: process.env.CORS_ORIGIN || '*',
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
    },
}