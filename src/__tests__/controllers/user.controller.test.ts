import { UserController } from '../../controllers/user.controller'
import { UserService } from '../../services/user.service'
import { Request, Response } from 'express'
import { Connection, createConnection } from 'typeorm'
import { connectTestDatabase } from '../../utils/db'

describe('UserController tests', () => {
  let connection: Connection
  let userController: UserController
  let userService: UserService

  beforeAll(async () => {
    connection = await connectTestDatabase()
    userService = new UserService()
    userController = new UserController(userService)
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should create a new user and return a token on successful signup', async () => {
    const mockRequest = ({
      body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      },
    } as unknown) as Request

    const mockResponse = ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown) as Response

    await userController.signup(mockRequest, mockResponse)

    expect(mockResponse.status).toHaveBeenCalledWith(201)
    expect(mockResponse.json).toHaveBeenCalled()
    // Check if the response has the expected shape
    const expectedResponse = expect.objectContaining({
      user: expect.objectContaining({
        email: 'john.doe@example.com',
      }),
      token: expect.any(String),
    })

    expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse)
  })

  it('should successfully login an existing user', async () => {
    const user = await userService.signup({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      password: 'password123',
    })

    const mockRequest = ({
      body: {
        email: 'jane.doe@example.com',
        password: 'password123',
      },
    } as unknown) as Request

    const mockResponse = ({
      json: jest.fn(),
    } as unknown) as Response

    await userController.login(mockRequest, mockResponse)

    expect(mockResponse.json).toHaveBeenCalled()

    const expectedResponse = expect.objectContaining({
      user: expect.objectContaining({
        email: 'jane.doe@example.com',
      }),
      token: expect.any(String),
    })

    expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse)
  })

  it('should return the current user', async () => {
    const { user, token } = await userService.signup({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      password: 'password123',
    })

    const mockRequest = ({
      user: { id: user.id },
    } as unknown) as Request

    const mockResponse = ({
      json: jest.fn(),
    } as unknown) as Response

    await userController.getCurrentUser(mockRequest, mockResponse)

    expect(mockResponse.json).toHaveBeenCalled()

    const expectedResponse = expect.objectContaining({
      user: expect.objectContaining({
        email: 'alice.smith@example.com',
      }),
    })

    expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse)
  })

  it('should return the user balance', async () => {
    const { user, token } = await userService.signup({
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob.johnson@example.com',
      password: 'password123',
    })

    const mockRequest = ({
      user: { id: user.id },
    } as unknown) as Request
    const mockResponse = ({
      json: jest.fn(),
    } as unknown) as Response

    await userController.getUserBalance(mockRequest, mockResponse)

    expect(mockResponse.json).toHaveBeenCalled()

    const expectedResponse = expect.objectContaining({
      balance: user.balance,
    })

    expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse)
  })

  it('should throw an error when trying to login with an incorrect password', async () => {
    const user = await userService.signup({
      firstName: 'Carol',
      lastName: 'Williams',
      email: 'carol.williams@example.com',
      password: 'password123',
    })
    const mockRequest = ({
      body: {
        email: 'carol.williams@example.com',
        password: 'wrongpassword',
      },
    } as unknown) as Request

    const mockResponse = ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown) as Response

    await userController.login(mockRequest, mockResponse)

    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(mockResponse.json).toHaveBeenCalled()

    const expectedResponse = expect.objectContaining({
      message: 'Invalid password',
    })

    expect(mockResponse.json).toHaveBeenCalledWith(expectedResponse)
  })
})
