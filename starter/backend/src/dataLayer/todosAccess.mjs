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

  async getAllTodos(requestId, userId) {
    logger.info('Getting all todos for user', { requestId, userId })

    const result = await this.dynamoDbClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ":userId": userId
      }
    })
    return result.Items
  }

  async createTodo(requestId, todo) {
    logger.info('Creating a todo', { requestId, todo })

    const response = await this.dynamoDbClient.put({
      TableName: this.todosTable,
      Item: todo
    })

    logger.info('Response for the creating a todo', { requestId, response });
    return todo
  }

  async getTodo(requestId, userId, todoId) {
    logger.info('Getting a todo in the dynamoDb', { requestId, userId, todoId })

    const response = await this.dynamoDbClient.get({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    })

    logger.info('Response for the getting a todo', { requestId, response });
    return response;
  }

  async deleteTodo(requestId, userId, todoId) {
    logger.info('Deleting a todo', { requestId, userId, todoId })

    const response = await this.dynamoDbClient.delete({
      TableName: this.todosTable,
      Key: {
        userId,
        todoId
      }
    })
  }

  async updateTodo(requestId, todo) {
    logger.info('Updating a todo', { requestId, todo })

    this.dynamoDbClient.update({
      TableName: this.todosTable,
      Key: {
        userId: todo.userId,
        todoId: todo.todoId
      },
      UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done, attachmentUrl=:URL, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":name": todo.name,
        ":dueDate": todo.dueDate,
        ":done": todo.done,
        ":updatedAt": todo.updatedAt,
        ":URL": todo.attachmentUrl
      },
      ExpressionAttributeNames: {
        "#name": "name"
      },
      ReturnValues: "UPDATED_NEW",
    })
    
  }

}
