import * as uuid from 'uuid'
import { TodosAccess } from '../dataLayer/todosAccess.mjs'
import { S3Access } from '../dataLayer/s3Access.mjs'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('todos')
const todosAccess = new TodosAccess()
const s3Access = new S3Access()

export async function getAllTodos() {
  return todosAccess.getAllTodos()
}

export async function createTodo(createTodoRequest, userId) {
  const todoId = uuid.v4()
  const dateTimeNow = new Date().toJSON();

  return await todosAccess.createTodo({
    userId,
    todoId,
    done: false,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: dateTimeNow,
    updatedAt: dateTimeNow,
    attachmentUrl: ''
  })
}

export async function getDbTodo(userId, todoId) {
  const result = await todosAccess.getTodo(userId, todoId)

  logger.info('Get db todo: ', result.Item)
  return result.Item
}

export async function deleteTodo(userId, todoId) {
  logger.info(`BUSINESS: Deleting the image of the todo ${todoId} in the S3`)
  await s3Access.deleteImage(todoId)
  logger.info(`BUSINESS: Deleting a todo with id ${todoId} of user ${userId}`)
  return await todosAccess.deleteTodo(userId, todoId)
}

export async function updateTodo(updateTodoRequest) {
  if (!updateTodoRequest || !updateTodoRequest.todoId || !updateTodoRequest.userId) {
    return
  }

  logger.info(`BUSINESS: Update the todoId=${updateTodoRequest.todoId}, userId=${updateTodoRequest.userId}`)

  return await todosAccess.updateTodo({
    ...updateTodoRequest,
    updatedAt: new Date().toJSON(),
  })
}

export async function getUploadUrl(todoId) {
  logger.info(`BUSINESS: Get upload URL for the todo ${todoId}`)
  return await s3Access.getUploadUrl(todoId)
}