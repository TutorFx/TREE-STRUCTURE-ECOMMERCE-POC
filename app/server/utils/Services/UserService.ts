import type { PrismaClient, User } from '@prisma/client'
import { Prisma } from '@prisma/client'
import type { H3Event } from 'h3'
import { UserController } from '../Controllers/UserController'

export class UserRepository {
  constructor(
    private _event: H3Event,
    private prismaClient: PrismaClient = usePrisma(),
  ) { }

  public async create(data: Prisma.UserCreateInput): Promise<UserController> {
    const userData = await this.prismaClient.user.create({
      data,
    }).catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          //
        }
      }
      throw e
    })
    return new UserController(this, userData)
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
