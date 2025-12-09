// src/components/molecules/Pagination.tsx
import * as React from "react";
import { Button, Text } from "@/components/atoms";

type Props = {
  page: number; // 1-based
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
};

export function Pagination({ page, pageSize, total, onPageChange }: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < pageCount;

  return (
    <div className="flex items-center justify-between gap-3">
      <Text>
        Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)}{" "}
        of {total}
      </Text>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>
        <Text>
          {page} / {pageCount}
        </Text>
        <Button
          variant="outline"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
