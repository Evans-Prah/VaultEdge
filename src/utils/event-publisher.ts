import { Kafka, Producer } from 'kafkajs';
import { environment } from '../config/environment';
import logger from './logger';

export class EventPublisher {
    private readonly producer: Producer;
    private isConnected: boolean = false;

    constructor() {
        const kafka = new Kafka({
            clientId: environment.kafka.clientId,
            brokers: environment.kafka.brokers,
        });

        this.producer = kafka.producer();
    }

    async connect(): Promise<void> {
        if (this.isConnected) return;

        try {
            await this.producer.connect();
            this.isConnected = true;
            logger.info('Kafka producer connected');
        } catch (error) {
            logger.error('Error connecting to Kafka producer', error);
            throw new Error('Failed to connect to Kafka producer');
        }
    }

    async publish(topic: string, message: object): Promise<void> {
        if (!this.isConnected) {
            await this.connect();
        }

        try {
            await this.producer.send({
                topic,
                messages: [
                    {
                        value: JSON.stringify(message),
                    },
                ],
            });
            logger.info(`Message sent to topic ${topic}`, message);
        } catch (error) {
            logger.error('Error sending message to Kafka', error);
            throw new Error('Failed to send message to Kafka');
        }
    }

    async disconnect(): Promise<void> {
        if (!this.isConnected) return;

        try {
            await this.producer.disconnect();
            this.isConnected = false;
            logger.info('Kafka producer disconnected');
        } catch (error) {
            logger.error('Error disconnecting Kafka producer', error);
        }
    }
}