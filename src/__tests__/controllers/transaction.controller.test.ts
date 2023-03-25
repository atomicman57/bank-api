import { Request, Response } from 'express'
import { TransactionController } from '../../controllers/transaction.controller'
import { TransactionService } from '../../services/transaction.service'
import { BadRequestError, NotFoundError } from '../../utils/errors'
import { Connection } from 'typeorm'
import { connectTestDatabase } from '../../utils/db'
import { FormattedTransaction } from '../../types/transaction.type'
import { TransactionType } from '../../enums/transaction.enum'

describe('TransactionController', () => {
  let connection: Connection
  let transactionService: TransactionService
  let transactionController: TransactionController
  let req: Request
  let res: Response

  beforeAll(async () => {
    connection = await connectTestDatabase()
    transactionService = new TransactionService()
    transactionController = new TransactionController(transactionService)
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  beforeEach(() => {
    transactionService = new TransactionService()
    transactionController = new TransactionController(transactionService)
    req = {
      user: { id: '1' },
      body: {},
      query: {},
    } as any
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any
  })

  describe('fundUserBalance', () => {
    it('should fund user balance and return new balance', async () => {
      req.body.amount = 100

      const fundUserBalanceSpy = jest.spyOn(
        transactionService,
        'fundUserBalance',
      )

      const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        balance: 100,
        password: '',
        email: '',
        sentTransactions: [],
        receivedTransactions: [],
        transactions: [],
      }

      fundUserBalanceSpy.mockResolvedValue(mockUser)

      await transactionController.fundUserBalance(req, res)

      expect(fundUserBalanceSpy).toHaveBeenCalledWith(1, 100)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        balance: mockUser.balance,
        message: 'Funding successful',
      })
    })

    it('should return error if user not found', async () => {
      req.body.amount = 100

      const fundUserBalanceSpy = jest.spyOn(
        transactionService,
        'fundUserBalance',
      )

      fundUserBalanceSpy.mockRejectedValue(new NotFoundError('User not found'))

      await transactionController.fundUserBalance(req, res)

      expect(fundUserBalanceSpy).toHaveBeenCalledWith(1, 100)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' })
    })
  })

  describe('transferMoneyBetweenUsers', () => {
    it('should transfer money between users and return new balances', async () => {
      req.body.recipientId = 2
      req.body.amount = 100

      const transferMoneyBetweenUsersSpy = jest.spyOn(
        transactionService,
        'transferMoneyBetweenUsers',
      )

      const mockSender = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        balance: 0,
        password: '',
        email: '',
        sentTransactions: [],
        receivedTransactions: [],
        transactions: [],
      }

      const mockRecipient = {
        id: 2,
        firstName: 'Jane',
        lastName: 'Doe',
        balance: 100,
        password: '',
        email: '',
        sentTransactions: [],
        receivedTransactions: [],
        transactions: [],
      }

      transferMoneyBetweenUsersSpy.mockResolvedValue({
        sender: mockSender,
        recipient: mockRecipient,
      })

      await transactionController.transferMoneyBetweenUsers(req, res)

      expect(transferMoneyBetweenUsersSpy).toHaveBeenCalledWith(1, 2, 100)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        balance: mockSender.balance,
        message: 'Transfer successful',
      })
    })
    it('should return error if sender and recipient are the same', async () => {
      req.body.recipientId = 1
      req.user.id = 1
      req.body.amount = 100

      const transferMoneyBetweenUsersSpy = jest.spyOn(
        transactionService,
        'transferMoneyBetweenUsers',
      )

      await transactionController.transferMoneyBetweenUsers(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Cannot send money to yourself',
      })
    })

    it('should return error if amount is not greater than zero', async () => {
      req.body.recipientId = 2
      req.body.amount = -100

      const transferMoneyBetweenUsersSpy = jest.spyOn(
        transactionService,
        'transferMoneyBetweenUsers',
      )

      await transactionController.transferMoneyBetweenUsers(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Amount should be greater than zero',
      })
    })

    it('should return error if recipient not found', async () => {
      req.body.recipientId = 2
      req.body.amount = 100

      const transferMoneyBetweenUsersSpy = jest.spyOn(
        transactionService,
        'transferMoneyBetweenUsers',
      )

      transferMoneyBetweenUsersSpy.mockRejectedValue(
        new NotFoundError('Recipient user not found'),
      )

      await transactionController.transferMoneyBetweenUsers(req, res)

      expect(transferMoneyBetweenUsersSpy).toHaveBeenCalledWith(1, 2, 100)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({
        message: 'Recipient user not found',
      })
    })

    it('should return error if sender has insufficient balance', async () => {
      req.body.recipientId = 2
      req.body.amount = 100

      const transferMoneyBetweenUsersSpy = jest.spyOn(
        transactionService,
        'transferMoneyBetweenUsers',
      )

      transferMoneyBetweenUsersSpy.mockRejectedValue(
        new BadRequestError('Insufficient balance'),
      )

      await transactionController.transferMoneyBetweenUsers(req, res)

      expect(transferMoneyBetweenUsersSpy).toHaveBeenCalledWith(1, 2, 100)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient balance' })
    })
  })

  describe('getUserTransactions', () => {
    it('should return user transactions', async () => {
      const getUserTransactionsSpy = jest.spyOn(
        transactionService,
        'getUserTransactions',
      )

      const transactions: FormattedTransaction[] = [
        {
          id: 1,
          amount: 100,
          type: TransactionType.TRANSFER,
          sender: {
            id: 2,
            firstName: 'John',
            lastName: 'Doe',
          },
          recipient: {
            id: 1,
            firstName: 'Jane',
            lastName: 'Doe',
          },
          transactionAction: TransactionType.CREDIT,
          createdAt: new Date('2022-01-01'),
        },
      ]
      const expectedResponse = {
        transactions,
        total: 1,
        totalPages: 1,
        currentPage: 1,
      }

      getUserTransactionsSpy.mockResolvedValue(expectedResponse)

      await transactionController.getUserTransactions(
        req as Request,
        res as Response,
      )

      expect(getUserTransactionsSpy).toHaveBeenCalledWith(1, 1, 10)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(expectedResponse)
    })

    it('should return 404 if user not found', async () => {
      const getUserTransactionsSpy = jest.spyOn(
        transactionService,
        'getUserTransactions',
      )

      getUserTransactionsSpy.mockRejectedValue(
        new NotFoundError('User not found'),
      )

      await transactionController.getUserTransactions(
        req as Request,
        res as Response,
      )

      expect(getUserTransactionsSpy).toHaveBeenCalledWith(1, 1, 10)
      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' })
    })
  })
})
