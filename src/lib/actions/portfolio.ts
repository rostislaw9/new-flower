"use server";

import { revalidatePath } from "next/cache";

import { deleteFromCloudinary, extractPublicIdFromUrl } from "@/lib/cloudinary";
import {
  PORTFOLIO_CATEGORIES,
  type PortfolioCategory,
} from "@/lib/portfolio-data";
import { prisma } from "@/lib/prisma";

export type PortfolioActionResult =
  | { success: true; id?: string }
  | { success: false; message: string };

export interface PortfolioBulkCreateItem {
  title: string;
  description?: string | null;
  imageUrl: string;
  category: PortfolioCategory;
  featured?: boolean;
  displayOrder?: number;
  width?: number;
  height?: number;
}

export type PortfolioBulkActionResult =
  | { success: true; count: number }
  | { success: false; message: string };

export async function createPortfolioItem(
  formData: FormData,
): Promise<PortfolioActionResult> {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const imageUrl = formData.get("imageUrl") as string;
    const category = formData.get("category") as string;
    const featured = formData.get("featured") === "on";
    const displayOrder = parseInt(formData.get("displayOrder") as string) || 0;
    const width = parseInt(formData.get("width") as string) || 800;
    const height = parseInt(formData.get("height") as string) || 600;

    if (!title || !imageUrl || !category) {
      return {
        success: false,
        message: "Title, image URL, and category are required",
      };
    }

    const item = await prisma.portfolioItem.create({
      data: {
        title,
        description,
        imageUrl,
        category,
        featured,
        displayOrder,
        width,
        height,
      },
    });

    revalidatePath("/portfolio");
    revalidatePath("/admin/portfolio");

    return { success: true, id: item.id };
  } catch (error) {
    console.error("[createPortfolioItem] Error:", error);
    return { success: false, message: "Failed to create portfolio item" };
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
    const featured = formData.get("featured") === "on";
    const displayOrder = parseInt(formData.get("displayOrder") as string) || 0;

    if (!title || !imageUrl || !category) {
      return {
        success: false,
        message: "Title, image URL, and category are required",
      };
    }

    await prisma.portfolioItem.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        category,
        featured,
        displayOrder,
      },
    });

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
      const publicId = extractPublicIdFromUrl(item.imageUrl);
      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (cloudinaryError) {
          console.error(
            "[deletePortfolioItem] Cloudinary delete error:",
            cloudinaryError,
          );
        }
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

export async function createPortfolioItemsBulk(
  items: PortfolioBulkCreateItem[],
): Promise<PortfolioBulkActionResult> {
  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, message: "No portfolio items provided" };
  }

  const prepared = items.map((item, index) => {
    const title = item.title?.trim() ?? "";
    const imageUrl = item.imageUrl?.trim() ?? "";
    const description = item.description?.trim() || null;
    const featured = Boolean(item.featured);
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
        Omit<PortfolioBulkCreateItem, "category"> & {
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
    console.error("[createPortfolioItemsBulk] Error:", error);
    return {
      success: false,
      message: "Failed to create portfolio items",
    };
  }
}
