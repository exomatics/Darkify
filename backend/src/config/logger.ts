import winston, { format } from 'winston';
const { combine, timestamp, json } = format;
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp(), json()),
  transports: [new winston.transports.Console()],
});
export default logger;
