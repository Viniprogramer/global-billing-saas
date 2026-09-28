import { NextRequest } from 'next/server';
import { verifyAuthToken } from './auth';

export function getTokenFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.replace('Bearer ', '').trim();
}

export function requireAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return null;
  }

  try {
    return verifyAuthToken(token);
  } catch {
    return null;
  }
}
