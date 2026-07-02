"use server";

import { revalidatePath } from "next/cache";

import { deleteFromCloudinary, extractPublicIdFromUrl } from "@/lib/cloudinary";
import {
  GALLERY_CATEGORIES,
  type GalleryCategory,
  MAX_FEATURED_ITEMS,
} from "@/lib/gallery-data";
import { prisma } from "@/lib/prisma";

export type GalleryActionResult =
  | { success: true; id?: string }
  | { success: false; message: string };

export async function reorderFeaturedItems(
  orderedIds: string[],
): Promise<GalleryActionResult> {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { success: false, message: "No featured items provided" };
  }

  const uniqueIds = orderedIds.filter(
    (id, index) => id && orderedIds.indexOf(id) === index,
  );

  try {
    const currentFeatured = await prisma.galleryItem.findMany({
      where: { featured: true },
      select: { id: true },
      orderBy: { displayOrder: "asc" },
    });

    if (currentFeatured.length === 0) {
      return { success: false, message: "No featured items to reorder" };
    }

    const currentIds = currentFeatured.map((item) => item.id);
    const currentIdSet = new Set(currentIds);

    if (!uniqueIds.every((id) => currentIdSet.has(id))) {
      return { success: false, message: "Invalid featured item selection" };
    }

    const normalizedOrder = [
      ...uniqueIds,
      ...currentIds.filter((id) => !uniqueIds.includes(id)),
    ];

    await prisma.$transaction(async (tx) => {
      await Promise.all(
        normalizedOrder.map((id, index) =>
          tx.galleryItem.update({
            where: { id },
            data: { displayOrder: index, featured: true },
          }),
        ),
      );
    });

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/admin/gallery/featured-order");

    return { success: true };
  } catch (error) {
    console.error("[reorderFeaturedItems] Error", error);
    return { success: false, message: "Failed to reorder featured items" };
  }
}

export interface GalleryUploadCreateItem {
  title: string;
  description?: string | null;
  imageUrl: string;
  category: GalleryCategory;
  featured?: boolean;
  displayOrder?: number;
  width?: number;
  height?: number;
}

export type GalleryUploadActionResult =
  | { success: true; count: number }
  | { success: false; message: string };

export async function createGalleryItems(
  items: GalleryUploadCreateItem[],
): Promise<GalleryUploadActionResult> {
  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, message: "No gallery items provided" };
  }

  const prepared = items.map((item, index) => {
    const title = item.title?.trim() ?? "";
    const imageUrl = item.imageUrl?.trim() ?? "";
    const description = item.description?.trim() || null;
    const featured = false;
    const displayOrder = Number.isFinite(item.displayOrder)
      ? Number(item.displayOrder)
      : index;
    const width = item.width ?? 800;
    const height = item.height ?? 600;
    const isValidCategory = GALLERY_CATEGORIES.includes(item.category);

    return {
      title,
      description,
      imageUrl,
      category: isValidCategory ? item.category : undefined,
      featured,
      displayOrder,
      width,
      height,
    };
  });

  const hasInvalid = prepared.some(
    (item) => !item.title || !item.imageUrl || !item.category,
  );

  if (hasInvalid) {
    return {
      success: false,
      message: "Each item requires a title, image URL, and category",
    };
  }

  try {
    const result = await prisma.galleryItem.createMany({
      data: prepared as Array<
        Omit<GalleryUploadCreateItem, "category"> & {
          category: GalleryCategory;
          width: number;
          height: number;
        }
      >,
    });

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");

    return { success: true, count: result.count };
  } catch (error) {
    console.error("[createGalleryItems] Error:", error);
    return {
      success: false,
      message: "Failed to create gallery items",
    };
  }
}

export async function updateGalleryItem(
  id: string,
  formData: FormData,
): Promise<GalleryActionResult> {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const imageUrl = formData.get("imageUrl") as string;
    const category = formData.get("category") as string;
    const hasFeatured = formData.has("featured");
    const featured = hasFeatured && formData.get("featured") === "true";
    const hasDisplayOrder = formData.has("displayOrder");
    const displayOrder = hasDisplayOrder
      ? parseInt(formData.get("displayOrder") as string) || 0
      : undefined;

    if (!title || !imageUrl || !category) {
      return {
        success: false,
        message: "Title, image URL, and category are required",
      };
    }

    // Get current item state
    const currentItem = await prisma.galleryItem.findUnique({
      where: { id },
      select: { featured: true, displayOrder: true },
    });

    if (!currentItem) {
      return { success: false, message: "Gallery item not found" };
    }

    // Update fields, only including featured/displayOrder when provided
    await prisma.galleryItem.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        category,
        ...(displayOrder !== undefined ? { displayOrder } : {}),
      },
    });

    // Handle featured state change separately to enforce limit
    if (hasFeatured && featured !== currentItem.featured) {
      const result = await setGalleryItemFeatured(id, featured);
      if (!result.success) {
        return {
          success: false,
          message: result.message || "Failed to update featured state",
        };
      }
    }

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");

    return { success: true };
  } catch (error) {
    console.error("[updateGalleryItem] Error:", error);
    return { success: false, message: "Failed to update gallery item" };
  }
}

export async function deleteGalleryItem(
  id: string,
): Promise<GalleryActionResult> {
  try {
    const item = await prisma.galleryItem.findUnique({
      where: { id },
    });

    if (!item) {
      return { success: false, message: "Item not found" };
    }

    await prisma.galleryItem.delete({ where: { id } });

    if (item.imageUrl) {
      const result = await deleteCloudinaryImage(item.imageUrl);
      if (!result.success) {
        console.error(
          "[deleteGalleryItem] Cloudinary delete error:",
          result.message,
        );
      }
    }

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");

    return { success: true };
  } catch (error) {
    console.error("[deleteGalleryItem] Error:", error);
    return { success: false, message: "Failed to delete gallery item" };
  }
}

export async function deleteCloudinaryImage(
  imageUrl: string,
): Promise<GalleryActionResult> {
  try {
    if (!imageUrl) {
      return { success: false, message: "Image URL is required" };
    }

    const publicId = extractPublicIdFromUrl(imageUrl);
    if (!publicId) {
      return {
        success: false,
        message: "Could not extract public ID from URL",
      };
    }

    try {
      await deleteFromCloudinary(publicId);
    } catch (cloudinaryError) {
      console.error(
        "[deleteCloudinaryImage] Cloudinary delete error:",
        cloudinaryError,
      );
      return {
        success: false,
        message: "Failed to delete image from Cloudinary",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[deleteCloudinaryImage] Error:", error);
    return { success: false, message: "Failed to delete image" };
  }
}

export async function setGalleryItemFeatured(
  id: string,
  featured: boolean,
): Promise<{ success: boolean; message?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      if (!featured) {
        await tx.galleryItem.update({
          where: { id },
          data: { featured: false, displayOrder: 0 },
        });
        return;
      }

      const currentlyFeatured = await tx.galleryItem.findMany({
        where: { featured: true },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      const isAlreadyFeatured = currentlyFeatured.some(
        (item) => item.id === id,
      );

      if (isAlreadyFeatured) {
        return;
      }

      await tx.galleryItem.update({
        where: { id },
        data: { featured: true },
      });

      const overflowCount = Math.max(
        0,
        currentlyFeatured.length - (MAX_FEATURED_ITEMS - 1),
      );

      if (overflowCount > 0) {
        const toUnfeatureIds = currentlyFeatured
          .slice(0, overflowCount)
          .map((item) => item.id)
          .filter((itemId) => itemId !== id);

        if (toUnfeatureIds.length > 0) {
          await tx.galleryItem.updateMany({
            where: { id: { in: toUnfeatureIds } },
            data: { featured: false, displayOrder: 0 },
          });
        }
      }
    });

    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");

    return { success: true };
  } catch (error) {
    console.error("[setGalleryItemFeatured] Error", error);
    return { success: false, message: "Failed to update featured state" };
  }
}
