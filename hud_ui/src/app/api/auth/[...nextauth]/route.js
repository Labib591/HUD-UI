import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import User from "../../../../../models/User"
import bcrypt from "bcrypt"
import dbConnect from "../../../../../lib/mongoose"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await dbConnect()
          
          const user = await User.findOne({ email: credentials.email })
          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            return null
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await dbConnect()
          
          const existingUser = await User.findOne({ email: user.email })
          
          if (!existingUser) {
            // Create new user
            await User.create({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
              providerAccountId: account.providerAccountId,
            })
          } else if (existingUser.provider !== "google") {
            // Update existing user with Google provider info
            existingUser.provider = "google"
            existingUser.providerAccountId = account.providerAccountId
            existingUser.image = user.image
            await existingUser.save()
          }
          
          return true
        } catch (error) {
          console.error("Google sign-in error:", error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    }
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
