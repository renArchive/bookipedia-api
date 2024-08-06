import { db_connection } from "../config.js"

const PAGE_LIMIT = 12

export class BookModel {
    static async getAll ({ author, series, genres, sortBy, page }) {
        let booksData = [];
        let booksTotal = 0;
        let bookGenresData = [];

        if (author !== 'All' && series !== 'All') {
            const [seriesData] = await db_connection.query(
                `SELECT DISTINCT s.id, s.name FROM author as a
                INNER JOIN book as b ON a.id = b.author_id
                LEFT JOIN serie as s ON b.serie_id = s.id
                WHERE b.author_id = ?;`,
                [author]
            )
            const [bookGenres] = await db_connection.query(
                `SELECT DISTINCT g.id, g.name FROM genre as g
                INNER JOIN book_genre as bg ON bg.genre_id = g.id
                LEFT JOIN book as b ON bg.book_id = b.id
                WHERE b.author_id = ? AND b.serie_id = ?;`,
                [author, series]
            )
            
            booksData = await handleSortTypesWithAuthorAndSeries(author, series, sortBy)
            bookGenresData = bookGenres
            bookSeriesData = seriesData
        } else if (author !== 'All') {            
            const [seriesData] = await db_connection.query(
                `SELECT DISTINCT s.id, s.name FROM author as a
                INNER JOIN book as b ON a.id = b.author_id
                LEFT JOIN serie as s ON b.serie_id = s.id
                WHERE b.author_id = ?;`,
                [author]
            )

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
            
            booksData = await handleSortTypesWithAuthor(author, sortBy)
            bookGenresData = bookGenres
            bookSeriesData = seriesData
            booksTotal = total[0].total
        } else if (series !== 'All') {
            const [bookGenres] = await db_connection.query(
                `SELECT DISTINCT g.id, g.name FROM genre as g
                INNER JOIN book_genre as bg ON bg.genre_id = g.id
                LEFT JOIN book as b ON bg.book_id = b.id
                WHERE b.serie_id = ?;`,
                [series]
            )
            booksData = await handleSortTypesWithSeries(series, sortBy)
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
}

async function handleSortTypesWithGenres (genres, sortBy, page) {
    if (sortBy[0] === 'title') {
        const skip = (page - 1 ) * PAGE_LIMIT
        const [book] = sortBy[1] === 'asc'
            ? await db_connection.query(
                `SELECT DISTINCT BIN_TO_UUID(b.id) id, b.cover, b.rate, b.serie_id, b.title FROM book as b
                INNER JOIN book_genre as bg ON bg.book_id = b.id
                WHERE bg.genre_id IN (?)
                ORDER BY b.title
                LIMIT ?
                OFFSET ?;`,
                [genres, PAGE_LIMIT, skip])
            : await db_connection.query(
                `SELECT DISTINCT BIN_TO_UUID(b.id) id, b.cover, b.rate, b.serie_id, b.title FROM book as b
                INNER JOIN book_genre as bg ON bg.book_id = b.id
                WHERE bg.genre_id IN (?)
                ORDER BY b.title DESC
                LIMIT ?
                OFFSET ?;`,
                [genres, PAGE_LIMIT, skip])

        return book
    } else {
        const [book] = sortBy[1] === 'asc'
            ? await db_connection.query(
                `SELECT DISTINCT BIN_TO_UUID(b.id) id, b.cover, b.rate, b.serie_id, b.title FROM book as b
                INNER JOIN book_genre as bg ON bg.book_id = b.id
                WHERE bg.genre_id IN (?)
                ORDER BY b.rate
                LIMIT ?
                OFFSET ?;`,
                [genres, PAGE_LIMIT, skip])
            : await db_connection.query(
                `SELECT DISTINCT BIN_TO_UUID(b.id) id, b.cover, b.rate, b.serie_id, b.title FROM book as b
                INNER JOIN book_genre as bg ON bg.book_id = b.id
                WHERE bg.genre_id IN (?)
                ORDER BY b.rate DESC
                LIMIT ?
                OFFSET ?;`,
                [genres, PAGE_LIMIT, skip])

        return book
    }
}

async function handleSortTypesWithSeries (series, sortBy) {
    if (sortBy[0] === 'title') {
        const [book] = sortBy[1] === 'asc'
            ? await db_connection.query(
                `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book
                WHERE serie_id = ?
                ORDER BY title;`,
                [series])
            : await db_connection.query(
                `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book
                WHERE serie_id = ?
                ORDER BY title DESC;`,
                [series])
        
        return book
    }  if (sortBy[0] === 'order') {
        const [book] = sortBy[1] === 'asc'
            ? await db_connection.query(
                `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book
                WHERE serie_id = ?
                ORDER BY series_num;`,
                [series])
            : await db_connection.query(
                `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book
                WHERE serie_id = ?
                ORDER BY series_num DESC;`,
                [series])
        
        return book
    } else {
        const [book] = sortBy[1] === 'asc'
            ? await db_connection.query(
                `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book
                WHERE serie_id = ?
                ORDER BY rate;`,
                [series])
            : await db_connection.query(
                `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book
                WHERE serie_id = ?
                ORDER BY rate DESC;`,
                [series])

        return book
    }
}

async function handleSortTypesWithAuthor (author, sortBy) {
    if (sortBy[0] === 'title') {
        const [book] = sortBy[1] === 'asc'
        ? await db_connection.query(
            `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book
            WHERE author_id = ?
            ORDER BY title
            LIMIT 12;`,
            [author])
        : await db_connection.query(
            `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book
            WHERE author_id = ?
            ORDER BY title DESC;`,
            [author])

        return book
    } else {
        const [book] = sortBy[1] === 'asc'
        ? await db_connection.query(
            `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book
            WHERE author_id = ?
            ORDER BY rate;`,
            [author])
        : await db_connection.query(
            `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book
            WHERE author_id = ?
            ORDER BY rate DESC;`,
            [author])

        return book
    }
}

async function handleSortTypesWithAuthorAndSeries (author, series, sortBy) {
    if (sortBy[0] === 'title') {
        const [book] = 
            sortBy[1] === 'asc'
            ? await db_connection.query(
                `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book 
                WHERE author_id = ? AND serie_id = ?
                ORDER BY title;`,
                [author, series])
            : await db_connection.query(
                `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book 
                WHERE author_id = ? AND serie_id = ?
                ORDER BY title DESC;`,
                [author, series])

        return book
    } if (sortBy[0] === 'order') {
        const [book] = 
        sortBy[1] === 'asc'
        ? await db_connection.query(
            `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book 
            WHERE author_id = ? AND serie_id = ?
            ORDER BY series_num;`,
            [author, series])
        : await db_connection.query(
            `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book 
            WHERE author_id = ? AND serie_id = ?
            ORDER BY series_num DESC;`,
            [author, series])

        return book
    } else {
        const [book] = 
            sortBy[1] === 'asc'
            ? await db_connection.query(
                `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book 
                WHERE author_id = ? AND serie_id = ?
                ORDER BY rate;`,
                [author, series])
            : await db_connection.query(
                `SELECT BIN_TO_UUID(id) id, cover, rate, serie_id, title FROM book 
                WHERE author_id = ? AND serie_id = ?
                ORDER BY rate DESC;`,
                [author, series])
        
        return book
    }
}
