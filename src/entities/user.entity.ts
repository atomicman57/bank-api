import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm'
import { Transaction } from './transaction.entity'
import { DecimalTransformer } from '../transformers/decimal.transformer'
import { Transform, Exclude } from 'class-transformer'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  email: string

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 2,
    default: 0.0,
    transformer: new DecimalTransformer(),
  })
  @Transform((value) => parseFloat(value.value))
  balance: number

  @OneToMany(() => Transaction, (transaction) => transaction.sender)
  sentTransactions: Transaction[]

  @OneToMany(() => Transaction, (transaction) => transaction.recipient)
  receivedTransactions: Transaction[]

  get transactions() {
    return [
      ...(this.sentTransactions || []),
      ...(this.receivedTransactions || []),
    ]
  }
}
