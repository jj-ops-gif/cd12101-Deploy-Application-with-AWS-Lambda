import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('TodosAccess')

export class TodosAccess {
  constructor(
    documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
    todosTable = process.env.TODOS_TABLE
  ) {
    this.documentClient = documentClient
    this.todosTable = todosTable
    this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
  }

  async getAllTodos() {
    logger.info('DATA: Getting all todos')

    const result = await this.dynamoDbClient.scan({
      TableName: this.todosTable
    })
    return result.Items
  }

  async createTodo(todo) {
    logger.info(`DATA: Creating a todo with id ${todo.todoId}`)

    const response = await this.dynamoDbClient.put({
      TableName: this.todosTable,
      Item: todo
    })

    logger.info(`DATA: Response for the creating a todo is ${response}`);
    return todo
  }

  async getTodo(userId, todoId) {
    logger.info(`DATA: Getting a todo with id ${todoId} of user ${userId}`)

    const response = await this.dynamoDbClient.get({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    })

    logger.info(`DATA: Response for the getting a todo is ${response}`);
    return response;
  }

  async deleteTodo(userId, todoId) {
    logger.info(`DATA: Deleting a todo with id ${todoId} of user ${userId}`)

    const response = await this.dynamoDbClient.delete({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    })
  }

  async updateTodo(todo) {
    logger.info(`DATA: Updating a todo`, todo)

    this.dynamoDbClient.update({
      TableName: this.todosTable,
      Key: {
        userId: todo.userId,
        todoId: todo.todoId
      },
      UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":name": todo.name,
        ":dueDate": todo.dueDate,
        ":done": todo.done,
        ":updatedAt": todo.updatedAt
      },
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ReturnValues: "UPDATED_NEW",
    })
    
  }

  async generateUploadUrl(todoId, userId) {
    
  }

}
