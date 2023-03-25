import { Request, Response } from 'express'
import { TransactionService } from '../services/transaction.service'

export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  fundUserBalance = async (req: Request, res: Response) => {
    const { amount } = req.body
    try {
      const userId = parseInt(req.user.id)
      const user = await this.transactionService.fundUserBalance(userId, amount)
      res
        .status(200)
        .json({ balance: user.balance, message: 'Funding successful' })
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message })
    }
  }

  transferMoneyBetweenUsers = async (req: Request, res: Response) => {
    const { recipientId, amount } = req.body
    try {
      const userId = parseInt(req.user.id)
      const {
        sender,
      } = await this.transactionService.transferMoneyBetweenUsers(
        userId,
        recipientId,
        amount,
      )
      res.status(200).json({
        balance: sender.balance,
        message: 'Transfer successful',
      })
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message })
    }
  }

  getUserTransactions = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.user.id)
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 10
      const transactions = await this.transactionService.getUserTransactions(
        userId,
        page,
        limit,
      )
      res.status(200).json({ ...transactions })
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message })
    }
  }
}
