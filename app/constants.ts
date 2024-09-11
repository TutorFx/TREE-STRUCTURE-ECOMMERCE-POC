const ERROR_USER_401 = 'error.user.401'
const ERROR_USER_403 = 'error.user.403'
const ERROR_USER_404 = 'error.user.404'

const ERROR_LOGIN_400 = 'error.login.400'
const ERROR_TOKENS_403 = 'error.tokens.403'

export const ERRORS = {
  USER_401: ERROR_USER_401,
  USER_403: ERROR_USER_403,
  USER_404: ERROR_USER_404,

  LOGIN_400: ERROR_LOGIN_400,

  TOKENS_403: ERROR_TOKENS_403,
} as const
