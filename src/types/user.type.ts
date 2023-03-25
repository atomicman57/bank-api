import { User } from '../entities/user.entity'

export interface UserDTO {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface UserWithBalance extends User {
  balance: number
}
