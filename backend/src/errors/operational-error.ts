class OperationalError extends Error {
  statusCode: number;
  constructor(name: string, statusCode: number, message: string) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.statusCode = statusCode;

    Error.captureStackTrace(this);
  }
}
export default OperationalError;
