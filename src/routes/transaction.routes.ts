import { Router } from 'express'
import { validationMiddleware } from '../middlewares/validation.middleware'
import { authMiddleware } from '../middlewares/auth.middleware'
import { TransactionController } from '../controllers/transaction.controller'
import {
  FundUserDTO,
  TransferMoneyDTO,
} from '../validations/transaction.validation'

export function transactionRoutes(
  transactionController: TransactionController,
) {
  const router = Router()

  router.get(
    '/',
    authMiddleware(),
    transactionController.getUserTransactions.bind(transactionController),
  )

  router.post(
    '/fund',
    authMiddleware(),
    validationMiddleware(FundUserDTO),
    transactionController.fundUserBalance.bind(transactionController),
  )

  router.post(
    '/transfer',
    authMiddleware(),
    validationMiddleware(TransferMoneyDTO),
    transactionController.transferMoneyBetweenUsers.bind(transactionController),
  )

  return router
}
