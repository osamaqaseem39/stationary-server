import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { config } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  roleId: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const secret: string = config.jwtSecret;
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as StringValue
  };
  return jwt.sign(payload, secret, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const secret: string = config.jwtRefreshSecret;
  const options: SignOptions = {
    expiresIn: config.jwtRefreshExpiresIn as StringValue
  };
  return jwt.sign(payload, secret, options);
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret as string) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtRefreshSecret as string) as TokenPayload;
};

