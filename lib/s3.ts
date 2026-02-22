import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export async function uploadToS3(
  file: File | Buffer,
  type = "uploads",
  filename?: string,
  contentType?: string
) {
  let buffer: Buffer;
  let key: string;

  if (Buffer.isBuffer(file)) {
    buffer = file;
    key = `${type}/${randomUUID()}-${filename || "dub_output.mp4"}`;
    contentType = contentType || "video/mp4";
  } else {
    // It's a File from browser/File API
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
      ACL: "public-read",
    })
  );

  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}