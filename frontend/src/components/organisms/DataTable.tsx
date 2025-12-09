import { useState, useMemo } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Pagination,
  Toolbar,
  SearchInput,
} from "@/components/molecules";
import { cn } from "@/lib/cn";

type Column<T> = {
  key: keyof T;
  header: string;
  width?: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  pageSize?: number;
  initialSort?: { key: keyof T; dir: "asc" | "desc" };
  searchableKeys?: (keyof T)[];
  title?: string;
  onRowClick?: (row: T) => void;
  className?: string;
};

export function DataTable<T extends Record<string, any>>({
  rows,
  columns,
  pageSize = 10,
  initialSort,
  searchableKeys,
  title,
  onRowClick,
  className,
}: Props<T>) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(initialSort);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const keys = searchableKeys ?? (columns.map((c) => c.key) as (keyof T)[]);
    const needle = q.toLowerCase();
    return rows.filter((r) =>
      keys.some((k) =>
        String(r[k] ?? "")
          .toLowerCase()
          .includes(needle)
      )
    );
  }, [q, rows, searchableKeys, columns]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const { key, dir } = sort;
    return [...filtered].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av == null && bv == null) return 0;
      if (av == null) return dir === "asc" ? -1 : 1;
      if (bv == null) return dir === "asc" ? 1 : -1;
      return (
        String(av).localeCompare(String(bv), undefined, { numeric: true }) *
        (dir === "asc" ? 1 : -1)
      );
    });
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const slice = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: keyof T) => {
    setPage(1);
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: "asc" };
      return { key, dir: s.dir === "asc" ? "desc" : "asc" };
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Toolbar
        onReset={() => {
          setQ("");
          setPage(1);
          setSort(initialSort);
        }}
      >
        {title ? (
          <span className="text-sm font-semibold text-gray-900 mr-2">
            {title}
          </span>
        ) : null}
        <SearchInput value={q} onChange={setQ} />
      </Toolbar>

      <div className="overflow-auto rounded-xl border bg-white">
        <Table>
          <Thead>
            <Tr>
              {columns.map((c) => {
                const isActive = sort?.key === c.key;
                return (
                  <Th key={String(c.key)} style={{ width: c.width }}>
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-1",
                        c.sortable && "cursor-pointer"
                      )}
                      onClick={() => c.sortable && toggleSort(c.key)}
                    >
                      {c.header}
                      {c.sortable ? (
                        <span aria-hidden className="text-xs">
                          {isActive ? (sort!.dir === "asc" ? "▲" : "▼") : "↕"}
                        </span>
                      ) : null}
                    </button>
                  </Th>
                );
              })}
            </Tr>
          </Thead>
          <Tbody>
            {slice.map((row: T, i: number) => (
              <Tr
                key={i}
                className={cn(onRowClick && "cursor-pointer hover:bg-gray-50")}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((c) => (
                  <Td key={String(c.key)}>
                    {c.render ? c.render(row) : String(row[c.key] ?? "")}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={sorted.length}
        onPageChange={setPage}
      />
    </div>
  );
}
