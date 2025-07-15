import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import GitHub from "next-auth/providers/github"

export default {
    pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    // signOut: "/auth/signout"
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
    
  },
  providers: [
    Credentials({
  
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            console.log('[NextAuth] Missing credentials');
            return null;
          }
          
          try {
            console.log('LOGIN FROM AUTH.CONFIG');
            // Use API call for credential validation (works in both Edge and Node.js)
            const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/validate-credentials`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(credentials),
            });
            
            if (response.ok) {
              const user = await response.json();
              console.log('[NextAuth] User authenticated successfully:', {
                id: user.id,
                email: user.email,
                role: user.role
              });
              return user;
            }
            
            console.log('[NextAuth] API validation failed');
            return null;
          } catch (error) {
            console.error('[NextAuth] Authorization error:', error);
            return null;
          }
        },
        
      })],
} satisfies NextAuthConfig


