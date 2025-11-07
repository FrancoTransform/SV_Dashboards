import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CORRECT_PASSWORD = 'S@V25';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === CORRECT_PASSWORD) {
      const response = NextResponse.json({ success: true });
      
      // Set authentication cookie
      response.cookies.set('sva-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

