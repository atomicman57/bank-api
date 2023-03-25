import { UserService } from '../../services/user.service'
import { User } from '../../entities/user.entity'
import { Connection, Repository } from 'typeorm'
import { UserDTO } from '../../types/user.type'
import { BadRequestError, NotFoundError } from '../../utils/errors'
import { hash } from 'bcrypt'
import { connectTestDatabase } from '../../utils/db'

describe('UserService', () => {
  let connection: Connection
  let userRepository: Repository<User>
  let userService: UserService

  beforeAll(async () => {
    connection = await connectTestDatabase()
    userRepository = connection.getRepository(User)
    userService = new UserService()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  beforeEach(async () => {
    await userRepository.delete({})
  })

  describe('signup', () => {
    it('should create a new user and return a token', async () => {
      const userDTO: UserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password',
      }

      const result = await userService.signup(userDTO)

      expect(result.token).toBeDefined()
      expect(result.user).toBeDefined()
      expect(result.user.email).toBe(userDTO.email)
      expect(result.user.firstName).toBe(userDTO.firstName)
      expect(result.user.lastName).toBe(userDTO.lastName)
    })

    it('should throw an error if email already exists', async () => {
      const existingUser = userRepository.create({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: await hash('password', 10),
      })
      await userRepository.save(existingUser)

      const userDTO: UserDTO = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'password',
      }

      await expect(userService.signup(userDTO)).rejects.toThrow(BadRequestError)
    })
  })

  describe('login', () => {
    it('should return a token and user if email and password are valid', async () => {
      const password = 'password'
      const hashedPassword = await hash(password, 10)
      const user = userRepository.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: hashedPassword,
      })
      await userRepository.save(user)

      const result = await userService.login(user.email, password)

      expect(result.token).toBeDefined()
      expect(result.user).toBeDefined()
      expect(result.user.email).toBe(user.email)
      expect(result.user.firstName).toBe(user.firstName)
      expect(result.user.lastName).toBe(user.lastName)
    })

    it('should throw an error if email does not exist', async () => {
      const password = 'password'
      const user = userRepository.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: await hash(password, 10),
      })
      await userRepository.save(user)

      await expect(
        userService.login('jane@example.com', password),
      ).rejects.toThrow(BadRequestError)
    })
  })

  describe('getUserById', () => {
    it('should return a user when a valid user ID is provided', async () => {
      const newUser = new User()
      newUser.firstName = 'John'
      newUser.lastName = 'Doe'
      newUser.email = 'johndoe@example.com'
      newUser.password = 'password'
      await connection.manager.save(newUser)

      const result = await userService.getUserById(newUser.id)
      expect(result).toEqual(newUser)
    })

    it('should throw a NotFoundError when an invalid user ID is provided', async () => {
      const invalidId = 99999

      await expect(userService.getUserById(invalidId)).rejects.toThrow(
        NotFoundError,
      )
    })
  })
})
