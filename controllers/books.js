import { BookModel } from '../models/book.js'

export class BookController {
    static async getAll(req, res) {
        const { author, series, page, searchBy } = req.query
        let books = [];

        const genres = JSON.parse(req.query.genres)
        const sortBy = JSON.parse(req.query.sortBy)
        books = await BookModel.getAll({ author, series, genres, sortBy, page })

        res.header('Access-Control-Allow-Origin', '*') // solve CORS error

        return res.json(books)
    }

    static async getList(req, res) {
        const books = await BookModel.getList()

        res.header('Access-Control-Allow-Origin', '*') // solve CORS error

        return res.json(books)
    }
}