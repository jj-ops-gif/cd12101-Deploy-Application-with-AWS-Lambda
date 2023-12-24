import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../auth/utils.mjs'
import { deleteTodo, getDbTodo } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('deleteTodo')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event, context) => {
    const requestId = context.awsRequestId;
    logger.info('Delete todo event', { requestId, event })
    
    const todoId = event.pathParameters.todoId
    const authorization = event.headers.Authorization
    const userId = getUserId(authorization)
    
    logger.info('HTTP: Deleting a todo', { requestId, userId, todoId })

    const dbTodo = await getDbTodo(requestId, userId, todoId)
      
    if (!dbTodo) {
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

    return await deleteTodo(requestId, userId, todoId)
})
