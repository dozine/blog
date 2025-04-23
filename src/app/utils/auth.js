import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import prisma from "./connect";
import { getServerSession } from "next-auth";

const ADMIN_EMAIL = process.env.MYEMAIL;

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  // javascript와 typescript연결 방식이 다름 .
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user?.email === ADMIN_EMAIL) {
        return true; // 로그인 허용
      } else {
        return false; // 로그인 거부
      }
    },
    async session({ session }) {
      if (session?.user?.email === ADMIN_EMAIL) {
        return session;
      } else {
        return null; // 세션 제거
      }
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);
