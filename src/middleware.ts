import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

// Store simple pour le rate limiting en mémoire
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT = 50; // Nombre de requêtes max
const WINDOW_MS = 60 * 1000; // Fenêtre d'1 minute

export async function middleware(request: NextRequest) {
  // Ignorer les fichiers statiques et images
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/static') ||
    request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/i)
  ) {
    return NextResponse.next();
  }

  // Récupérer l'IP du client
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1';

  const currentTime = Date.now();
  const limitData = rateLimitMap.get(ip) || { count: 0, lastReset: currentTime };

  // Réinitialiser si la fenêtre est passée
  if (currentTime - limitData.lastReset > WINDOW_MS) {
    limitData.count = 0;
    limitData.lastReset = currentTime;
  }

  limitData.count++;
  rateLimitMap.set(ip, limitData);

  if (limitData.count > RATE_LIMIT) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  // Update Supabase session and check Auth
  const authResponse = await updateSession(request);

  // Ajouter les headers de sécurité au response de Auth
  authResponse.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString());
  authResponse.headers.set('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT - limitData.count).toString());
  
  return authResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
