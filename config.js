import mysql from 'mysql2/promise'

const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'bookipedia'
}
export const db_connection = await mysql.createConnection(config)
