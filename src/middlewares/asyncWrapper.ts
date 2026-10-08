import { Request, Response, NextFunction } from 'express';

export const catchAsync = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown> | void,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as unknown as T, res, next)).catch(next);
  };
};
