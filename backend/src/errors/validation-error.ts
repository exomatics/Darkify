import OperationalError from './operational-error.ts';
class ValidationError extends OperationalError {
  constructor(message = 'Validation failed') {
    super('ValidationError', 400, message);
  }
}

export default ValidationError;
