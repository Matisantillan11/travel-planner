import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (!account || !profile?.email) return false;

      await prisma.user.upsert({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        update: {
          email: profile.email,
          name: profile.name ?? null,
          image: (profile as { picture?: string }).picture ?? (profile as { avatar_url?: string }).avatar_url ?? null,
        },
        create: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          email: profile.email,
          name: profile.name ?? null,
          image: (profile as { picture?: string }).picture ?? (profile as { avatar_url?: string }).avatar_url ?? null,
        },
      });

      return true;
    },
    async jwt({ token, account, profile }) {
      if (account && profile?.email) {
        const user = await prisma.user.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          select: { id: true },
        });
        if (user) {
          token.userId = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
