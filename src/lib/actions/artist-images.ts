"use server";

import { v2 as cloudinary } from "cloudinary";

import {
  getArtistImagesConfig,
  updateArtistImagesConfig,
} from "@/lib/artist-images-config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

interface SaveResult {
  success: boolean;
  error?: string;
}

function extractPublicIdFromUrl(url: string): string | null {
  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    return filename?.split(".")[0] || null;
  } catch {
    return null;
  }
}

async function deleteFromCloudinary(imageUrl: string): Promise<void> {
  const publicId = extractPublicIdFromUrl(imageUrl);
  if (publicId) {
    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(`artist-images/${publicId}`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

export async function saveArtistPortrait(
  imageUrl: string,
): Promise<SaveResult> {
  try {
    const config = await getArtistImagesConfig();

    // Delete old image from Cloudinary if it exists
    if (config.portraitUrl) {
      try {
        await deleteFromCloudinary(config.portraitUrl);
      } catch (error) {
        console.error("[saveArtistPortrait] Error deleting old image:", error);
        // Continue with save even if delete fails
      }
    }

    await updateArtistImagesConfig({ portraitUrl: imageUrl });
    return { success: true };
  } catch (error) {
    console.error("[saveArtistPortrait] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save artist portrait",
    };
  }
}

export async function saveShopLogo(imageUrl: string): Promise<SaveResult> {
  try {
    const config = await getArtistImagesConfig();

    // Delete old image from Cloudinary if it exists
    if (config.logoUrl) {
      try {
        await deleteFromCloudinary(config.logoUrl);
      } catch (error) {
        console.error("[saveShopLogo] Error deleting old image:", error);
        // Continue with save even if delete fails
      }
    }

    await updateArtistImagesConfig({ logoUrl: imageUrl });
    return { success: true };
  } catch (error) {
    console.error("[saveShopLogo] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to save shop logo",
    };
  }
}

export async function deleteArtistPortrait(): Promise<SaveResult> {
  try {
    const config = await getArtistImagesConfig();

    if (config.portraitUrl) {
      const publicId = extractPublicIdFromUrl(config.portraitUrl);

      if (publicId) {
        await new Promise<void>((resolve, reject) => {
          cloudinary.uploader.destroy(`artist-images/${publicId}`, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
      }
    }

    await updateArtistImagesConfig({ portraitUrl: null });
    return { success: true };
  } catch (error) {
    console.error("[deleteArtistPortrait] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete artist portrait",
    };
  }
}

export async function deleteShopLogo(): Promise<SaveResult> {
  try {
    const config = await getArtistImagesConfig();

    if (config.logoUrl) {
      const publicId = extractPublicIdFromUrl(config.logoUrl);

      if (publicId) {
        await new Promise<void>((resolve, reject) => {
          cloudinary.uploader.destroy(`artist-images/${publicId}`, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
      }
    }

    await updateArtistImagesConfig({ logoUrl: null });
    return { success: true };
  } catch (error) {
    console.error("[deleteShopLogo] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete shop logo",
    };
  }
}

export async function getArtistImages() {
  try {
    const config = await getArtistImagesConfig();
    return {
      portraitUrl: config.portraitUrl,
      logoUrl: config.logoUrl,
    };
  } catch (error) {
    console.error("[getArtistImages] Error:", error);
    return {
      portraitUrl: null,
      logoUrl: null,
    };
  }
}
