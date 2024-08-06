import { db_connection } from '../config.js'

export class AuthorModel {
    static async getAll () {
        const [authors] = await db_connection.query(`SELECT * FROM author ORDER BY name;`)

        return {
            authors: authors,
        }
    }
}