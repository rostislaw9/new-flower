"use server";

import {
  type UploadResult,
  deleteFromCloudinary,
  uploadToCloudinary,
} from "@/lib/cloudinary";

interface UploadActionResult {
  success: boolean;
  data?: UploadResult;
  error?: string;
}

export async function uploadToCloudinaryAction(
  file: File,
  folder: string = "portfolio",
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
        error: "Invalid file type. Allowed: JPG, PNG, WebP, HEIC",
      };
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: "File too large (max 10MB)" };
    }

    const result = await uploadToCloudinary(file, folder);

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

export async function deleteFromCloudinaryAction(
  publicId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteFromCloudinary(publicId);
    return { success: true };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}
