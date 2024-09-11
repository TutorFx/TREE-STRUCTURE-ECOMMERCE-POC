import type { User } from '@prisma/client'
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

import UserService from './Services/UserService'
import type { IAccessToken, IAccessTokenJwtPayload, IAuthenticationCookies, ILogin, IRefreshToken, IRefreshTokenJwtPayload, IRegister } from '~/types/schemas/auth'
import { AuthenticationCookiesSchema, LoginSchema, RegisterSchema } from '~/utils/schemas/auth'
import { ZClass } from '~/utils/zod'

export class Validator {
  private _tokens: TokenEntity | null = null

  constructor(private _event: H3Event) {}

  decodeTokens(): IAuthenticationCookies {
    const cookie = getCookie(this._event, 'tokens')

    if (!cookie) {
      throw createError({
        statusCode: 403,
        statusMessage: `error.tokens.403`,
      })
    }

    return JSON.parse(atob(cookie)) as IAuthenticationCookies
  }

  private unpackTokens(): TokenEntity {
    const decoded = this.decodeTokens()

    this._tokens = new TokenEntity(decoded, this._event)
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
  private _validator
  private _userService
  constructor(
    private _event: H3Event,
  ) {
    this._userService = new UserService(this._event)
    this._validator = new Validator(this._event)
  }

  private generateAccessToken(user: User): string {
    const config = useRuntimeConfig(this._event)

    const accessTokenData: IAccessToken = {
      id: user.id,
      email: user.email,
      firstname: user.firstname,
    }

    return jwt.sign(accessTokenData, config.JWT_ACCESS_SECRET, {
      expiresIn: 600,
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

  private generateTokens(user: User): TokenEntity {
    return new TokenEntity({
      refreshToken: this.generateRefreshToken(user),
      accessToken: this.generateAccessToken(user),
    }, this._event)
  }

  async login(data: ILogin) {
    const parsed = LoginSchema.safeParse(data)

    if (!parsed.success) {
      return sendError(
        this._event,
        createError({
          statusCode: 403,
          statusMessage: 'error.user.403',
        }),
      )
    }

    const userInstance = await this._userService.findByEmail(parsed.data.email)

    if (!userInstance) {
      return sendError(
        this._event,
        createError({
          statusCode: 401,
          statusMessage: 'error.user.401',
        }),
      )
    }

    if (!await VerifyPassword(parsed.data.password, userInstance.user.password)) {
      return sendError(
        this._event,
        createError({
          statusCode: 401,
          statusMessage: 'error.user.401',
        }),
      )
    }

    const cookies = this.generateTokens(userInstance.user)

    cookies.packTokens()
  }

  async register(data: IRegister) {
    const parsed = RegisterSchema.safeParse(data)

    if (!parsed.success) {
      return sendError(
        this._event,
        createError({
          statusCode: 403,
          statusMessage: 'error.user.403',
        }),
      )
    }

    const userInstance = await this._userService.register(parsed.data)

    if (!userInstance) {
      return sendError(
        this._event,
        createError({
          statusCode: 401,
          statusMessage: 'error.user.401',
        }),
      )
    }

    const cookies = this.generateTokens(userInstance.user)

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
        return sendError(
          this._event,
          createError({
            statusCode: 401,
            statusMessage: 'error.user.401',
          }),
        )
      }
    }

    try {
      accessToken = this._validator.accessToken() ?? null
    }
    catch (e) {
      if (refreshToken && (e instanceof jwt.TokenExpiredError)) {
        const decodedTokens = this._validator.decodeTokens()
        const userInstance = await this._userService.findById(refreshToken.id)

        if (!userInstance) {
          return sendError(
            this._event,
            createError({
              statusCode: 403,
              statusMessage: 'error.user.403',
            }),
          )
        }

        const controller = new TokenEntity({
          refreshToken: decodedTokens.refreshToken,
          accessToken: this.generateAccessToken(userInstance.user),
        }, this._event)

        controller.packTokens()
        const accessTokenRefreshed = this._validator.accessToken()

        if (accessTokenRefreshed) {
          accessToken = accessTokenRefreshed
        }
      }
    }

    return {
      refreshToken,
      accessToken,
    }
  }
}

export class TokenEntity extends ZClass(AuthenticationCookiesSchema) {
  constructor(data: IAuthenticationCookies, private _event: H3Event) {
    super(data)
  }

  packTokens(): void {
    const cookieData: IAuthenticationCookies = {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    }
    return setCookie(this._event, 'tokens', btoa(JSON.stringify(cookieData)))
  }
}
