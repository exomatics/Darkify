import logger from '../config/logger.ts';
import OperationalError from '../errors/operational-error.ts';

import type { ErrorRequestHandler } from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
const errorHandler: ErrorRequestHandler = (error, request, response, next) => {
  if (error instanceof OperationalError) {
    logger.error(`[${error.name}]: ${error.message}`);
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }
  response.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
export default errorHandler;
