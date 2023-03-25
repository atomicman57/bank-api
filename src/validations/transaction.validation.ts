import { IsNotEmpty, IsPositive, Max, Min } from 'class-validator'

export class FundUserDTO {
  @IsNotEmpty()
  @IsPositive()
  @Min(10, {
    message: 'You cannot fund less than 10',
  })
  @Max(5000000, {
    message: 'You cannot fund more than 5,000,000 at a time',
  })
  amount: number
}

export class TransferMoneyDTO {
  @IsNotEmpty()
  @IsPositive()
  @Min(10, {
    message: 'You cannot transfer less than 10',
  })
  @Max(5000000, {
    message: 'You cannot transfer more than 5,000,000 at a time',
  })
  amount: number

  @IsNotEmpty()
  recipientId: number
}
