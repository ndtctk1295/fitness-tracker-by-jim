import { AuthOptions } from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { MongoClient, MongoClientOptions } from 'mongodb';
import { usersRepo } from '@/lib/repositories';
import { validateCredentials } from '@/lib/services/server-service/user-service';
import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import connectToMongoDB from '@/lib/mongodb';
import { mongoClientPromise } from '@/lib/mongodb';
import { rateLimitService } from '@/lib/services/rate-limit-service';
import AuthError from "next-auth"
// import AuthError from '@/app/auth/error/page';
// Extend session types to include custom fields
declare module "next-auth" {
  interface User {
    role?: string;
    id?: string;
  }
  
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
  }
}

export const authOptions: NextAuthOptions = {
  // Configure secure cookies and session settings
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      // type: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        console.log('[NextAuth] Authorizing credentials for:', credentials?.email);
        console.log('[NextAuth] Using MongoDB URI:', process.env.MONGODB_URI);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('[NextAuth] Missing credentials');
          return null;
        }

        try {
          // Get client IP for additional rate limiting
          const clientIP = req?.headers?.['x-forwarded-for'] || 
                           req?.headers?.['x-real-ip'] || 
                           req?.connection?.remoteAddress || 
                           'unknown';

          // Check rate limits for both email and IP
          const emailRateLimit = await rateLimitService.checkRateLimit(credentials.email, 'email');
          const ipRateLimit = await rateLimitService.checkRateLimit(clientIP as string, 'ip');

          console.log('[NextAuth] Rate limit check - Email:', emailRateLimit, 'IP:', ipRateLimit);

          // If either email or IP is locked/delayed, reject
          if (emailRateLimit.isLocked) {
            console.log('[NextAuth] Account locked:', emailRateLimit.message);
            throw new Error('AccountLocked');
          }

          if (emailRateLimit.nextAllowedAttempt && emailRateLimit.nextAllowedAttempt > new Date()) {
            console.log('[NextAuth] Rate limited:', emailRateLimit.message);
            throw new Error('RateLimited');
          }

          if (ipRateLimit.isLocked || (ipRateLimit.nextAllowedAttempt && ipRateLimit.nextAllowedAttempt > new Date())) {
            console.log('[NextAuth] IP rate limited');
            throw new Error('RateLimited');
          }

          // Use the user repository for credential validation
          const user = await usersRepo.validateCredentials(credentials.email, credentials.password);
          
          if (!user) {
            console.log('[NextAuth] User not found or invalid password for:', credentials.email);
            
            // Record failed attempt for both email and IP
            await rateLimitService.recordFailedAttempt(credentials.email, 'email');
            await rateLimitService.recordFailedAttempt(clientIP as string, 'ip');
            
            throw new Error('Invalid Credentials');
          }

          // Success - clear any rate limiting records
          await rateLimitService.recordSuccessfulAttempt(credentials.email, 'email');
          await rateLimitService.recordSuccessfulAttempt(clientIP as string, 'ip');
          
          console.log('[NextAuth] User authenticated successfully:', {
            id: user._id.toString(),
            email: user.email,
            role: user.role || 'user'
          });

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role || 'user',
          };
        } catch (error) {
          console.error('[NextAuth] Authorization error:', error);
          
          // Handle specific rate limiting errors
          if (error instanceof Error) {
            if (error.message === 'AccountLocked') {
              throw new Error('TooManyAttempts');
            }
            if (error.message === 'RateLimited') {
              throw new Error('TooManyAttempts');
            }
          }
          
          throw error;
        }
      }
    }),
  ],
  
  adapter: MongoDBAdapter(mongoClientPromise),
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
    pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
    signOut: '/auth/signin', // Redirect to signin page after logout
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true, // Prevents JavaScript access
        sameSite: 'lax', // Allows cookie to be sent on redirects
        path: '/', // Ensures cookie is available site-wide
        secure: process.env.NODE_ENV === 'production', // Secure in production
      },
    },
  },
  
  callbacks: {
    // Handle redirects after authentication events
    async redirect({ url, baseUrl }) {
      // console.log('[NextAuth] Redirect callback - URL:', url, 'BaseURL:', baseUrl);
      
      // // If already authenticated and going to signin, go to dashboard instead
      // if (url.includes('/auth/signin')) {
      //   console.log('[NextAuth] Redirect to signin detected, going to dashboard instead');
      //   return `${baseUrl}/dashboard`;
      // }
      
      // Starts with slash = relative URL from our site
      if (url.startsWith('/')) {
        const fullUrl = `${baseUrl}${url}`;
        // console.log('[NextAuth] Relative URL redirect:', fullUrl);
        return fullUrl;
      }
      
      // Same origin = allowed
      if (new URL(url).origin === baseUrl) {
        // console.log('[NextAuth] Same origin redirect:', url);
        return url;
      }
      
      // Different origin = redirect to dashboard for security
      // console.log('[NextAuth] External origin, redirecting to dashboard');
      return `${baseUrl}/dashboard`;
    },
    
    // Include user role and id in session and token
    async jwt({ token, user, trigger, session }) {
      console.log('[NextAuth] JWT callback - User:', !!user, 'Token ID:', token.id, 'Trigger:', trigger);
      
      // Update token if user object is available (during sign in)
      if (user) {
        token.role = user.role;
        token.id = user.id;
        // console.log('[NextAuth] Updated token with user data:', { id: token.id, role: token.role });
      }

      // Handle role updates if using session update
      if (trigger === 'update' && session?.user?.role) {
        token.role = session.user.role;
        // console.log('[NextAuth] Updated token role from session update:', token.role);
      }

      return token;
    },
    
    // Make role and id available on the client-side session
    async session({ session, token }) {
      console.log('[NextAuth] Session callback - Token ID:', token.id, 'Session User:', !!session.user);
      
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        // console.log('[NextAuth] Enhanced session with:', {
        //   id: session.user.id,
        //   email: session.user.email,
        //   role: session.user.role
        // });
      }
      
      return session;
    },
  //   async signIn({ user, account, profile, email, credentials }) 
  //     {
  //     if(user?.error === 'my custom error') {
  //        throw new Error('custom error to the client')
  //     }
  //     return true
  //  }
  },
  
  // Enhanced debugging
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('[NextAuth Error]', code, metadata);
    },
    warn(code) {
      console.warn('[NextAuth Warning]', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[NextAuth Debug]', code, metadata);
      }
    }
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
