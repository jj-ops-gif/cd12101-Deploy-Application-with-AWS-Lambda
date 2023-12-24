import * as uuid from 'uuid'
import { TodosAccess } from '../dataLayer/todosAccess.mjs'
import { S3Access } from '../dataLayer/s3Access.mjs'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('todos')
const todosAccess = new TodosAccess()
const s3Access = new S3Access()

export async function getAllTodos(requestId, userId) {
  return todosAccess.getAllTodos(requestId, userId)
}

export async function createTodo(requestId, createTodoRequest, userId) {
  const todoId = uuid.v4()
  const dateTimeNow = new Date().toJSON();

  return await todosAccess.createTodo(requestId, {
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

export async function getDbTodo(requestId, userId, todoId) {
  const result = await todosAccess.getTodo(requestId, userId, todoId)

  logger.info('Get db todo', { requestId, result })
  return result.Item
}

export async function deleteTodo(requestId, userId, todoId) {
  logger.info('Deleting the image of the todo in the S3', { requestId, todoId })
  await s3Access.deleteImage(requestId, todoId)

  logger.info('Deleting a todo for the user', { requestId, userId, todoId })
  return await todosAccess.deleteTodo(requestId, userId, todoId)
}

export async function updateTodo(requestId, updateTodoRequest) {
  if (!updateTodoRequest || !updateTodoRequest.todoId || !updateTodoRequest.userId) {
    return
  }

  logger.info('Update dynamoDB record', { requestId, updateTodoRequest })
  return await todosAccess.updateTodo(requestId, {
    ...updateTodoRequest,
    updatedAt: new Date().toJSON(),
  })
}

export async function getUploadUrl(requestId, todoId) {
  logger.info('Get upload URL for a todo', { requestId, todoId })
  return await s3Access.getUploadUrl(requestId, todoId)
}