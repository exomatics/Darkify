import OperationalError from './operational-error.ts';
class NotFoundError extends OperationalError {
  constructor(message = 'Resource not found') {
    super('NotFoundError', 404, message);
  }
}

export default NotFoundError;
