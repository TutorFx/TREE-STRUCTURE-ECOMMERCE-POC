import type { User } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

import type { IAccessToken, IAccessTokenJwtPayload, IAuthenticationCookies, ILogin, IRefreshToken, IRefreshTokenJwtPayload } from '~/types/schemas/auth'
import { AuthenticationCookiesSchema, AuthenticationSignSchema, token } from '~/utils/schemas/auth'
import { ZClass } from '~/utils/zod'

declare module 'jsonwebtoken' {
  export interface UserIDJwtPayload extends jwt.JwtPayload {
    userId: string
  }
}

const prisma = new PrismaClient()

export class Validator {
  private _event: H3Event
  private _tokens: AuthenticationCookiesController | null = null

  constructor(event: H3Event) {
    this._event = event
  }

  private unpackTokens(): AuthenticationCookiesController {
    const cookie = getCookie(this._event, 'tokens')

    if (!cookie) {
      throw createError({
        statusCode: 403,
        statusMessage: `error.tokens.403`,
      })
    }

    const decoded = JSON.parse(atob(cookie)) as IAuthenticationCookies
    this._tokens = new AuthenticationCookiesController(decoded, this._event)
    return this._tokens
  }

  accessToken() {
    const config = useRuntimeConfig(this._event)
    const tokens = this.unpackTokens()

    if (!tokens.accessToken) {
      return undefined
    }

    return jwt.verify(tokens.accessToken, config.JWT_ACCESS_SECRET) as IAccessTokenJwtPayload
  }

  refreshToken() {
    const config = useRuntimeConfig(this._event)
    const tokens = this.unpackTokens()
    return jwt.verify(tokens.refreshToken, config.JWT_REFRESH_SECRET) as IRefreshTokenJwtPayload
  }
}

export class Auth {
  private _event: H3Event
  private _validator: Validator

  constructor(event: H3Event) {
    this._event = event
    this._validator = new Validator(event)
  }

  private generateAccessToken(user: User): string {
    const config = useRuntimeConfig(this._event)

    const accessTokenData: IAccessToken = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
    }

    return jwt.sign(accessTokenData, config.JWT_ACCESS_SECRET, {
      expiresIn: 60,
    })
  }

  private generateRefreshToken(user: User): string {
    const config = useRuntimeConfig(this._event)

    const refreshTokenData: IRefreshToken = {
      id: user.id,
    }

    return jwt.sign(refreshTokenData, config.JWT_REFRESH_SECRET, {
      expiresIn: 86400,
    })
  }

  private generateTokens(user: User): AuthenticationCookiesController {
    return new AuthenticationCookiesController({
      refreshToken: this.generateRefreshToken(user),
      accessToken: this.generateAccessToken(user),
    }, this._event)
  }

  async login(data: ILogin) {
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })

    if (!user) {
      return sendError(
        this._event,
        createError({
          statusCode: 401,
          statusMessage: 'error.user.401',
        }),
      )
    }

    if (data.password !== user.password) {
      return sendError(
        this._event,
        createError({
          statusCode: 401,
          statusMessage: 'error.user.401',
        }),
      )
    }

    const cookies = this.generateTokens(user)

    cookies.packTokens()
  }

  async parseTokens() {
    let refreshToken: IRefreshTokenJwtPayload | null = null
    let accessToken: IAccessTokenJwtPayload | null = null

    try {
      refreshToken = this._validator.refreshToken()
    }
    catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        return 'teste'
      }
    }
    finally {
      refreshToken = null
    }

    try {
      accessToken = this._validator.accessToken() ?? null
    }
    catch (e) {
      if (e instanceof jwt.TokenExpiredError) {
        return 'teste'
      }
    }

    return {
      refreshToken,
      accessToken,
    }
  }
}

export class AuthenticationCookiesController extends ZClass(AuthenticationCookiesSchema) {
  private _event: H3Event

  constructor(data: IAuthenticationCookies, event: H3Event) {
    super(data)
    this._event = event
  }

  packTokens(): void {
    const cookieData: IAuthenticationCookies = {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    }
    return setCookie(this._event, 'tokens', btoa(JSON.stringify(cookieData)))
  }
}
