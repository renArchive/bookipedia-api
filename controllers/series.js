import { SerieModel } from "../models/serie.js"

export class SeriesController {
    static async getAll(req, res) {
        const series = await SerieModel.getAll()
        res.header('Access-Control-Allow-Origin', '*') // solve CORS error

        return res.json(series)
    }
}