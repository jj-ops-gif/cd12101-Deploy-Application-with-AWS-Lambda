import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../auth/utils.mjs'
import { getAllTodos } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('getTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event, context) => {
    const requestId = context.awsRequestId;
    logger.info('Get all todos event for the current user', { requestId, event })
    const authorization = event.headers.Authorization
    const userId = getUserId(authorization)

    const todos = await getAllTodos(requestId, userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  })
