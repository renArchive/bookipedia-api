import { Router } from 'express'
import { AuthorsController } from '../controllers/authors.js'

export const authorsRouter = Router()

authorsRouter.get('/', AuthorsController.getAll)