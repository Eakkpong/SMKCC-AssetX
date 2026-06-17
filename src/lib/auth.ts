import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'smkcc-super-secret-key-for-jwt-2026';
const key = new TextEncoder().encode(secretKey);

export async function login(password: string) {
  if (password === (process.env.ADMIN_PASSWORD || 'erhrie4K')) {
    const token = await new SignJWT({ admin: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(key);
      
    (await cookies()).set('session', token, { httpOnly: true, path: '/' });
    return true;
  }
  return false;
}

export async function logout() {
  (await cookies()).delete('session');
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, key);
    return payload;
  } catch (err) {
    return null;
  }
}

