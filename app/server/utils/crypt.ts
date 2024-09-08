export function HashPassword(password: string) {
  return Bun.password.hash(password, {
    algorithm: 'argon2id',
    memoryCost: 4,
    timeCost: 3,
  })
}

export function VerifyPassword(password: string, hash: string) {
  return Bun.password.verify(password, hash)
}
