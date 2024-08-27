import { LoginSchema } from '~/utils/schemas/auth'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, LoginSchema.safeParse)

  if (body.success === false) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'error.login.400',
      }),
    )
  }

  const auth = new Auth(event)

  await auth.login(body.data)

  return null
})
