import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { BookItem } from '../models/BookItem'
import { BookUpdate } from '../models/BookUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('BooksAccess')

//Implement the dataLayer logic

export class BooksAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly bookTable = process.env.BOOKS_TABLE,
        private readonly createdAtIndex = process.env.BOOKS_CREATED_AT_INDEX,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly signedUrlExpiration = process.env.SIGNED_URL_EXPIRATION,
        private readonly s3Bucket = new XAWS.S3({
            signatureVersion: 'v4'
        })
    ){}

    /** Create Books */
    async createBookAccess(newBook: BookItem): Promise<BookItem> {
        logger.info('[Repo] Creating new BookItem for userId ', newBook.userId, ' name ', newBook.name)
        await this.docClient.put({
            TableName: this.bookTable,
            Item: newBook
        }).promise()
        logger.info('[Repo] Created new BookItem for userId ', newBook.userId, ' name ', newBook.name)
        return newBook
    }

    /** Get Books for userid */
    async getBooksForUser(userId: string): Promise<any> {
        logger.info('[Repo] Start getting Books for userId ', userId)
        const books = await this.docClient.query({
            TableName: this.bookTable,
            IndexName: this.createdAtIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        logger.info('[Repo] End getting Books for userId ', userId)
        return books
    }

    /** Update Book by userId & bookId */
    async updateBook(userId: string, bookId: string, updatedBook: BookUpdate): Promise<BookUpdate> {
        logger.info('[Repo] Updating Book for userId ', userId, ' bookId ', bookId)
        await this.docClient.update({
            TableName: this.bookTable,
            Key: {
                "userId": userId,
                "bookId": bookId
            },
            UpdateExpression: 'set #name=:name, #author=:author, #quantity=:quantity, #price=:price',
            ExpressionAttributeNames: { '#name': 'name', '#author': 'author', '#quantity': 'quantity',  '#price': 'price'},
            ExpressionAttributeValues: {
                ':name': updatedBook.name,
                ':author': updatedBook.author,
                ':quantity': updatedBook.quantity,
                ':price' : updatedBook.price
            }
        }).promise()
        logger.info('[Repo] Updated Books for userId ', userId, ' bookId ', bookId)
        return updatedBook
    }

    /** Delete Book by userId & bookId */
    async deleteBook(userId: string, bookId: string) {
        logger.info('[Repo] Delete Books by userId ', userId, ' bookId ', bookId)
        return await this.docClient.delete({
            TableName: this.bookTable,
            Key: {
                "userId": userId,
                "bookId": bookId
            }
        }).promise()
    }

    /** Get signed URL from S3 bucket */
    getSignedURL(bookId: string) {
        const params = {
            Bucket: this.bucketName,
            Key: bookId,
            Expires: Number(this.signedUrlExpiration)
        }
        return this.s3Bucket.getSignedUrl('putObject', params)
    }

    /** Create attachment signed Url */
    async createAttachmentPresignedUrl(userId: string, bookId: string): Promise<any> {
        logger.info(`[Repo] Get Signed URL from S3 bucket by ${userId} & ${bookId}`)
        const signedUrl = this.getSignedURL(bookId)
        logger.info(`[Repo] SighedURL from s3 bucket ${signedUrl}`)
        logger.info('[Repo] Create signed Url for userId ', userId, ' bookId ', bookId)
        await this.docClient.update({
            TableName: this.bookTable,
            Key: {
                "userId": userId,
                "bookId": bookId
            },
            UpdateExpression: "set attachmentUrl=:url",
            ExpressionAttributeValues: {
                ":url": signedUrl.split("?")[0]
            }
        }).promise()
        logger.info('[Repo] Completed')
        return signedUrl
    }
}
