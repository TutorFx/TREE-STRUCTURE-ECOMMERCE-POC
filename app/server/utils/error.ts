export class UserError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly id?: string,
  ) {
    super(`user.${message}`)
  }
}
