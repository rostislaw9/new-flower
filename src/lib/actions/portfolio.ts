"use server";

import { revalidatePath } from "next/cache";

import { deleteFromCloudinary, extractPublicIdFromUrl } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export type PortfolioActionResult =
  | { success: true; id?: string }
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
    // Get the item first to get the image URL
    const item = await prisma.portfolioItem.findUnique({
      where: { id },
    });

    if (!item) {
      return { success: false, message: "Item not found" };
    }

    // Delete from database
    await prisma.portfolioItem.delete({
      where: { id },
    });

    // Delete from Cloudinary
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
          // Continue even if Cloudinary delete fails
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
