export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
};

export function middleware(req) {
  const auth = req.headers.get('authorization');
  const pass = process.env.ADMIN_PASSWORD || '';
  const expected = 'Basic ' + btoa('admin:' + pass);

  if (auth === expected) {
    return;
  }

  return new Response('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin"' }
  });
}
