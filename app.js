import express, { json } from 'express'
import { booksRouter } from './routes/books.js'
import { genresRouter } from './routes/genres.js'
import { seriesRouter } from './routes/series.js'
import { authorsRouter } from './routes/authors.js'

const app = express()
app.use(json())
app.disable('x-powered-by')


app.use('/books', booksRouter)
app.use('/genres', genresRouter)
app.use('/authors', authorsRouter)
app.use('/series', seriesRouter)

const PORT = 3002
app.listen(PORT, () => {
    console.log('Server listening on port http://localhost:', PORT)
})