import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify, createRemoteJWKSet } from 'jose'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/student-login', '/api/auth']

const POOL_ID  = process.env.COGNITO_USER_POOL_ID!
const REGION   = process.env.AWS_REGION ?? 'us-east-1'
const JWKS_URL = `https://cognito-idp.${REGION}.amazonaws.com/${POOL_ID}/.well-known/jwks.json`

let JWKS: ReturnType<typeof createRemoteJWKSet> | null = null
function getJWKS() {
  if (!JWKS) JWKS = createRemoteJWKSet(new URL(JWKS_URL))
  return JWKS
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) return NextResponse.next()

  const token = req.cookies.get('access_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, getJWKS(), {
      issuer: `https://cognito-idp.${REGION}.amazonaws.com/${POOL_ID}`,
    })

    const role = payload['custom:role'] as string
    const institutionId = payload['custom:institution_id'] as string

    if (!role || !institutionId) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const res = NextResponse.next()
    res.headers.set('x-user-id', payload.sub ?? '')
    res.headers.set('x-user-role', role)
    res.headers.set('x-institution-id', institutionId)
    return res
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.delete('access_token')
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
