import { db_connection } from '../config.js'

export class SerieModel {
    static async getAll () {
        const [series] = await db_connection.query(`SELECT * FROM serie ORDER BY name;`)

        return {
            series: series,
        }
    }
}