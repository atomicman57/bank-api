import { connectTestDatabase } from '../../utils/db'
import { Connection, Repository } from 'typeorm'
import { TransactionService } from '../../services/transaction.service'
import { User } from '../../entities/user.entity'
import { BadRequestError, NotFoundError } from '../../utils/errors'

describe('TransactionService', () => {
  let connection: Connection
  let userRepository: Repository<User>
  let transactionService: TransactionService

  beforeAll(async () => {
    connection = await connectTestDatabase()
    userRepository = connection.getRepository(User)
    transactionService = new TransactionService()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  // Helper function to create a user
  async function createUser(
    firstName: string,
    lastName: string,
    balance: number,
    email: string,
    password: string,
  ): Promise<User> {
    const user = userRepository.create({
      firstName,
      lastName,
      balance,
      email,
      password,
    })
    await userRepository.save(user)
    return user
  }

  describe('fundUserBalance', () => {
    it('should fund the user balance', async () => {
      const user = await createUser(
        'John',
        'Doe',
        0,
        'test@gmail.com',
        '123456',
      )
      const initialBalance = user.balance
      const amount = 100

      const updatedUser = await transactionService.fundUserBalance(
        user.id,
        amount,
      )
      expect(updatedUser.balance).toEqual(initialBalance + amount)
    })

    it('should throw a NotFoundError when an invalid user ID is provided', async () => {
      const invalidId = 99999

      await expect(
        transactionService.fundUserBalance(invalidId, 100),
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe('transferMoneyBetweenUsers', () => {
    // Test cases for transferMoneyBetweenUsers
    it('should transfer money between users', async () => {
      const sender = await createUser(
        'Alice',
        'Smith',
        200,
        'test@gmail.com',
        '123456',
      )
      const recipient = await createUser(
        'Bob',
        'Johnson',
        100,
        'test+1@gmail.com',
        '123456',
      )

      const amount = 50
      const initialSenderBalance = sender.balance
      const initialRecipientBalance = recipient.balance

      const result = await transactionService.transferMoneyBetweenUsers(
        sender.id,
        recipient.id,
        amount,
      )

      expect(result.sender.balance).toEqual(initialSenderBalance - amount)
      expect(result.recipient.balance).toEqual(initialRecipientBalance + amount)
    })

    it('should throw BadRequestError if sender and recipient are the same user', async () => {
      const user = await createUser(
        'Charlie',
        'Brown',
        300,
        'test+2@gmail.com',
        '123456',
      )
      const amount = 100

      await expect(
        transactionService.transferMoneyBetweenUsers(user.id, user.id, amount),
      ).rejects.toThrow(BadRequestError)
    })
  })

  describe('getUserTransactions', () => {
    // Test cases for getUserTransactions
    it('should return transactions for a user', async () => {
      const user1 = await createUser(
        'David',
        'Moore',
        500,
        'test+10@gmail.com',
        '123456',
      )
      const user2 = await createUser(
        'Eva',
        'Clark',
        300,
        'test+11@gmail.com',
        '123456',
      )

      await transactionService.transferMoneyBetweenUsers(
        user1.id,
        user2.id,
        200,
      )
      await transactionService.fundUserBalance(user1.id, 150)
      const transactionsResult = await transactionService.getUserTransactions(
        user1.id,
      )

      expect(transactionsResult.transactions.length).toBe(2)
      expect(transactionsResult.total).toBe(2)
    })
  })
  it('should throw NotFoundError if user does not exist', async () => {
    const nonExistentUserId = 9999
    await expect(
      transactionService.getUserTransactions(nonExistentUserId),
    ).rejects.toThrow(NotFoundError)
  })

  it('should return paginated transactions', async () => {
    const user = await createUser(
      'David',
      'Moore',
      500,
      'test+10@gmail.com',
      '123456',
    )

    for (let i = 0; i < 25; i++) {
      await transactionService.fundUserBalance(user.id, 100)
    }

    const transactionsResult = await transactionService.getUserTransactions(
      user.id,
      2,
      10,
    )

    expect(transactionsResult.transactions.length).toBe(10)
    expect(transactionsResult.total).toBe(25)
    expect(transactionsResult.totalPages).toBe(3)
    expect(transactionsResult.currentPage).toBe(2)
  })
})
