import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"

// Your own logic for dealing with plaintext password strings; be careful!

import { signInSchema } from "./schema/authSchema"
import prisma from "./lib/db"
import { getUserFromDb, saltAndHashPassword } from "./lib/utils"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            credentials: {
                email: {},
                password: {},
            },
            authorize: async (credentials) => {
                let user = null

                const { email, password } = await signInSchema.parseAsync(credentials)

                // logic to salt and hash password
                // const pwHash = saltAndHashPassword(password)

                // logic to verify if the user exists
                // user = await getUserFromDb(email, pwHash)
                //user = await getUserFromDb(email, password)

                if (!user) {
                    // No user found, so this is their first attempt to login
                    // Optionally, this is also the place you could do a user registration
                    throw new Error("Invalid credentials.")
                }

                // return user object with their profile data
                return user
            },
        }),
    ],
})