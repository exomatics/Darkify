import OperationalError from './operational-error.ts';
class InternalError extends OperationalError {
  constructor(message = 'InternalError') {
    super('InternalError', 500, message);
  }
}

export default InternalError;
