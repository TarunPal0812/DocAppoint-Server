import { Request, Response, NextFunction } from 'express';
import { TokenUtil } from '../utils/token.util';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

const authDoctor = async (
  req: Request & { doc?: { docId: string } },
  res: Response,
  next: NextFunction,
) => {
  try {
    const { dtoken } = req.headers;
    if (!dtoken) {
      return res.status(401).json({ success: false, message: 'Not Authorized Login Again' });
    }

    const token_decode = TokenUtil.verifyToken(dtoken as string) as jwt.JwtPayload;

    req.doc = { docId: token_decode.id };

    next();
  } catch (error: unknown) {
    logger.error('Auth Doctor Error:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(401).json({ success: false, message: 'Invalid or Expired Token' });
  }
};

export { authDoctor };
