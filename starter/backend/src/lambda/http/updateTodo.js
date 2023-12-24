import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../auth/utils.mjs'
import { getDbTodo, updateTodo } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('updateTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event, context) => {
    const requestId = context.awsRequestId;
    logger.info('Update todo event', { requestId, event })
    const todoId = event.pathParameters.todoId
    const updatedTodo = JSON.parse(event.body)

    const authorization = event.headers.Authorization
    const userId = getUserId(authorization)

    const dbTodo = await getDbTodo(requestId, userId, todoId)
    logger.info('Found a db todo', { requestId, dbTodo })

    if ( !dbTodo ) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Todo does not exist'
        })
      }
    }

    logger.info('Update todo', {
      requestId,
      userId,
      todoId,
      ...dbTodo,
      ...updatedTodo
    })

    return await updateTodo(requestId, {
      userId,
      todoId,
      ...dbTodo,
      ...updatedTodo
    })
  })