export default defineEventHandler(async () => {
  const prisma = usePrisma()
  const users = await prisma.user.findMany()
  const teste = import.meta.dev
  return { success: true, users, teste }
})
