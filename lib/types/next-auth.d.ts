import { DefaultSession } from "next-auth"
import { User as CustomUser } from "./index"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: 'user' | 'admin'
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: 'user' | 'admin'
  }
}

// Extend the JWT type
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: 'user' | 'admin'
  }
}