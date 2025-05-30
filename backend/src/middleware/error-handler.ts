import logger from '../config/logger.ts';
import OperationalError from '../errors/operational-error.ts';

import type { ErrorRequestHandler } from 'express';
const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  if (error instanceof OperationalError) {
    logger.error(`[${error.name}]: ${error.message}`);

    response.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  logger.error(error);

  response.status(500).json({
    message: 'Internal Server Error',
  });
  next();
};
export default errorHandler;
