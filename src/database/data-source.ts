import {DataSource} from "typeorm";
import {config} from "dotenv";
import path from 'path';

config()

export const AppDataSource = new DataSource({
    "type": "postgres",
    "host": process.env.DB_HOST || "localhost",
    "port": parseInt(process.env.DB_PORT || "5432"),
    "username": process.env.DB_USERNAME || "postgres",
    "password": process.env.DB_PASSWORD || "postgres",
    "database": process.env.DB_NAME || "vault_edge",
    //"synchronize": process.env.NODE_ENV === "development" ? process.env.NODE_ENV === "development" : false,
    synchronize: false,          // never use in prod
    "logging": process.env.NODE_ENV === "development",
    "entities": [path.join(__dirname, '../**/*.entity{.ts,.js}')],
    "migrations": [path.join(__dirname, 'migrations/**/*{.ts,.js}')],
    "subscribers": [],
    "ssl": process.env.DB_SSL === 'true' ? { "rejectUnauthorized": false } : false,
})

export const connectToDatabase = async () => {
    try {
        const { Client } = require('pg');
        const client = new Client({
            host: process.env.DB_HOST || "localhost",
            port: parseInt(process.env.DB_PORT || "5432"),
            user: process.env.DB_USERNAME || "postgres",
            password: process.env.DB_PASSWORD || "postgres",
        });

        await client.connect();

        const dbName = process.env.DB_NAME || "vault_edge";
        const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`;
        const result = await client.query(checkDbQuery);

        if (result.rowCount === 0) {
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database "${dbName}" created successfully`);
        }

        await client.end();

        await AppDataSource.initialize();
        console.log("Database connection established successfully");
    } catch (error) {
        console.error("Error during database connection", error);
        throw error;
    }
};