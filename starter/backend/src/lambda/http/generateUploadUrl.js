import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { S3Access } from '../../s3Layer/s3Access.mjs'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('generateUploadUrl')
const s3Access = new S3Access()

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    logger.info('Processing event: ', event)
    const todoId = event.pathParameters.todoId
    const uploadUrl = await s3Access.getUploadUrl(todoId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    }
  })
