import type { z } from 'zod'
import type jwt from 'jsonwebtoken'
import type * as auth from '@/utils/schemas/auth.ts'

export type ILogin = z.infer<typeof auth.LoginSchema>
export type IRegister = z.infer<typeof auth.RegisterSchema>
export type IAuthenticationCookies = z.infer<typeof auth.AuthenticationCookiesSchema>
export type IAccessToken = z.infer<typeof auth.AccessTokenSchema>
export type IRefreshToken = z.infer<typeof auth.RefreshTokenSchema>

export type IRefreshTokenJwtPayload = jwt.JwtPayload & IRefreshToken
export type IAccessTokenJwtPayload = jwt.JwtPayload & IAccessToken
