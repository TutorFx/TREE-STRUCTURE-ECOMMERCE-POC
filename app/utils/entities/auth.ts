import { AuthenticationCookiesSchema } from '../schemas/auth'
import type { IAuthenticationCookies } from '~/types/schemas/auth'

export class AuthenticationCookies extends ZClass(AuthenticationCookiesSchema) {
  constructor(data: IAuthenticationCookies) {
    super(data)
  }
}
