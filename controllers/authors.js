import { AuthorModel } from "../models/author.js"

export class AuthorsController {
    static async getAll(req, res) {
        const authors = await AuthorModel.getAll()
        res.header('Access-Control-Allow-Origin', '*') // solve CORS error

        return res.json(authors)
    }
}