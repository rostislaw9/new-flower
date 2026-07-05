"use client";

import { useCallback, useMemo, useState } from "react";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { Check, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/styled/Button";
import { Text } from "@/components/styled/Typography";
import { uploadToCloudinaryAction } from "@/lib/actions/upload";
import { cn } from "@/lib/utils";

interface ImageUpload {
  file: File | null;
  preview: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string | undefined;
  url?: string | undefined;
  publicId?: string | undefined;
  width?: number | undefined;
  height?: number | undefined;
}

interface ImageUploaderProps {
  folder: string;
  onUploadComplete?: (
    data: { url: string; width: number; height: number }[],
  ) => void;
  onUploadedUrlsChange?: (urls: Set<string>) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  showPreviewGrid?: boolean;
  useOverwrite?: boolean;
  keepUploadedImages?: boolean;
  initialUrls?: string[];
}

export function ImageUploader({
  folder,
  onUploadComplete,
  onUploadedUrlsChange,
  maxFiles = 10,
  allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"],
  showPreviewGrid = true,
  useOverwrite = false,
  keepUploadedImages = false,
  initialUrls = [],
}: ImageUploaderProps) {
  const [images, setImages] = useState<ImageUpload[]>(() =>
    initialUrls.filter(Boolean).map((url) => ({
      file: null,
      preview: url,
      uploading: false,
      uploaded: true,
      url,
    })),
  );
  const [isDragging, setIsDragging] = useState(false);
  const t = useTranslations("admin.imageUploader");
  const sizeLimitMb = 10;

  const formattedTypes = useMemo(() => {
    const formatType = (type: string) => {
      if (type.startsWith("image/")) {
        const subtype = type.split("/")[1] ?? type;
        return subtype === "jpeg" ? "JPG" : subtype.toUpperCase();
      }
      return type.toUpperCase();
    };
    return allowedTypes.map(formatType).join(", ");
  }, [allowedTypes]);

  const uploadImages = useCallback(
    async (images: ImageUpload[]) => {
      const uploadPromises = images.map(async (image) => {
        if (image.uploaded) return;

        setImages((prev) =>
          prev.map((img) =>
            img.file === image.file ? { ...img, uploading: true } : img,
          ),
        );

        try {
          const result = await uploadToCloudinaryAction(
            image.file!,
            folder,
            useOverwrite,
          );

          if (result.success && result.data) {
            const data = result.data;
            const uploadedData = {
              url: data.url,
              width: data.width,
              height: data.height,
            };

            setImages((prev) =>
              prev.map((img) =>
                img.file === image.file
                  ? {
                      ...img,
                      uploading: false,
                      uploaded: true,
                      url: data.url,
                      publicId: data.publicId,
                      width: data.width,
                      height: data.height,
                    }
                  : img,
              ),
            );

            onUploadComplete?.([uploadedData]);
            onUploadedUrlsChange?.(new Set([data.url]));

            if (!keepUploadedImages) {
              setImages((prev) =>
                prev.filter((img) => img.file !== image.file),
              );
            }
          } else {
            setImages((prev) =>
              prev.map((img) =>
                img.file === image.file
                  ? {
                      ...img,
                      uploading: false,
                      error: result.error || t("alerts.uploadFailed"),
                    }
                  : img,
              ),
            );
          }
        } catch {
          setImages((prev) =>
            prev.map((img) =>
              img.file === image.file
                ? {
                    ...img,
                    uploading: false,
                    error: t("alerts.uploadFailed"),
                  }
                : img,
            ),
          );
        }
      });

      await Promise.all(uploadPromises);
    },
    [
      folder,
      useOverwrite,
      t,
      onUploadComplete,
      onUploadedUrlsChange,
      keepUploadedImages,
    ],
  );

  const handleFiles = useCallback(
    (filesOrInput: FileList | HTMLInputElement | null) => {
      const files =
        filesOrInput instanceof FileList ? filesOrInput : filesOrInput?.files;
      const inputElement =
        filesOrInput instanceof HTMLInputElement ? filesOrInput : undefined;
      if (!files) return;

      const newFiles = Array.from(files).filter((file) => {
        if (!allowedTypes.includes(file.type)) {
          toast.error(t("alerts.invalidType.title", { file: file.name }), {
            description: t("alerts.invalidType.description"),
          });
          return false;
        }
        if (file.size > sizeLimitMb * 1024 * 1024) {
          toast.error(
            t("alerts.fileTooLarge.title", {
              file: file.name,
            }),
            {
              description: t("alerts.fileTooLarge.description", {
                size: sizeLimitMb,
              }),
            },
          );
          return false;
        }
        return true;
      });

      if (images.length + newFiles.length > maxFiles) {
        toast.error(t("alerts.maxFiles", { count: maxFiles }));
        return;
      }

      const newImages: ImageUpload[] = newFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        uploading: false,
        uploaded: false,
        url: undefined,
        publicId: undefined,
      }));

      setImages((prev) => [...prev, ...newImages]);

      // Clear input value so same file can be selected again
      if (inputElement) {
        inputElement.value = "";
      }

      if (!showPreviewGrid) {
        uploadImages(newImages);
      }
    },
    [
      images.length,
      maxFiles,
      allowedTypes,
      sizeLimitMb,
      t,
      showPreviewGrid,
      uploadImages,
    ],
  );

  const removeImage = (index: number) => {
    setImages((prev) => {
      const img = prev[index];
      if (img?.preview) {
        URL.revokeObjectURL(img.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const allUploaded = images.length > 0 && images.every((img) => img.uploaded);
  const isUploading = images.some((img) => img.uploading);

  const fileInputId = useMemo(() => `file-input-${Math.random()}`, []);

  const dropSpecs = useMemo(() => {
    return t("dropzone.specs", {
      count: maxFiles,
      size: sizeLimitMb,
      types: formattedTypes,
    });
  }, [formattedTypes, maxFiles, sizeLimitMb, t]);

  return (
    <div className="flex flex-col gap-4">
      {/* Drop Zone */}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-foreground bg-foreground/5"
            : "hover:bg-foreground/2 border-border hover:border-foreground/30",
        )}
      >
        <input
          id={fileInputId}
          type="file"
          multiple
          accept={allowedTypes.join(",")}
          onChange={(e) => handleFiles(e.target)}
          className="hidden"
        />
        {isUploading && !showPreviewGrid ? (
          <>
            <Loader2 className="mx-auto mb-2 animate-spin text-muted-foreground" />
            <Text muted>{t("actions.uploading.title")}</Text>
            <Text size="xs" muted>
              {t("actions.uploading.hint")}
            </Text>
          </>
        ) : (
          <>
            <Upload className="mx-auto mb-2 text-muted-foreground" />
            <Text muted>{t("dropzone.hint.action")}</Text>
            <Text size="xs" muted>
              {dropSpecs}
            </Text>
          </>
        )}
      </label>

      {/* Preview Grid */}
      {showPreviewGrid && images.length > 0 && (
        <div className="flex flex-wrap gap-4 sm:gap-6">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square h-20">
              <Image
                src={image.url || image.preview}
                fill
                sizes="80px"
                alt={t("previewAlt", { index: index + 1 })}
                className="h-full w-full rounded-md object-cover"
              />

              {/* Status Overlay */}
              {image.uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}

              {image.uploaded && (
                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-green-500/50">
                  <Check className="h-6 w-6 text-white" />
                </div>
              )}

              {image.error && (
                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-red-500/50">
                  <Text size="xs" className="px-2 text-center text-white">
                    {image.error}
                  </Text>
                </div>
              )}

              {/* Remove Button */}
              <button
                onClick={() => removeImage(index)}
                className={cn(
                  "absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/80",
                  (isUploading || image.uploaded) && "hidden",
                )}
                disabled={image.uploading}
                aria-label={t("removeAria")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {showPreviewGrid && images.length > 0 && !allUploaded && (
        <Button
          onClick={() => uploadImages(images)}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="animate-spin" />
              {t("actions.uploading.title")}
            </>
          ) : (
            <>
              <Upload />
              {t("actions.upload")}
            </>
          )}
        </Button>
      )}

      {allUploaded && (
        <div className="flex items-center gap-2 text-green-600">
          <Check className="h-4 w-4" />
          <Text>{t("status.allUploaded")}</Text>
        </div>
      )}
    </div>
  );
}
