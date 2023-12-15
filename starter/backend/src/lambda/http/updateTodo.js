import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../auth/utils.mjs'
import { todoExists, updateTodo } from '../../businessLogic/todos.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    console.log('Processing event: ', event)
    const todoId = event.pathParameters.todoId
    const updatedTodo = JSON.parse(event.body)

    const authorization = event.headers.Authorization
    const userId = getUserId(authorization)
    //const userId = 'testUser'

    const validTodoId = await todoExists(userId, todoId)
    
    if (!validTodoId) {
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

    return await updateTodo({
      userId,
      todoId,
      ...updatedTodo
    })
  })