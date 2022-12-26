import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateBook } from '../../businessLogic/books'
import { UpdateBookRequest } from '../../requests/UpdateBookRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const bookId = event.pathParameters.bookId
    const updatedBook: UpdateBookRequest = JSON.parse(event.body)

    const updatedItem = await updateBook(getUserId(event), bookId, updatedBook)

    return {
      statusCode: 200,
      body: JSON.stringify({updatedItem})
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
