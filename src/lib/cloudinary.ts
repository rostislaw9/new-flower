import {
  type UploadApiErrorResponse,
  type UploadApiResponse,
  v2 as cloudinary,
} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadToCloudinary(
  file: File,
  folder: string = "portfolio",
): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64,
      {
        folder,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "heic"],
        transformation: [{ quality: "auto:good" }, { fetch_format: "auto" }],
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error || !result) {
          reject(error || new Error("Upload failed"));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      },
    );
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      (
        error: UploadApiErrorResponse | undefined,
        _result: UploadApiResponse | undefined,
      ) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      },
    );
  });
}

export function extractPublicIdFromUrl(url: string): string | null {
  const match = url.match(/\/upload\/v\d+\/(.*)$/);
  return match?.[1] ? match[1].replace(/\.[^.]+$/, "") : null;
}

export { cloudinary };
