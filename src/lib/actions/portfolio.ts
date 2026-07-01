"use server";

import { revalidatePath } from "next/cache";

import { deleteFromCloudinary, extractPublicIdFromUrl } from "@/lib/cloudinary";
import {
  MAX_FEATURED_ITEMS,
  PORTFOLIO_CATEGORIES,
  type PortfolioCategory,
} from "@/lib/portfolio-data";
import { prisma } from "@/lib/prisma";

export type PortfolioActionResult =
  | { success: true; id?: string }
  | { success: false; message: string };

export async function reorderFeaturedItems(
  orderedIds: string[],
): Promise<PortfolioActionResult> {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { success: false, message: "No featured items provided" };
  }

  const uniqueIds = orderedIds.filter(
    (id, index) => id && orderedIds.indexOf(id) === index,
  );

  try {
    const currentFeatured = await prisma.portfolioItem.findMany({
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
          tx.portfolioItem.update({
            where: { id },
            data: { displayOrder: index, featured: true },
          }),
        ),
      );
    });

    revalidatePath("/portfolio");
    revalidatePath("/admin/portfolio");
    revalidatePath("/admin/portfolio/featured-order");

    return { success: true };
  } catch (error) {
    console.error("[reorderFeaturedItems] Error", error);
    return { success: false, message: "Failed to reorder featured items" };
  }
}

export interface PortfolioUploadCreateItem {
  title: string;
  description?: string | null;
  imageUrl: string;
  category: PortfolioCategory;
  featured?: boolean;
  displayOrder?: number;
  width?: number;
  height?: number;
}

export type PortfolioUploadActionResult =
  | { success: true; count: number }
  | { success: false; message: string };

export async function createPortfolioItems(
  items: PortfolioUploadCreateItem[],
): Promise<PortfolioUploadActionResult> {
  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, message: "No portfolio items provided" };
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
    const isValidCategory = PORTFOLIO_CATEGORIES.includes(item.category);

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
    const result = await prisma.portfolioItem.createMany({
      data: prepared as Array<
        Omit<PortfolioUploadCreateItem, "category"> & {
          category: PortfolioCategory;
          width: number;
          height: number;
        }
      >,
    });

    revalidatePath("/portfolio");
    revalidatePath("/admin/portfolio");

    return { success: true, count: result.count };
  } catch (error) {
    console.error("[createPortfolioItems] Error:", error);
    return {
      success: false,
      message: "Failed to create portfolio items",
    };
  }
}

export async function updatePortfolioItem(
  id: string,
  formData: FormData,
): Promise<PortfolioActionResult> {
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
    const currentItem = await prisma.portfolioItem.findUnique({
      where: { id },
      select: { featured: true, displayOrder: true },
    });

    if (!currentItem) {
      return { success: false, message: "Portfolio item not found" };
    }

    // Update fields, only including featured/displayOrder when provided
    await prisma.portfolioItem.update({
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
      const result = await setPortfolioItemFeatured(id, featured);
      if (!result.success) {
        return {
          success: false,
          message: result.message || "Failed to update featured state",
        };
      }
    }

    revalidatePath("/portfolio");
    revalidatePath("/admin/portfolio");

    return { success: true };
  } catch (error) {
    console.error("[updatePortfolioItem] Error:", error);
    return { success: false, message: "Failed to update portfolio item" };
  }
}

export async function deletePortfolioItem(
  id: string,
): Promise<PortfolioActionResult> {
  try {
    const item = await prisma.portfolioItem.findUnique({
      where: { id },
    });

    if (!item) {
      return { success: false, message: "Item not found" };
    }

    await prisma.portfolioItem.delete({ where: { id } });

    if (item.imageUrl) {
      const result = await deleteCloudinaryImage(item.imageUrl);
      if (!result.success) {
        console.error(
          "[deletePortfolioItem] Cloudinary delete error:",
          result.message,
        );
      }
    }

    revalidatePath("/portfolio");
    revalidatePath("/admin/portfolio");

    return { success: true };
  } catch (error) {
    console.error("[deletePortfolioItem] Error:", error);
    return { success: false, message: "Failed to delete portfolio item" };
  }
}

export async function deleteCloudinaryImage(
  imageUrl: string,
): Promise<PortfolioActionResult> {
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

export async function setPortfolioItemFeatured(
  id: string,
  featured: boolean,
): Promise<{ success: boolean; message?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      if (!featured) {
        await tx.portfolioItem.update({
          where: { id },
          data: { featured: false, displayOrder: 0 },
        });
        return;
      }

      const currentlyFeatured = await tx.portfolioItem.findMany({
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

      await tx.portfolioItem.update({
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
          await tx.portfolioItem.updateMany({
            where: { id: { in: toUnfeatureIds } },
            data: { featured: false, displayOrder: 0 },
          });
        }
      }
    });

    revalidatePath("/portfolio");
    revalidatePath("/admin/portfolio");

    return { success: true };
  } catch (error) {
    console.error("[setPortfolioItemFeatured] Error", error);
    return { success: false, message: "Failed to update featured state" };
  }
}
