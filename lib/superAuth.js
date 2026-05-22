import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export const SUPER_COOKIE = 'super_auth_token';
const EXPIRES_IN = '7d';

export const SUPER_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
};

function getSecret() {
  const secret = process.env.SUPER_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    return new TextEncoder().encode('super-dev-secret-minimum-32-chars!!');
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function createSuperToken(payload) {
  return new SignJWT({ ...payload, type: 'super_admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(getSecret());
}

export async function verifySuperToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload?.type !== 'super_admin' || !payload?.superAdminId) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSuperAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(SUPER_COOKIE, token, SUPER_COOKIE_OPTIONS);
}

/** Define o cookie na resposta HTTP (necessário em Route Handlers com fetch do cliente). */
export function attachSuperAuthCookie(response, token) {
  response.cookies.set(SUPER_COOKIE, token, SUPER_COOKIE_OPTIONS);
  return response;
}

export async function removeSuperAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SUPER_COOKIE);
}

export async function getSuperSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SUPER_COOKIE)?.value;
  if (!token) return null;
  return verifySuperToken(token);
}
