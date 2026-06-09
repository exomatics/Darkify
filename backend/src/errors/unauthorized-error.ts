import OperationalError from './operational-error.ts';
class UnauthorizedError extends OperationalError {
  constructor(message = 'Unauthorized access') {
    super('ValidationError', 403, message);
  }
}

export default UnauthorizedError;
