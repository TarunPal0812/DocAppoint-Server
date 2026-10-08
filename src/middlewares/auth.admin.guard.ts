import { Request, Response, NextFunction } from 'express';
import { TokenUtil } from '../utils/token.util';
import { logger } from '../utils/logger';

const authAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { atoken } = req.headers;
    if (!atoken) {
      return res.status(401).json({ success: false, message: 'Not Authorized Login Again' });
    }

    const token_decode = TokenUtil.verifyToken(atoken as string);

    if (token_decode !== process.env.ADMIN_EMAIL! + process.env.ADMIN_PASSWORD!) {
      return res.status(401).json({ success: false, message: 'Not Authorized Login Again' });
    }
    next();
  } catch (error: unknown) {
    logger.error('Auth Admin Error:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return res.status(401).json({ success: false, message: 'Invalid or Expired Token' });
  }
};

export { authAdmin };
