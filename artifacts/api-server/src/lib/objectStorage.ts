import {
  GetObjectCommand,
  HeadObjectCommand,
  type HeadObjectCommandOutput,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { Readable } from "stream";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

type StoredObject = {
  key: string;
  metadata?: HeadObjectCommandOutput;
};

function isNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return candidate.name === "NotFound" || candidate.name === "NoSuchKey" || candidate.$metadata?.httpStatusCode === 404;
}

/**
 * Storage adapter for DigitalOcean Spaces.
 *
 * Spaces implements the S3 API, so uploads are signed server-side and the
 * browser uploads directly to the bucket. Files are served by our API route
 * to preserve the existing `/api/storage/objects/*` URLs in the frontend.
 */
export class ObjectStorageService {
  private client?: S3Client;

  private getBucket(): string {
    const bucket = process.env.SPACES_BUCKET;
    if (!bucket) throw new Error("SPACES_BUCKET is not configured");
    return bucket;
  }

  private getClient(): S3Client {
    if (this.client) return this.client;

    const region = process.env.SPACES_REGION;
    const accessKeyId = process.env.SPACES_ACCESS_KEY;
    const secretAccessKey = process.env.SPACES_SECRET_KEY;
    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error("DigitalOcean Spaces credentials are not fully configured");
    }

    this.client = new S3Client({
      endpoint: process.env.SPACES_ENDPOINT || `https://${region}.digitaloceanspaces.com`,
      // DigitalOcean determines the location from the endpoint. The AWS SDK
      // requires an AWS region identifier when calculating SigV4 signatures.
      region: "us-east-1",
      forcePathStyle: false,
      credentials: { accessKeyId, secretAccessKey },
    });
    return this.client;
  }

  private getUploadPrefix(): string {
    return (process.env.SPACES_UPLOAD_PREFIX || "uploads").replace(/^\/+|\/+$/g, "");
  }

  getPublicObjectSearchPaths(): string[] {
    return Array.from(
      new Set(
        (process.env.PUBLIC_OBJECT_SEARCH_PATHS || "public")
          .split(",")
          .map((path) => path.trim().replace(/^\/+|\/+$/g, ""))
          .filter(Boolean),
      ),
    );
  }

  async searchPublicObject(filePath: string): Promise<StoredObject | null> {
    const keySuffix = filePath.replace(/^\/+/, "");
    for (const prefix of this.getPublicObjectSearchPaths()) {
      const key = prefix ? `${prefix}/${keySuffix}` : keySuffix;
      try {
        const metadata = await this.getClient().send(
          new HeadObjectCommand({ Bucket: this.getBucket(), Key: key }),
        );
        return { key, metadata };
      } catch (error) {
        if (!isNotFound(error)) throw error;
      }
    }
    return null;
  }

  async downloadObject(file: StoredObject, cacheTtlSec = 3600): Promise<Response> {
    try {
      const response = await this.getClient().send(
        new GetObjectCommand({ Bucket: this.getBucket(), Key: file.key }),
      );
      if (!response.Body || !(response.Body instanceof Readable)) {
        throw new Error("DigitalOcean Spaces returned an empty object body");
      }

      const headers: Record<string, string> = {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Cache-Control": `public, max-age=${cacheTtlSec}`,
      };
      if (response.ContentLength) headers["Content-Length"] = String(response.ContentLength);

      return new Response(Readable.toWeb(response.Body) as ReadableStream, { headers });
    } catch (error) {
      if (isNotFound(error)) throw new ObjectNotFoundError();
      throw error;
    }
  }

  async getObjectEntityUploadURL(): Promise<string> {
    const key = `${this.getUploadPrefix()}/${randomUUID()}`;
    return getSignedUrl(
      this.getClient(),
      new PutObjectCommand({ Bucket: this.getBucket(), Key: key }),
      { expiresIn: 900 },
    );
  }

  async getObjectEntityFile(objectPath: string): Promise<StoredObject> {
    if (!objectPath.startsWith("/objects/")) throw new ObjectNotFoundError();
    const key = objectPath.slice("/objects/".length);
    if (!key) throw new ObjectNotFoundError();

    try {
      const metadata = await this.getClient().send(
        new HeadObjectCommand({ Bucket: this.getBucket(), Key: key }),
      );
      return { key, metadata };
    } catch (error) {
      if (isNotFound(error)) throw new ObjectNotFoundError();
      throw error;
    }
  }

  normalizeObjectEntityPath(rawPath: string): string {
    if (rawPath.startsWith("/objects/")) return rawPath;
    const url = new URL(rawPath);
    const key = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (!key) throw new ObjectNotFoundError();
    return `/objects/${key}`;
  }
}
