import * as uuid from 'uuid'
import { TodosAccess } from '../dataLayer/todosAccess.mjs'
import { S3Access } from '../s3Layer/s3Access.mjs'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('todos')
const todosAccess = new TodosAccess()
const s3Access = new S3Access()

export async function getAllTodos() {
  return todosAccess.getAllTodos()
}

export async function createTodo(createTodoRequest, userId) {
  const todoId = uuid.v4()
  const createdAt = new Date().toJSON();

  return await todosAccess.createTodo({
    userId,
    todoId,
    createdAt,
    done: false,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate
  })
}

export async function todoExists(userId, todoId) {
  const result = await todosAccess.getTodo(userId, todoId)

  logger.info('Get todo: ', result)
  return !!result.Item
}

export async function deleteTodo(userId, todoId) {
  logger.info(`BUSINESS: Deleting the image of the todo ${todoId} in the S3`)
  await s3Access.deleteImage(todoId)
  logger.info(`BUSINESS: Deleting a todo with id ${todoId} of user ${userId}`)
  return await todosAccess.deleteTodo(userId, todoId)
}

export async function updateTodo(updateTodoRequest) {
  const updatedAt = new Date().toJSON();

  return await todosAccess.updateTodo({
    userId: updateTodoRequest.userId,
    todoId: updateTodoRequest.todoId,
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done,
    updatedAt,
  })
}