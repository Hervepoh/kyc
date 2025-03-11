import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import bcrypt from "bcryptjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import prisma from "./db";


/**
 * Hash a password using bcrypt.
 * @param password - The plaintext password to hash.
 * @returns The hashed password.
 */
export const saltAndHashPassword = (password: string): string => {
  const salt = bcrypt.genSaltSync(10); // Generate a salt with 10 rounds
  return bcrypt.hashSync(password, salt); // Hash the password with the salt
};

/**
 * Fetch a user from the database by email and verify the password.
 * @param email - The user's email.
 * @param password - The plaintext password to verify.
 * @returns The user object if the credentials are valid, otherwise null.
 */
export const getUserFromDb = async (email: string, password: string) => {
  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      password: true, // Include the password field
    },
  });

  if (!user) {
    return null; // User not found
  }

  // Compare the provided password with the hashed password in the database
  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    return null; // Password is invalid
  }

  // Return the user object without the password for security
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};