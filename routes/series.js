import { Router } from 'express'
import { SeriesController } from '../controllers/series.js'

export const seriesRouter = Router()

seriesRouter.get('/', SeriesController.getAll)