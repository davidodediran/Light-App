import { NextRequest, NextResponse } from 'next/server'
import { signIn, adminGetUser, extractUserAttributes } from '@/lib/aws/cognito'
import { getRoleDashboard } from '@/types'
import type { UserRole } from '@/types'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  try {
    const auth = await signIn(email, password)
    const tokens = auth.AuthenticationResult
    if (!tokens?.AccessToken || !tokens?.IdToken) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    const userInfo = await adminGetUser(email)
    const attrs = extractUserAttributes(userInfo.UserAttributes ?? [])
    const role = attrs['custom:role'] as UserRole

    const res = NextResponse.json({
      success: true,
      redirectTo: getRoleDashboard(role),
    })

    res.cookies.set('access_token', tokens.AccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    res.cookies.set('id_token', tokens.IdToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return res
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Authentication failed'
    return NextResponse.json({ error: msg }, { status: 401 })
  }
}
