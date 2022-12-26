import { BooksAccess } from '../dataLayer/booksAcess'
import { CreateBookRequest } from '../requests/CreateBookRequest'
import { UpdateBookRequest } from '../requests/UpdateBookRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

const logger = createLogger('Book')

// Create dataLayer
const booksAccess = new BooksAccess()
//Implement businessLogic
export async function createBook(newBook: CreateBookRequest, userId: string) {
    logger.info(`[Service] Start create new Book ${newBook}`)
    const bookId = uuid.v4()
    const newItem = {
        userId: userId,
        bookId: bookId,
        createdAt: new Date().toISOString(),
        ...newBook
    }
    return await booksAccess.createBookAccess(newItem)
}

export async function getBookForUser(userId: string) {
    logger.info(`[Service] Start getting Book for userId: ${userId}`)
    return await booksAccess.getBooksForUser(userId)
}

export async function updateBook(userId: string, bookId: string, updatedBook: UpdateBookRequest) {
    logger.info(`[Service] Start updating Book for userId: ${userId} & BookId ${bookId}`)
    return await booksAccess.updateBook(userId, bookId, updatedBook)
}

export async function deleteBook(userId: string, bookId: string) {
    logger.info(`[Service] Start Delete Book by userId: ${userId} & bookId ${bookId}`)
    return await booksAccess.deleteBook(userId, bookId)
}

export async function createAttachmentPresignedUrl(userId: string, bookId: string) {
    logger.info(`[Service] Start create attachment signed URL for userId: ${userId} & bookId ${bookId}`)
    return await booksAccess.createAttachmentPresignedUrl(userId, bookId)
}