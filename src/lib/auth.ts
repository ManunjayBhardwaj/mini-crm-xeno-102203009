import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare, hash } from 'bcryptjs';
import User from '@/models/User';
import { connectDB } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@domain.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        try {
          // Connect to MongoDB
          await connectDB();

          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            // Create new user if doesn't exist
            const hashedPassword = await hash(credentials.password, 10);
            const newUser = await User.create({
              email: credentials.email,
              password: hashedPassword,
              name: credentials.email.split('@')[0], // Use email prefix as name
            });
            return {
              id: newUser._id.toString(),
              email: newUser.email,
              name: newUser.name,
            };
          }

          // Verify password for existing user
          const isPasswordValid = await compare(credentials.password, user.password);
          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('Authentication failed');
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
