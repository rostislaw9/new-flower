import { v2 as cloudinary } from "cloudinary";

import { getArtistImagesConfig } from "@/lib/artist-images-config";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

const CLOUDINARY_FOLDERS = ["portfolio", "bookings", "artist-images"] as const;

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
}

async function listAllCloudinaryResources(
  folder: string,
): Promise<CloudinaryResource[]> {
  const resources: CloudinaryResource[] = [];
  let nextCursor: string | undefined;

  do {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: `${folder}/`,
      resource_type: "image",
      max_results: 500,
      ...(nextCursor ? { next_cursor: nextCursor } : {}),
    });

    for (const resource of result.resources) {
      resources.push({
        public_id: resource.public_id,
        secure_url: resource.secure_url,
      });
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);

  return resources;
}

async function collectUsedImageUrls(): Promise<Set<string>> {
  const usedUrls = new Set<string>();

  const portfolioItems = await prisma.portfolioItem.findMany({
    select: { imageUrl: true },
  });
  for (const item of portfolioItems) {
    if (item.imageUrl) usedUrls.add(item.imageUrl);
  }

  const appointments = await prisma.appointment.findMany({
    select: { referenceImages: true },
  });
  for (const appointment of appointments) {
    for (const url of appointment.referenceImages) {
      if (url) usedUrls.add(url);
    }
  }

  const artistConfig = await getArtistImagesConfig();
  if (artistConfig.portraitUrl) usedUrls.add(artistConfig.portraitUrl);
  if (artistConfig.logoUrl) usedUrls.add(artistConfig.logoUrl);

  return usedUrls;
}

export interface CleanupResult {
  total: number;
  deleted: number;
  failed: number;
  errors: string[];
}

export async function cleanupUnusedCloudinaryImages(): Promise<CleanupResult> {
  const usedUrls = await collectUsedImageUrls();

  const allResources: CloudinaryResource[] = [];
  for (const folder of CLOUDINARY_FOLDERS) {
    const folderResources = await listAllCloudinaryResources(folder);
    allResources.push(...folderResources);
  }

  const orphaned = allResources.filter(
    (resource) => !usedUrls.has(resource.secure_url),
  );

  let deleted = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const resource of orphaned) {
    try {
      await deleteFromCloudinary(resource.public_id);
      deleted++;
    } catch (error) {
      failed++;
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(`Failed to delete ${resource.public_id}: ${message}`);
    }
  }

  return {
    total: orphaned.length,
    deleted,
    failed,
    errors,
  };
}
