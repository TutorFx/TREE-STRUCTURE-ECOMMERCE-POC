import { z } from 'zod'

export const email = z.string().email()
export const password = z.string().min(1)
export const token = z.string().regex(/^[\w-]+\.[\w-]+\.[\w-]+$/)

export const LoginSchema = z.object({
  email,
  password,
})

export const RegisterSchema = z.object({
  email,
  password,
  confirmPassord: password,
}).refine(data => data.password === data.confirmPassord, {
  message: 'error.password.mismatch',
  path: ['confirmPassord'],
})

export const AuthenticationSignSchema = z.object({
  id: z.string().cuid(),
  firstname: z.string().nullable(),
  email: z.string().email(),
})

export const AccessTokenSchema = z.object({
  id: z.string().cuid(),
  firstname: z.string().nullable(),
  email: z.string().email(),
})

export const RefreshTokenSchema = z.object({
  id: z.string().cuid(),
})

export const AuthenticationCookiesSchema = z.object({
  refreshToken: token,
  accessToken: token.optional(),
})
