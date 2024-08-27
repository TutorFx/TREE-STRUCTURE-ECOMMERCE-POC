export default defineEventHandler(async (event) => {
  const validator = new Auth(event)
  return validator.parseTokens()
})
