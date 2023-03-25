import { Request, Response } from 'express'
import { UserService } from '../services/user.service'
import { UserDTO } from '../types/user.type'
import { classToPlain } from 'class-transformer'

export class UserController {
  constructor(private userService: UserService) {}

  async signup(req: Request, res: Response) {
    try {
      const userDTO: UserDTO = req.body
      const { user, token } = await this.userService.signup(userDTO)
      res.status(201).json({
        user: classToPlain(user),
        token,
      })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      const { user, token } = await this.userService.login(email, password)
      res.json({ user: classToPlain(user), token })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message })
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.user.id)
      const user = await this.userService.getUserById(userId)
      return res.json({ user: classToPlain(user) })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message })
    }
  }

  async getUserBalance(req: Request, res: Response) {
    try {
      const userId = parseInt(req.user.id)
      const user = await this.userService.getUserById(userId)
      return res.json({ balance: user.balance })
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message })
    }
  }
}
