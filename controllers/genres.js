import { GenreModel } from '../models/genre.js'

export class GenresController {
    static async getAll(req, res) {
        const bookGenres = await GenreModel.getAll()
        res.header('Access-Control-Allow-Origin', '*') // solve CORS error

        return res.json(bookGenres)
    }
}