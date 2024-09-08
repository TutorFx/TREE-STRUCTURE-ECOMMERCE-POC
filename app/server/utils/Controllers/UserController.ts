import type { Prisma, User } from '@prisma/client'
import type UserRepository from '../Services/UserService'

export class UserController {
  constructor(
    private _userRepository: UserRepository,
    private _user: User,
  ) { }

  public get repository() {
    return this._userRepository
  }

  public get user() {
    return this._user
  }

  public set user(user: User) {
    Promise.resolve(this.update(user))
  }

  async delete() {
    return await this.repository.deleteById(this.user.id)
  }

  async update(data: Prisma.UserUpdateInput) {
    const userInstance = await this.repository.updateById(this.user.id, data)
    this._user = (userInstance).user
    return this
  }
}
