import { AuthOptions } from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { MongoClient } from 'mongodb';
import { usersRepo } from '@/lib/repositories';
import { validateCredentials } from '@/lib/services/server-service/user-service';
import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';

// Add global type declaration for MongoDB client promise in development
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// MongoDB connection for NextAuth adapter
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the value
  // across module reloads caused by HMR (Hot Module Replacement)
  if (!global._mongoClientPromise) {
    client = new MongoClient(process.env.MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise!;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(process.env.MONGODB_URI);
  clientPromise = client.connect();
}

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
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('[NextAuth] Authorizing credentials for:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('[NextAuth] Missing credentials');
          return null;
        }
        
        try {
          // Use the user repository for credential validation
          const user = await validateCredentials(credentials.email, credentials.password);
          
          if (!user) {
            console.log('[NextAuth] Invalid credentials for:', credentials.email);
            return null;
          }

          // const formattedUser = usersRepo.formatUserResponse(user);
          console.log('[NextAuth] User authenticated successfully:', {
            id: user.id,
            email: user.email,
            role: user.role
          });
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error('[NextAuth] Error during authorization:', error);
          return null;
          // return new Response('Invalid credentials', {
          //   status: 401,
          // });
        }
      }
    }),
  ],
  
  adapter: MongoDBAdapter(clientPromise),
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
    pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signin', // Redirect to signin page after logout
  },
  
  callbacks: {
    // Handle redirects after authentication events
    async redirect({ url, baseUrl }) {
      console.log('[NextAuth] Redirect callback - URL:', url, 'BaseURL:', baseUrl);
      
      // // If already authenticated and going to signin, go to dashboard instead
      // if (url.includes('/auth/signin')) {
      //   console.log('[NextAuth] Redirect to signin detected, going to dashboard instead');
      //   return `${baseUrl}/dashboard`;
      // }
      
      // Starts with slash = relative URL from our site
      if (url.startsWith('/')) {
        const fullUrl = `${baseUrl}${url}`;
        console.log('[NextAuth] Relative URL redirect:', fullUrl);
        return fullUrl;
      }
      
      // Same origin = allowed
      if (new URL(url).origin === baseUrl) {
        console.log('[NextAuth] Same origin redirect:', url);
        return url;
      }
      
      // Different origin = redirect to dashboard for security
      console.log('[NextAuth] External origin, redirecting to dashboard');
      return `${baseUrl}/dashboard`;
    },
    
    // Include user role and id in session and token
    async jwt({ token, user, trigger, session }) {
      console.log('[NextAuth] JWT callback - User:', !!user, 'Token ID:', token.id, 'Trigger:', trigger);
      
      // Update token if user object is available (during sign in)
      if (user) {
        token.role = user.role;
        token.id = user.id;
        console.log('[NextAuth] Updated token with user data:', { id: token.id, role: token.role });
      }

      // Handle role updates if using session update
      if (trigger === 'update' && session?.user?.role) {
        token.role = session.user.role;
        console.log('[NextAuth] Updated token role from session update:', token.role);
      }

      return token;
    },
    
    // Make role and id available on the client-side session
    async session({ session, token }) {
      console.log('[NextAuth] Session callback - Token ID:', token.id, 'Session User:', !!session.user);
      
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        console.log('[NextAuth] Enhanced session with:', {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role
        });
      }
      
      return session;
    },
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
