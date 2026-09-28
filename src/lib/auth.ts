import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export type AuthPayload = {
  userId: string;
  tenantId: string;
  role: 'ADMIN' | 'MEMBER';
  email: string;
};

const JWT_SECRET: string = process.env.JWT_SECRET ?? '';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing in environment variables.');
}

export async function hashPassword(rawPassword: string) {
  return bcrypt.hash(rawPassword, 10);
}

export async function comparePassword(rawPassword: string, hash: string) {
  return bcrypt.compare(rawPassword, hash);
}

export function signAuthToken(payload: AuthPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAuthToken(token: string) {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid authentication token payload.');
  }

  return decoded as AuthPayload;
}
