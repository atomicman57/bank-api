import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export class CreateUserDTO {
  @IsNotEmpty()
  firstName: string

  @IsNotEmpty()
  lastName: string

  @IsEmail()
  email: string

  @IsNotEmpty()
  @MinLength(6)
  password: string
}

export class LoginUserDTO {
  @IsEmail()
  email: string

  @IsNotEmpty()
  password: string
}
