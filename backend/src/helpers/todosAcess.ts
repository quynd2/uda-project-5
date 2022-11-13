import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('Contact data access')

// TODO: Implement the dataLayer logic
export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly contactTable = process.env.CONTACT_TABLE,
    private readonly contactCreatedIndex = process.env.CONTACT_CREATED_AT_INDEX
  ) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all contact')

    const result = await this.docClient.query({
      TableName: this.contactTable,
      IndexName: this.contactCreatedIndex,
      KeyConditionExpression: 'userId = :pk',
      ExpressionAttributeValues: {
        ':pk': userId
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    logger.info('Create new contact')

    await this.docClient.put({
      TableName: this.contactTable,
      Item: todoItem
    }).promise()

    return todoItem
  }

  async updateTodo(todoId: String, userId: String, updateTodoItem: TodoUpdate): Promise<TodoUpdate> {
    logger.info('Update contact')

    await this.docClient.update({
      TableName: this.contactTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: "set #todo_name = :name, phoneNo = :phoneNo, dueDate = :dueDate, done = :done",
      ExpressionAttributeNames: {
        '#todo_name': 'name',
      },
      ExpressionAttributeValues: {
        ":name": updateTodoItem.name,
        ":phoneNo": updateTodoItem.phoneNo,
        ":dueDate": updateTodoItem.dueDate,
        ":done": updateTodoItem.done
      }
    }).promise()

    return updateTodoItem
  }

  async deleteTodo(todoId: String, userId: String) {
    logger.info('Delete contact')

    await this.docClient.delete({
      TableName: this.contactTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    }, (err) => {
      if (err) {
        throw new Error("")
      }
    }).promise()
  }

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')

    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}