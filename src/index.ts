import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { config } from './config'
import { connectDatabase } from './utils/db'
import { UserController } from './controllers/user.controller'
import { TransactionController } from './controllers/transaction.controller'
import { UserService } from './services/user.service'
import { TransactionService } from './services/transaction.service'
import { userRoutes } from './routes/user.routes'
import { transactionRoutes } from './routes/transaction.routes'
;(async () => {
  await connectDatabase()

  const app = express()

  app.use(express.json())

  const userService = new UserService()
  const userController = new UserController(userService)

  const transactionService = new TransactionService()
  const transactionController = new TransactionController(transactionService)

  app.get('/', (req, res) => {
    res.send(
      "Welcome to the Bank API. Please use the '/api/v1' prefix to access the API endpoints.",
    )
  })

  app.use('/api/v1/users', userRoutes(userController))
  app.use('/api/v1/transactions', transactionRoutes(transactionController))

  app.use('*', (req, res) => {
    res
      .status(404)
      .send(
        "The requested resource doesn't exist",
      )
  })

  app.listen(config.server.port, () => {
    console.log(`Server running at port ${config.server.port}`)
  })
})()
