import * as uuid from 'uuid'
import { TodosAccess } from '../dataLayer/todosAccess.mjs'

const todosAccess = new TodosAccess()

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

  console.log('Get todo: ', result)
  return !!result.Item
}

export async function deleteTodo(userId, todoId) {
  console.log(`BUSINESS: Deleting a todo with id ${todoId} of user ${userId}`)
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