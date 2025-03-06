class OperationalError extends Error {
  statusCode: number;
  // isOperational: boolean;
  constructor(name: string, statusCode: number, message: string) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.statusCode = statusCode;
    // this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
}
export default OperationalError;
