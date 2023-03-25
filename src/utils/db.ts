import { createConnection } from 'typeorm'
import { config } from '../config'

export async function connectDatabase() {
  try {
    await createConnection({
      type: 'postgres',
      host: config.db.host,
      port: config.db.port,
      username: config.db.username,
      password: config.db.password,
      database: config.db.database,
      synchronize: true,
      logging: false,
      entities: ['src/entities/**/*.ts'],
    })
    console.log('Database connection established')
  } catch (error) {
    console.error('Error connecting to database', error)
  }
}

export async function connectTestDatabase() {
  try {
    const connection = await createConnection({
      type: 'postgres',
      host: config.test.host,
      port: config.test.port,
      username: config.test.username,
      password: config.test.password,
      database: config.test.database,
      synchronize: true,
      logging: false,
      entities: ['src/entities/**/*.ts'],
    })
    console.log('Database connection established')
    return connection
  } catch (error) {
    console.error('Error connecting to database', error)
  }
}
