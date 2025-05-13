import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { json, urlencoded } from 'body-parser';
import { environment } from './config/environment';
import logger from "./utils/logger";
import {requestLogger} from "./middleware/request-logger";
import {errorHandler} from "./middleware/error-handler";
import {connectToDatabase} from "./database/data-source";
import {snakeCaseResponseMiddleware} from "./middleware/snake-case-response";
import {snakeCaseRequestMiddleware} from "./middleware/snake-case-request";


// Import routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from "./modules/users/user.routes";

const app = express();

// Swagger/OpenAPI setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'VaultEdge API',
            version: '1.0.0',
            description: 'API documentation for the VaultEdge monolithic backend',
        },
        servers: [
            {
                url: `http://localhost:${environment.server.port}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Path to the API docs
    apis: [
        './src/**/*.routes.ts',
        './src/**/*.controller.ts',
        './src/modules/**/*.ts'
    ],
    failOnErrors: true // This will help identify any spec errors
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Middleware
app.use(express.json());
app.use(snakeCaseRequestMiddleware);
app.use(snakeCaseResponseMiddleware);
app.use(helmet())
app.use(cors({ origin: environment.server.corsOrigin }));
app.use(compression());
app.use(json({ limit: environment.server.bodyLimit }));
app.use(urlencoded({ extended: true, limit: environment.server.bodyLimit }));
app.use(requestLogger);


// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', userRoutes);

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});


// Error handling middleware
app.use(errorHandler);

// start the server
async function startServer() {
   try {
       // Check if the database connection is established
       await connectToDatabase();

       const PORT = environment.server.port;

       const server = app.listen(PORT, () => {
           logger.info(`Server running on port ${PORT} in ${environment.nodeEnv} mode`);
       });

       const shutdown = async () => {
           logger.info('Shutting down server...');
           server.close(() => {
               logger.info('Server closed');
               process.exit(0);
           });

           setTimeout(() => {
               logger.error('Could not close connections in time, forcefully shutting down');
               process.exit(1);
           }, 30000);
       };

       process.on('SIGTERM', shutdown);
       process.on('SIGINT', shutdown);

   } catch (error) {
       logger.error('Error starting server:', error);
       process.exit(1);
   }
}

startServer().then(() => {
    logger.info('Server started successfully');
});