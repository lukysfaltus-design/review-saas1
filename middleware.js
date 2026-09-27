import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

export function middleware(req) {
  const authHeader = req.headers.get('authorization');
  const expected = 'Basic ' + btoa('admin:' + process.env.ADMIN_PASSWORD);

  if (authHeader === expected) {
    return NextResponse.next();
  }

  return new NextResponse('Autentizace vyžadována.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Administrace"' },
  });
}
