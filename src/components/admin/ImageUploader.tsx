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
  file: File;
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
  maxFiles?: number;
  allowedTypes?: string[];
}

export function ImageUploader({
  folder,
  onUploadComplete,
  maxFiles = 10,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"],
}: ImageUploaderProps) {
  const [images, setImages] = useState<ImageUpload[]>([]);
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

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newFiles = Array.from(files).filter((file) => {
        if (!allowedTypes.includes(file.type)) {
          toast.error(t("alerts.invalidType", { file: file.name }));
          return false;
        }
        if (file.size > sizeLimitMb * 1024 * 1024) {
          toast.error(
            t("alerts.fileTooLarge", { file: file.name, size: sizeLimitMb }),
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
    },
    [images.length, maxFiles, allowedTypes, sizeLimitMb, t],
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

  const uploadImages = async () => {
    const uploadedData: { url: string; width: number; height: number }[] = [];

    const uploadPromises = images.map(async (image, index) => {
      if (image.uploaded) return;

      setImages((prev) =>
        prev.map((img, i) => (i === index ? { ...img, uploading: true } : img)),
      );

      try {
        const result = await uploadToCloudinaryAction(image.file, folder);

        if (result.success && result.data) {
          const data = result.data;
          uploadedData.push({
            url: data.url,
            width: data.width,
            height: data.height,
          });
          setImages((prev) =>
            prev.map((img, i) =>
              i === index
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
        } else {
          setImages((prev) =>
            prev.map((img, i) =>
              i === index
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
          prev.map((img, i) =>
            i === index
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
    onUploadComplete?.(uploadedData);
  };

  const allUploaded = images.length > 0 && images.every((img) => img.uploaded);
  const isUploading = images.some((img) => img.uploading);

  const dropHintContent = useMemo(
    () =>
      t.rich("dropzone.hint", {
        action: (chunks) => (
          <label className="cursor-pointer text-foreground hover:underline">
            <input
              type="file"
              multiple
              accept={allowedTypes.join(",")}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            {chunks}
          </label>
        ),
      }),
    [allowedTypes, handleFiles, t],
  );

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
      <div
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
          "rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-foreground bg-foreground/5"
            : "border-border hover:border-foreground/30",
        )}
      >
        <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <Text muted>{dropHintContent}</Text>
        <Text size="sm" muted>
          {dropSpecs}
        </Text>
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="flex gap-6">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square h-24">
              <Image
                src={image.url || image.preview}
                width={300}
                height={300}
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
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/80"
                disabled={image.uploading}
                aria-label={t("removeAria")}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length > 0 && !allUploaded && (
        <Button
          onClick={uploadImages}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("buttons.uploading")}
            </>
          ) : (
            t("buttons.upload")
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
