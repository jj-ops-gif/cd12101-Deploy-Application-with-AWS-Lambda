import { PutObjectCommand, DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import AWSXRay from 'aws-xray-sdk-core'

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

  async getUploadUrl(imageId) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: imageId
    })
    const url = await getSignedUrl(this.s3Client, command, {
      expiresIn: this.urlExpiration
    })

    await this.docClient.update({
      TableName: this.todosTable,
      Key: { userId, todoId },
      UpdateExpression: "set attachmentUrl=:URL",
      ExpressionAttributeValues: {
        ":URL": uploadUrl.split("?")[0]
    },
    ReturnValues: "UPDATED_NEW"
  })
  .promise();

    return url
  }

  async deleteImage(imageId) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: imageId
    })
    return await this.s3Client.send(command)
  }

}
