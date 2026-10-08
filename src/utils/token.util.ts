import Jwt from 'jsonwebtoken';

export class TokenUtil {
  static signToken(payload: string | object, expiresIn?: string | number): string {
    const secret = process.env.JWT_SECRET || 'default_secret';
    if (typeof payload === 'string') {
      return expiresIn ? Jwt.sign(payload, secret) : Jwt.sign(payload, secret);
    }
    return expiresIn
      ? Jwt.sign(payload, secret, { expiresIn: expiresIn as Jwt.SignOptions['expiresIn'] })
      : Jwt.sign(payload, secret);
  }

  static verifyToken(token: string): string | Jwt.JwtPayload {
    const secret = process.env.JWT_SECRET || 'default_secret';
    return Jwt.verify(token, secret);
  }
}
