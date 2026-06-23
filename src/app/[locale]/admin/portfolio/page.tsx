"use client";

import { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/styled/Badge";
import { Button } from "@/components/styled/Button";
import { DeleteConfirmDialog } from "@/components/styled/DeleteConfirmDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/styled/DropdownMenu";
import { Heading, Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { deletePortfolioItem } from "@/lib/actions/portfolio";
import type { PortfolioItem } from "@/lib/portfolio-data";

const INITIAL_BATCH = 8;
const LOAD_MORE_BATCH = 6;

export default function PortfolioAdminPage() {
  const router = useRouter();
  const t = useTranslations("admin.portfolio");
  const portfolioMenu = useTranslations("admin.portfolio.actions");
  const actions = useTranslations("admin.common.actions");
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteItem, setDeleteItem] = useState<PortfolioItem | null>(null);
  const [_deleting, setDeleting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/portfolio");
        const data = (await response.json()) as PortfolioItem[];
        setItems(data);
        setVisibleCount(Math.min(data.length, INITIAL_BATCH));
      } catch {
        console.error("Failed to fetch portfolio items");
      } finally {
        setLoading(false);
      }
    };
    void fetchItems();
  }, []);

  useEffect(() => {
    setVisibleCount((prev) => {
      if (items.length === 0) {
        return INITIAL_BATCH;
      }
      return Math.min(Math.max(prev, INITIAL_BATCH), items.length);
    });
  }, [items.length]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    if (visibleCount >= items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) {
          return;
        }
        if (entry.isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(items.length, prev + LOAD_MORE_BATCH),
          );
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [items.length, visibleCount]);

  const visibleItems = items.slice(0, visibleCount);

  async function handleDelete() {
    if (!deleteItem) return;

    setDeleting(true);
    const result = await deletePortfolioItem(deleteItem.id);

    if (result.success) {
      setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
      setDeleteItem(null);
      toast.success(t("alerts.deleteSuccess"));
    } else {
      toast.error(result.message || t("alerts.deleteFailed"));
    }
    setDeleting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin" />
        <Text muted>{t("loading")}</Text>
      </div>
    );
  }

  const hasItems = items.length > 0;

  const emptyState = (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>
          <Text muted>{t("noItems")}</Text>
        </EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="accent" href="/admin/portfolio/new">
          {t("addFirstButton")}
        </Button>
      </EmptyContent>
    </Empty>
  );

  const listContent = (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleItems.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden rounded-xl border-border/60 bg-card/60 shadow-lg"
          >
            <div className="relative aspect-[3/4]">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 480px) 45vw, (max-width: 768px) 30vw, 20vw"
                className="object-cover"
                loading="eager"
              />
              {item.featured && (
                <Badge variant="accent" className="absolute left-2 top-2">
                  {t("featured")}
                </Badge>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Heading serif={false} as="h3" size="sm">
                    {item.title}
                  </Heading>
                  <Text size="sm" muted className="capitalize">
                    {item.category}
                  </Text>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon-borderless"
                      variant="ghost"
                      aria-label={portfolioMenu("menuLabel")}
                      className="-mr-2 -mt-2"
                    >
                      <MoreHorizontal />
                      <span className="sr-only">
                        {portfolioMenu("menuLabel")}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/portfolio?category=${item.category}`}
                        target="_blank"
                      >
                        <Eye className="h-4 w-4" />
                        <span>{portfolioMenu("viewPublic")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        router.push(`/admin/portfolio/${item.id}/edit`);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      <span>{portfolioMenu("edit")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault();
                        setDeleteItem(item);
                      }}
                      className="text-destructive focus:bg-destructive focus:text-primary-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{portfolioMenu("delete")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {item.description && (
                <Text size="sm" muted className="mt-2 line-clamp-2">
                  {item.description}
                </Text>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {visibleCount < items.length ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title={t("title")}
        subtitle={t("description")}
        actions={
          hasItems ? (
            <Button variant="accent" href="/admin/portfolio/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("addButton")}
            </Button>
          ) : undefined
        }
      />

      {hasItems ? (
        <>
          {listContent}
          <div ref={loadMoreRef} aria-hidden className="h-1 w-full" />
        </>
      ) : (
        emptyState
      )}

      <DeleteConfirmDialog
        open={!!deleteItem}
        title={t("deleteTitle")}
        description={
          deleteItem ? t("deleteConfirm", { title: deleteItem.title }) : ""
        }
        cancelLabel={actions("cancel")}
        confirmLabel={actions("delete")}
        confirmLoadingLabel={actions("deleting")}
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
}
