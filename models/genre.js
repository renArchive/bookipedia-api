import { db_connection } from '../config.js'

export class GenreModel {
    static async getAll () {
        const [genres] = await db_connection.query(`SELECT * FROM genre ORDER BY name;`)

        return {
            genres: genres,
        }
    }
}