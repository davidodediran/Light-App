import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? 'us-east-1',
})

const BUCKET = process.env.S3_BUCKET_NAME!
const CF_DOMAIN = process.env.CLOUDFRONT_DOMAIN

export function getS3Key(institutionId: string, type: 'audio' | 'avatar' | 'attachment', ticketId: string, filename: string) {
  return `${institutionId}/${type}/${ticketId}/${filename}`
}

export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn = 300) {
  const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType })
  return getSignedUrl(s3Client, cmd, { expiresIn })
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 900) {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  return getSignedUrl(s3Client, cmd, { expiresIn })
}

export function getPublicUrl(key: string): string {
  if (CF_DOMAIN) return `https://${CF_DOMAIN}/${key}`
  return `https://${BUCKET}.s3.amazonaws.com/${key}`
}

export async function deleteObject(key: string) {
  const cmd = new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
  return s3Client.send(cmd)
}
