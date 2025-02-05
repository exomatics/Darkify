import type { NextFunction, Request, Response, RequestHandler } from 'express';

function asyncHandler(function_: RequestHandler) {
  return function (request: Request, response: Response, next: NextFunction) {
    // eslint-disable-next-line github/no-then
    Promise.resolve(function_(request, response, next)).catch(next);
  };
}

export default asyncHandler;
