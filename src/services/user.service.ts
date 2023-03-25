import { getRepository, getManager } from 'typeorm'
import { User } from '../entities/user.entity'
import { UserDTO } from '../types/user.type'
import { BadRequestError, NotFoundError } from '../utils/errors'
import { sign } from 'jsonwebtoken'
import { config } from '../config'
import { hash, compare } from 'bcrypt'

export class UserService {
  private userRepository = getRepository(User)

  async signup(userDTO: UserDTO) {
    const { email, password, firstName, lastName } = userDTO
    const existingUser = await this.userRepository.findOne({ where: { email } })
    if (existingUser) {
      throw new BadRequestError('Email already in use')
    }

    const hashedPassword = await hash(password, 10)

    const user = this.userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    })

    await this.userRepository.save(user)
    const token = this.generateToken(user.id)
    return { token, user }
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    })

    if (!user) {
      throw new BadRequestError('User does not exist')
    }

    const validPassword = await compare(password, user.password)

    if (!validPassword) {
      throw new BadRequestError('Invalid password')
    }
    const token = this.generateToken(user.id)
    return { user, token }
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    })
    if (!user) {
      throw new NotFoundError('User not found')
    }
    return user
  }

  generateToken(userId: number) {
    return sign({ userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    })
  }
}
