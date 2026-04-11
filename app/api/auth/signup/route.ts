import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { consumeRateLimit, getClientIp } from '@/lib/rateLimit';

const SIGNUP_IP_LIMIT = { max: 10, windowMs: 15 * 60 * 1000 };
const SIGNUP_EMAIL_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 };

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, confirmPassword, role } = await req.json();

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const ip = getClientIp(req.headers);

    const ipRateLimit = consumeRateLimit(`signup:ip:${ip}`, SIGNUP_IP_LIMIT);
    if (!ipRateLimit.success) {
      return NextResponse.json(
        { message: 'Too many signup attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(ipRateLimit.retryAfter),
          },
        }
      );
    }

    if (normalizedEmail) {
      const emailRateLimit = consumeRateLimit(`signup:email:${normalizedEmail}`, SIGNUP_EMAIL_LIMIT);
      if (!emailRateLimit.success) {
        return NextResponse.json(
          { message: 'Too many signup attempts. Please try again later.' },
          {
            status: 429,
            headers: {
              'Retry-After': String(emailRateLimit.retryAfter),
            },
          }
        );
      }
    }

    // Validation
    if (!name || !normalizedEmail || !password || !confirmPassword || !role) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!['TENANT', 'LANDLORD'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role selected' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Enforce password strength: at least one lowercase, one uppercase, one digit, one special char
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return NextResponse.json(
        { message: 'Password must include uppercase, lowercase, number, and special character' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user with selected role
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
