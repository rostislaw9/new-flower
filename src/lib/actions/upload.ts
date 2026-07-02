"use server";

import { type UploadResult, uploadToCloudinary } from "@/lib/cloudinary";

interface UploadActionResult {
  success: boolean;
  data?: UploadResult;
  error?: string;
}

export async function uploadToCloudinaryAction(
  file: File,
  folder: string = "gallery",
  useOverwrite = false,
): Promise<UploadActionResult> {
  try {
    if (!file || file.size === 0) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Allowed: JPG, PNG, WEBP, HEIC",
      };
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: "File too large (max 10MB)" };
    }

    const result = await uploadToCloudinary(file, folder, useOverwrite);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
