import { PutObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('S3Access')

export class S3Access {
  constructor(
    s3Client = AWSXRay.captureAWSv3Client(new S3Client()),
    bucketName = process.env.IMAGES_S3_BUCKET,
    urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)
  ) {
    this.bucketName = bucketName
    this.s3Client = s3Client
    this.urlExpiration = urlExpiration
  }

  async getUploadUrl(todoId) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: todoId
    })
    return await getSignedUrl(this.s3Client, command, {
      expiresIn: this.urlExpiration
    })
  }

  async deleteImage(todoId) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: todoId
    })
    return await this.s3Client.send(command)
  }

}
