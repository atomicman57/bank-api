import { getRepository, getManager } from 'typeorm'
import { Transaction } from '../entities/transaction.entity'
import { User } from '../entities/user.entity'
import { TransactionType } from '../enums/transaction.enum'
import { FormattedTransaction } from '../types/transaction.type'
import { BadRequestError, NotFoundError } from '../utils/errors'

export class TransactionService {
  private transactionRepository = getRepository(Transaction)
  private userRepository = getRepository(User)

  async fundUserBalance(userId: number, amount: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundError('User not found')
    }

    await getManager().transaction(async (transactionalEntityManager) => {
      user.balance += amount
      await transactionalEntityManager.save(user)

      const transaction = this.transactionRepository.create({
        amount,
        type: TransactionType.FUND,
        recipient: user,
      })

      await transactionalEntityManager.save(transaction)
    })

    return user
  }

  async transferMoneyBetweenUsers(
    senderId: number,
    recipientId: number,
    amount: number,
  ) {
    if (senderId === recipientId) {
      throw new BadRequestError('Cannot send money to yourself')
    }

    if (amount <= 0) {
      throw new BadRequestError('Amount should be greater than zero')
    }

    const [sender, recipient] = await Promise.all([
      this.userRepository.findOne({ where: { id: senderId } }),
      this.userRepository.findOne({ where: { id: recipientId } }),
    ])

    if (!recipient) {
      throw new NotFoundError('Recipient user not found')
    }

    if (sender.balance < amount) {
      throw new BadRequestError('Insufficient balance')
    }

    await getManager().transaction(async (transactionalEntityManager) => {
      sender.balance -= amount
      recipient.balance += amount

      await transactionalEntityManager.save(sender)
      await transactionalEntityManager.save(recipient)

      const transaction = this.transactionRepository.create({
        amount,
        type: TransactionType.TRANSFER,
        sender,
        recipient,
      })

      await transactionalEntityManager.save(transaction)
    })

    return { sender, recipient }
  }

  async getUserTransactions(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    const skip = (page - 1) * limit

    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        where: [{ sender: user }, { recipient: user }],
        relations: ['sender', 'recipient'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      },
    )

    const formattedTransactions = transactions.map((transaction) => {
      return this.formatTransaction(user, transaction)
    })

    return {
      transactions: formattedTransactions,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    }
  }

  formatTransaction(
    user: User,
    transaction: Transaction,
  ): FormattedTransaction {
    const formattedTransaction = {
      ...transaction,
      sender: {
        id: transaction?.sender?.id,
        firstName: transaction?.sender?.firstName,
        lastName: transaction?.sender?.lastName,
      },
      recipient: {
        id: transaction.recipient.id,
        firstName: transaction.recipient.firstName,
        lastName: transaction.recipient.lastName,
      },
      transactionAction:
        transaction.recipient.id === user.id
          ? TransactionType.CREDIT
          : TransactionType.DEBIT,
    }
    return formattedTransaction
  }
}
