import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getUserId } from '../auth/utils.mjs'
import { deleteTodo, todoExists } from '../../businessLogic/todos.mjs'

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
  const todoId = event.pathParameters.todoId
  const authorization = event.headers.Authorization
  const userId = getUserId(authorization)
  //const userId = 'testUser'
  
  console.log(`HTTP: Deleting a todo with id ${todoId} of user ${userId}`)

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

  return await deleteTodo(userId, todoId)
})
