import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

/**
 * Upload a file to S3.
 * @param file - The file to upload (can be user upload or dubbed output)
 * @param type - "user" | "dub" (determines folder)
 * @returns Public S3 URL
 */
export async function uploadToS3(file: File | Buffer, type: "user" | "dub" = "user", filename?: string, contentType?: string) {
  let buffer: Buffer;
  let key: string;

  if (file instanceof Buffer) {
    buffer = file;
    key = `${type}/${randomUUID()}-${filename || "dub_output.mp4"}`;
  } else {
    buffer = Buffer.from(await file.arrayBuffer());
    key = `${type}/${randomUUID()}-${file.name}`;
    contentType = file.type;
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read", // ensures it's publicly accessible
    })
  );

  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}