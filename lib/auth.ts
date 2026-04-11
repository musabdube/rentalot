import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { compare } from 'bcryptjs';
import { consumeRateLimit, getClientIp, resetRateLimit } from './rateLimit';

const SIGNIN_IP_LIMIT = { max: 20, windowMs: 15 * 60 * 1000 };
const SIGNIN_EMAIL_LIMIT = { max: 8, windowMs: 15 * 60 * 1000 };

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const ip = getClientIp(req?.headers);

        const ipRateLimit = consumeRateLimit(`signin:ip:${ip}`, SIGNIN_IP_LIMIT);
        const emailRateLimit = consumeRateLimit(`signin:email:${normalizedEmail}`, SIGNIN_EMAIL_LIMIT);

        if (!ipRateLimit.success || !emailRateLimit.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await compare(credentials.password, user.password);

        if (!passwordMatch) {
          return null;
        }

        resetRateLimit(`signin:ip:${ip}`);
        resetRateLimit(`signin:email:${normalizedEmail}`);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        // Don't include avatar in JWT to keep token size small
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        // Don't include image/avatar in session to prevent header bloat
        delete session.user.image;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      try {
        const parsedUrl = new URL(url);
        const parsedBaseUrl = new URL(baseUrl);

        if (parsedUrl.origin === parsedBaseUrl.origin) {
          return url;
        }
      } catch {
        return baseUrl;
      }

      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Secure cookie settings for production
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      },
    },
  },
  // Ensure HTTPS in production
  useSecureCookies: process.env.NODE_ENV === 'production',
};
