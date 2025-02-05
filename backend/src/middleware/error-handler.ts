import logger from '../config/logger.ts';
import OperationalError from '../errors/operational-error.ts';

import type { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (error, request, response) => {
  if (error instanceof OperationalError) {
    logger.error(`[${error.name}]: ${error.message}`);

    response.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  logger.error(error);

  response.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
export default errorHandler;
