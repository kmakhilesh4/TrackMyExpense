import winston from 'winston';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const NODE_ENV = process.env.NODE_ENV || 'development';

const logger = winston.createLogger({
    level: LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'trackmyexpense-api', environment: NODE_ENV },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
                    const correlation = correlationId ? `[${correlationId}] ` : '';
                    const metaStr = Object.keys(meta).length > 2 ? JSON.stringify(meta, null, 2) : '';
                    return `${timestamp} ${correlation}[${level}]: ${message} ${metaStr}`;
                })
            ),
        }),
    ],
});

// Create child logger with correlation ID
export const createLogger = (correlationId?: string) => {
    return logger.child({ correlationId });
};

export default logger;

