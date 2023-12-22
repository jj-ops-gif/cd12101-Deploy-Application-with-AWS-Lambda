import * as uuid from 'uuid'
import { TodosAccess } from '../dataLayer/todosAccess.mjs'
import { S3Access } from '../dataLayer/s3Access.mjs'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('todos')
const todosAccess = new TodosAccess()
const s3Access = new S3Access()

export async function getAllTodos(userId) {
  return todosAccess.getAllTodos(userId)
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

  logger.info('Get db todo', { result })
  return result.Item
}

export async function deleteTodo(userId, todoId) {
  logger.info('Deleting the image of the todo in the S3', { todoId })
  await s3Access.deleteImage(todoId)

  logger.info('Deleting a todo for the user', { userId, todoId })
  return await todosAccess.deleteTodo(userId, todoId)
}

export async function updateTodo(updateTodoRequest) {
  if (!updateTodoRequest || !updateTodoRequest.todoId || !updateTodoRequest.userId) {
    return
  }

  logger.info('Update dynamoDB record', { updateTodoRequest })
  return await todosAccess.updateTodo({
    ...updateTodoRequest,
    updatedAt: new Date().toJSON(),
  })
}

export async function getUploadUrl(todoId) {
  logger.info('Get upload URL for a todo', { todoId })
  return await s3Access.getUploadUrl(todoId)
}