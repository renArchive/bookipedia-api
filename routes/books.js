import { Router } from 'express'
import { BookController } from '../controllers/books.js'

export const booksRouter = Router()

booksRouter.get('/', BookController.getAll)
booksRouter.get('/list', BookController.getList)