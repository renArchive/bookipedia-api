import { db_connection } from "../config.js"

const PAGE_LIMIT = 12

export class BookModel {
    static async getAll ({ author, series, genres, sortBy, page }) {
        let booksData = [];
        let booksTotal = 0;
        let bookGenresData = [];

        if (author !== 'All' && series !== 'All') {
            const [bookGenres] = await db_connection.query(
                `SELECT DISTINCT g.id, g.name FROM genre as g
                INNER JOIN book_genre as bg ON bg.genre_id = g.id
                LEFT JOIN book as b ON bg.book_id = b.id
                WHERE b.author_id = ? AND b.serie_id = ?;`,
                [author, series]
            )
            
            booksData = await handleSortTypesWithAuthorAndSeries(author, series, sortBy, page)
            bookGenresData = bookGenres
        } else if (author !== 'All') {            
            const [bookGenres] = await db_connection.query(
                `SELECT DISTINCT g.id, g.name FROM genre as g
                INNER JOIN book_genre as bg ON bg.genre_id = g.id
                LEFT JOIN book as b ON bg.book_id = b.id
                WHERE b.author_id = ?;`,
                [author])

            const [total] = await db_connection.query(
                `SELECT COUNT(*) as total FROM book
                WHERE author_id = ?;`,
                [author])
            
            booksData = await handleSortTypesWithAuthor(author, sortBy, page)
            bookGenresData = bookGenres
            booksTotal = total[0].total
        } else if (series !== 'All') {
            const [bookGenres] = await db_connection.query(
                `SELECT DISTINCT g.id, g.name FROM genre as g
                INNER JOIN book_genre as bg ON bg.genre_id = g.id
                LEFT JOIN book as b ON bg.book_id = b.id
                WHERE b.serie_id = ?;`,
                [series]
            )
            booksData = await handleSortTypesWithSeries(series, sortBy, page)
            bookGenresData = bookGenres
        } else {
            const [bookGenres] = await db_connection.query(
                `SELECT DISTINCT g.id, g.name FROM genre as g
                INNER JOIN book_genre as bg ON bg.genre_id = g.id
                LEFT JOIN book as b ON bg.book_id = b.id
                WHERE bg.genre_id IN (?);`,
                [genres]
            )

            const [total] = await db_connection.query(
                `SELECT COUNT(DISTINCT b.id) as total FROM book as b
                INNER JOIN book_genre as bg ON bg.book_id = b.id
                WHERE bg.genre_id IN (?)`,
                [genres]
            )
            
            booksData = await handleSortTypesWithGenres(genres, sortBy, page)
            bookGenresData = bookGenres
            booksTotal = total[0].total
        }

        return {
            books: booksData,
            bookGenres: bookGenresData,
            total: booksTotal,
        }
    }

    static async getList() {
        const [book] = await db_connection.query(`SELECT BIN_TO_UUID(id) id, title, cover FROM book ORDER BY title;`)

        return {
            book: book
        }
    }

    static async getByName ({searchBy}) {
        const name = `%${searchBy}%`

        const [book] = await db_connection.query(
            `SELECT BIN_TO_UUID(id) id, title, cover FROM book 
            WHERE UPPER(title) LIKE UPPER(?)
            ORDER BY title;`,
            [name])

        return {
            book: book
        }
    }
}

async function handleSortTypesWithGenres (genres, sortBy, page) {
    const skip = (page - 1 ) * PAGE_LIMIT
    const orderBy = sortBy[0] === 'title' ? 'title' : 'rate'
    const orderDirection = sortBy[1] === 'asc' ? 'ASC' : 'DESC'

    const query = `SELECT DISTINCT BIN_TO_UUID(b.id) id, b.cover, b.rate, b.serie_id, b.title FROM book as b
                INNER JOIN book_genre as bg ON bg.book_id = b.id
                WHERE bg.genre_id IN (${genres})
                ORDER BY b.${orderBy} ${orderDirection}
                LIMIT ${PAGE_LIMIT}
                OFFSET ${skip};`
    const [book] = await db_connection.query(query)

    return book
}

async function handleSortTypesWithSeries (series, sortBy, page) {
    const skip = (page - 1 ) * PAGE_LIMIT

    const orderBy = sortBy[0] === 'order' ? 'series_num' : (sortBy[0] === 'title' ? 'title' : 'rate')
    const orderDirection = sortBy[1] === 'asc' ? 'ASC' : 'DESC'

    const query = `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book
            WHERE serie_id = ${series}
            ORDER BY ${orderBy} ${orderDirection}
            LIMIT ${PAGE_LIMIT}
            OFFSET ${skip};`
    const [book] = await db_connection.query(query)

    return book
}

async function handleSortTypesWithAuthor (author, sortBy, page) {
    const skip = (page - 1 ) * PAGE_LIMIT
    const orderBy = sortBy[0] === 'title' ? 'title' : 'rate'
    const orderDirection = sortBy[1] === 'asc' ? 'ASC' : 'DESC'

    const query = `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book
            WHERE author_id = ${author}
            ORDER BY ${orderBy} ${orderDirection}
            LIMIT ${PAGE_LIMIT}
            OFFSET ${skip};`
    const [book] = await db_connection.query(query)

    return book
}

async function handleSortTypesWithAuthorAndSeries (author, series, sortBy, page) {
    const skip = (page - 1 ) * PAGE_LIMIT
    const orderBy = sortBy[0] === 'order' ? 'series_num' : (sortBy[0] === 'title' ? 'title' : 'rate')
    const orderDirection = sortBy[1] === 'asc' ? 'ASC' : 'DESC'

    const query = `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book 
                WHERE author_id = ${author} AND serie_id = ${series}
                ORDER BY ${orderBy} ${orderDirection}
                LIMIT ${PAGE_LIMIT}
                OFFSET ${skip};`
    const [book] = await db_connection.query(query)

    return book
}
