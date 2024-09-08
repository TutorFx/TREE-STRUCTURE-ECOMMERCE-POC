import type { Prisma, PrismaClient, User } from '@prisma/client'
import { UserController } from '../Controllers/UserController'

export class UserRepository {
  constructor(
    private prismaClient: PrismaClient = usePrisma(),
  ) { }

  public async create(data: Prisma.UserCreateInput): Promise<UserController> {
    return new UserController(this, await this.prismaClient.user.create({
      data,
    }))
  };

  public async register(data: Prisma.UserCreateInput): Promise<UserController> {
    return this.create({
      email: data.email,
      password: await HashPassword(data.password),
    })
  };

  public async deleteById(id: User['id']): Promise<User> {
    return await this.prismaClient.user.delete({
      where: {
        id,
      },
    })
  }

  public async findByEmail(email: User['email']): Promise<UserController> {
    const user = await this.prismaClient.user.findUnique({
      where: {
        email,
      },
    })

    if (!user)
      throw new Error('user.404')

    return new UserController(this, user)
  }

  public async findById(id: User['id']): Promise<UserController> {
    const user = await this.prismaClient.user.findUnique({
      where: {
        id,
      },
    })

    if (!user)
      // Cannot find user
      throw new Error('user.404')

    return new UserController(this, user)
  }

  public async updateById(id: User['id'], data: Prisma.UserUpdateInput) {
    const user = await this.prismaClient.user.update({
      where: {
        id,
      },
      data,
    })

    if (!user)
      // Cannot update user
      throw new Error('user.403')

    return new UserController(this, user)
  }
};

export default UserRepository
