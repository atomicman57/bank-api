import { TransactionType } from '../enums/transaction.enum'

type TransactionUser = {
  id: number
  firstName: string
  lastName: string
}

export interface FormattedTransaction {
  id: number
  amount: number
  sender: TransactionUser
  recipient: TransactionUser
  type: TransactionType
  transactionAction: TransactionType
  createdAt: Date
}
