import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "./db";
import bcrypt from "bcryptjs";
import { User as UserModel } from "@/models/User";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Initialize admin if none exists
        await connectDB();

        // Find user by email
        const user = await UserModel.findOne({ email: credentials.email }).select("+password");

        if (!user) return null;

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);
        if (isPasswordMatch) {
          return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
        }

        return null;
      },

    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
