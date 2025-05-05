import winston from 'winston';
import { environment } from '../config/environment';

const logger = winston.createLogger({
    level: environment.logging.level,
    format: winston.format.combine(
        winston.format.timestamp(),
        environment.isProduction
            ? winston.format.json()
            : winston.format.printf(({ timestamp, level, message, ...rest }) => {
                return `${timestamp} [${level.toUpperCase()}]: ${message} ${
                    Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ''
                }`;
            })
    ),
    transports: [
        new winston.transports.Console({
            stderrLevels: ['error'],
        }),
    ],
});

export default logger;