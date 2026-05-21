import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'auth_token';

const PUBLIC_PATHS = [
  '/login',
  '/recuperar-senha',
  '/redefinir-senha',
  '/api/auth/login',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    return new TextEncoder().encode('dev-secret-key-minimum-32-chars!!');
  }
  return new TextEncoder().encode(secret);
}

async function verifyAuth(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload?.userId ? payload : null;
  } catch {
    return null;
  }
}

function isPublic(pathname) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyAuth(token) : null;

  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(session ? '/dashboard' : '/login', request.url)
    );
  }

  if (isPublic(pathname)) {
    if (session && (pathname === '/login' || pathname === '/recuperar-senha')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
