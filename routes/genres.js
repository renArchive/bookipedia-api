import { Router } from 'express'
import { GenresController } from '../controllers/genres.js'

export const genresRouter = Router()

genresRouter.get('/', GenresController.getAll)