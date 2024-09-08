import type { Prisma, User } from '@prisma/client'
import { z } from 'zod'

export const email = z.string().email()
export const password = z.string().min(1)
export const token = z.string().regex(/^[\w-]+\.[\w-]+\.[\w-]+$/)

export const LoginSchema = z.object({
  email,
  password,
}).strict()

export const RegisterSchema = z.object({
  email,
  password,
  confirmPassword: password,
}).strict().refine(data => data.password === data.confirmPassword, {
  message: 'error.password.mismatch',
  path: ['confirmPassord'],
}) satisfies z.ZodSchema<Prisma.UserCreateInput>

export const AuthenticationSignSchema = z.object({
  id: z.string().cuid(),
  firstname: z.string().nullable(),
  email: z.string().email(),
}) satisfies z.ZodSchema<Omit<Prisma.UserCreateInput, 'password'>>

export const AccessTokenSchema = z.object({
  id: z.string().cuid(),
  firstname: z.string().nullable(),
  email: z.string().email(),
}) satisfies z.ZodSchema<Omit<Prisma.UserCreateInput, 'password'>>

export const RefreshTokenSchema = z.object({
  id: z.string().cuid(),
})

export const AuthenticationCookiesSchema = z.object({
  refreshToken: token,
  accessToken: token.optional(),
})
