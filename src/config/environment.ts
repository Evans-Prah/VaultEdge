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
    auth: {
        jwtSecret: process.env.JWT_SECRET || 'default-dev-secret',
        jwtIssuer: process.env.JWT_ISSUER || 'vault-edge',
        jwtAudience: process.env.JWT_AUDIENCE || 'vault-edge',
        saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
    },
    kafka: {
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        clientId: process.env.KAFKA_CLIENT_ID || 'vault-edge',
        groupId: process.env.KAFKA_GROUP_ID || 'vault-edge-group',
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    }
}