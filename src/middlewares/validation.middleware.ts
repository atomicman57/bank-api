import { Request, Response, NextFunction } from 'express'
import { validateOrReject, ValidationError } from 'class-validator'
import { plainToClass } from 'class-transformer'

export const validationMiddleware = (validationClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToClass(validationClass, req.body)
      await validateOrReject(dto)
      req.body = dto
      next()
    } catch (errors) {
      const message = errors
        .map((error: ValidationError) => Object.values(error.constraints))
        .join(', ')
      res.status(400).json({ message })
    }
  }
}
