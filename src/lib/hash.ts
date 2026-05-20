import { pbkdf2Sync, randomBytes } from 'crypto'

/**
 * Hash a password using PBKDF2 with a random salt.
 * @param password Plaintext password to hash
 * @returns Secure string formatted as salt:hash
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

/**
 * Verify a plaintext password against a stored hashed password.
 * @param password Plaintext password to verify
 * @param storedValue Secure string stored as salt:hash
 * @returns boolean indicating if the password is correct
 */
export function verifyPassword(password: string, storedValue: string): boolean {
  if (!storedValue) return false
  const parts = storedValue.split(':')
  if (parts.length !== 2) return false
  
  const [salt, originalHash] = parts
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return hash === originalHash
}
