import { Request, Response, NextFunction } from 'express'
import { verify } from 'jsonwebtoken'
import { getRepository } from 'typeorm'
import { User } from '../entities/user.entity'
import { UnauthorizedError } from '../utils/errors'
import { config } from '../config'

interface DecodedToken {
  userId: number
  iat: number
  exp: number
}

export const authMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1]

      if (!token) {
        throw new UnauthorizedError('No token provided')
      }
      const decoded = verify(token, config.jwt.secret) as DecodedToken

      const userRepository = getRepository(User)
      const user = await userRepository.findOne({
        where: { id: decoded.userId },
      })

      if (!user) {
        throw new UnauthorizedError('User not found')
      }

      req.user = user

      next()
    } catch (error) {
      return res.status(error.status || 500).json({ message: error.message })
    }
  }
}
