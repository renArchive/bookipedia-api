import { BookModel } from '../models/book.js'

export class BookController {
    static async getAll(req, res) {
        const { author, series, page } = req.query
        const genres = JSON.parse(req.query.genres)
        const sortBy = JSON.parse(req.query.sortBy)
        const books = await BookModel.getAll({ author, series, genres, sortBy, page })
        res.header('Access-Control-Allow-Origin', '*') // solve CORS error

        return res.json(books)
    }
}