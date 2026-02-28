import type { NextAuthOptions, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { loginSchema } from '@forgeitup/shared';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      subscriptionTier?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    userId?: string;
    subscriptionTier?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const result = loginSchema.safeParse(credentials);
        if (!result.success) return null;

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result.data),
          });

          if (!response.ok) return null;

          const data = await response.json();
          if (!data.success || !data.data) return null;

          return {
            id: data.data.user.id,
            email: data.data.user.email,
            name: data.data.user.displayName,
            image: data.data.user.avatarUrl,
            accessToken: data.data.token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: { accessToken?: string; id?: string }; account?: { access_token?: string } | null }) {
      if (user) {
        token.userId = user.id;
        if (user.accessToken) {
          token.accessToken = user.accessToken;
        }
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken;
      session.user.id = token.userId ?? token.sub ?? '';
      session.user.subscriptionTier = token.subscriptionTier ?? 'free';
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
