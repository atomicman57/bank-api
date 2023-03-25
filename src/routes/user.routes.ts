import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { validationMiddleware } from '../middlewares/validation.middleware'
import { authMiddleware } from '../middlewares/auth.middleware'
import { CreateUserDTO, LoginUserDTO } from '../validations/user.validation'

export function userRoutes(userController: UserController) {
  const router = Router()

  router.post(
    '/signup',
    validationMiddleware(CreateUserDTO),
    userController.signup.bind(userController),
  )
  router.post(
    '/login',
    validationMiddleware(LoginUserDTO),
    userController.login.bind(userController),
  )
  router.get(
    '/currentUser',
    authMiddleware(),
    userController.getCurrentUser.bind(userController),
  )

  router.get(
    '/balance',
    authMiddleware(),
    userController.getUserBalance.bind(userController),
  )

  return router
}
