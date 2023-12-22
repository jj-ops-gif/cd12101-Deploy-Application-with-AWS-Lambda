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
  .handler(async (event) => {
    logger.info('Update todo event', { event })
    const todoId = event.pathParameters.todoId
    const updatedTodo = JSON.parse(event.body)

    const authorization = event.headers.Authorization
    const userId = getUserId(authorization)

    const dbTodo = await getDbTodo(userId, todoId)
    logger.info('Found a db todo', { dbTodo })

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
      userId,
      todoId,
      ...dbTodo,
      ...updatedTodo
    })

    return await updateTodo({
      userId,
      todoId,
      ...dbTodo,
      ...updatedTodo
    })
  })