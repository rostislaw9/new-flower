"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Eye, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/styled/Badge";
import { Button } from "@/components/styled/Button";
import { DeleteConfirmDialog } from "@/components/styled/DeleteConfirmDialog";
import { Heading, Text } from "@/components/styled/Typography";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { deletePortfolioItem } from "@/lib/actions/portfolio";
import type { PortfolioItem } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 6;

export default function PortfolioAdminPage() {
  const router = useRouter();
  const t = useTranslations("admin.portfolio");
  const actions = useTranslations("admin.common.actions");
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteItem, setDeleteItem] = useState<PortfolioItem | null>(null);
  const [_deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch("/api/portfolio");
        const data = (await response.json()) as PortfolioItem[];
        setItems(data);
      } catch {
        console.error("Failed to fetch portfolio items");
      } finally {
        setLoading(false);
      }
    };
    void fetchItems();
  }, []);

  useEffect(() => {
    setCurrentPage((prev) => {
      const nextTotalPages = Math.max(
        1,
        Math.ceil(items.length / ITEMS_PER_PAGE),
      );
      return Math.min(prev, nextTotalPages);
    });
  }, [items.length]);

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  const paginationLinkClass =
    "border border-transparent bg-transparent text-foreground hover:bg-secondary hover:text-foreground";

  async function handleDelete() {
    if (!deleteItem) return;

    setDeleting(true);
    const result = await deletePortfolioItem(deleteItem.id);

    if (result.success) {
      setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
      setDeleteItem(null);
    } else {
      alert(result.message);
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginatedItems.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
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
              <div className="flex items-start justify-between">
                <div>
                  <Heading as="h3" size="sm">
                    {item.title}
                  </Heading>
                  <Text size="sm" muted className="capitalize">
                    {item.category}
                  </Text>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="icon-borderless" variant="accent">
                    <Link
                      href={`/portfolio?category=${item.category}`}
                      target="_blank"
                    >
                      <Eye />
                    </Link>
                  </Button>
                  <Button
                    size="icon-borderless"
                    variant="accent"
                    onClick={() =>
                      router.push(`/admin/portfolio/${item.id}/edit`)
                    }
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="icon-borderless"
                    variant="destructive"
                    onClick={() => setDeleteItem(item)}
                  >
                    <Trash2 />
                  </Button>
                </div>
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

      {totalPages > 1 && (
        <>
          <Separator />
          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  aria-disabled={!canGoPrev}
                  className={cn(
                    paginationLinkClass,
                    !canGoPrev && "pointer-events-none opacity-50",
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    if (canGoPrev) {
                      setCurrentPage((prev) => prev - 1);
                    }
                  }}
                />
              </PaginationItem>
              {pages.map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={pageNumber === currentPage}
                    className={paginationLinkClass}
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  aria-disabled={!canGoNext}
                  className={cn(
                    paginationLinkClass,
                    !canGoNext && "pointer-events-none opacity-50",
                  )}
                  onClick={(event) => {
                    event.preventDefault();
                    if (canGoNext) {
                      setCurrentPage((prev) => prev + 1);
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
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

      {hasItems ? listContent : emptyState}

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
