import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { User } from './user.entity'
import { DecimalTransformer } from '../transformers/decimal.transformer'
import { Transform } from 'class-transformer'
import { TransactionType } from '../enums/transaction.enum'

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 2,
    default: 0.0,
    transformer: new DecimalTransformer(),
  })
  @Transform((value) => parseFloat(value.value))
  amount: number

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType

  @ManyToOne(() => User, (user) => user.sentTransactions, { nullable: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User

  @ManyToOne(() => User, (user) => user.receivedTransactions)
  @JoinColumn({ name: 'recipient_id' })
  recipient: User

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
