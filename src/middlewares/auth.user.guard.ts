import { Request, Response, NextFunction } from 'express';
import { TokenUtil } from '../utils/token.util';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

const authUser = async (
  req: Request & { user?: { userId: string } },
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not Authorized Login Again' });
    }

    const token_decode = TokenUtil.verifyToken(token as string) as jwt.JwtPayload;

    req.user = { userId: token_decode.id };

    next();
  } catch (error: unknown) {
    logger.error('Auth User Error:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(401).json({ success: false, message: 'Invalid or Expired Token' });
  }
};

export { authUser };
