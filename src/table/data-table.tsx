"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  Download,
  Inbox,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "../button/button";
import { Skeleton } from "../feedback/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
  sortFn?: (a: T, b: T) => number;
}

export interface DataTableFilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  filterKey?: keyof T;
  filterOptions?: DataTableFilterOption[];
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  pageSize?: number;
  emptyMessage?: ReactNode;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  searchFilter,
  filterKey,
  filterOptions,
  selectable = false,
  onSelectionChange,
  pageSize = 10,
  emptyMessage = "No items found.",
  loading = false,
  onRowClick,
  className = "",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter by category/status chip
  const filteredByChip = useMemo(() => {
    if (!filterKey || selectedFilter === "ALL") return data;
    return data.filter((item) => String(item[filterKey]) === selectedFilter);
  }, [data, filterKey, selectedFilter]);

  // Filtered by search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return filteredByChip;
    const query = searchQuery.toLowerCase().trim();

    return filteredByChip.filter((item) => {
      if (searchFilter) {
        return searchFilter(item, query);
      }
      return Object.values(item).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(query);
      });
    });
  }, [filteredByChip, searchQuery, searchFilter]);

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredData;

    const column = columns.find((c) => c.key === sortKey);
    return [...filteredData].sort((a, b) => {
      if (column?.sortFn) {
        const res = column.sortFn(a, b);
        return sortDirection === "asc" ? res : -res;
      }
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      const comp = valA < valB ? -1 : 1;
      return sortDirection === "asc" ? comp : -comp;
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") setSortDirection("desc");
      else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const alignClass = (align?: "left" | "center" | "right") => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  // Selection handlers
  const toggleRowSelect = (id: string, row: T) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);

    const selectedRows = data.filter((item) => next.has(item.id ?? item.key));
    onSelectionChange?.(selectedRows);
  };

  const toggleSelectAll = () => {
    const next = new Set<string>();
    if (selectedIds.size < paginatedData.length) {
      paginatedData.forEach((item) => next.add(item.id ?? item.key));
    }
    setSelectedIds(next);
    const selectedRows = data.filter((item) => next.has(item.id ?? item.key));
    onSelectionChange?.(selectedRows);
  };

  const allOnPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedIds.has(item.id ?? item.key));

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Chips */}
        {filterOptions && filterOptions.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => {
                setSelectedFilter("ALL");
                setCurrentPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                selectedFilter === "ALL"
                  ? "bg-accent text-accent-fg font-semibold shadow-xs"
                  : "bg-surface-subtle text-muted hover:text-fg"
              }`}
            >
              All ({data.length})
            </button>
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setSelectedFilter(opt.value);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                  selectedFilter === opt.value
                    ? "bg-accent text-accent-fg font-semibold shadow-xs"
                    : "bg-surface-subtle text-muted hover:text-fg"
                }`}
              >
                {opt.label}
                {opt.count !== undefined && (
                  <span className="ml-1 opacity-70">({opt.count})</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Search Input */}
        {searchable && (
          <div className="relative w-full sm:w-72 flex items-center">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-border bg-surface pl-8 pr-3 py-1.5 text-xs text-fg placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
            />
          </div>
        )}
      </div>

      {/* Floating Selection Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-accent/30 bg-accent-soft px-4 py-2 text-xs text-accent animate-in fade-in duration-150">
          <span className="font-semibold">
            {selectedIds.size} {selectedIds.size === 1 ? "item" : "items"} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              leftIcon={<Download className="h-3 w-3" />}
              onClick={() => alert(`Exporting ${selectedIds.size} items`)}
            >
              Export
            </Button>
            <Button
              variant="danger"
              size="xs"
              leftIcon={<Trash2 className="h-3 w-3" />}
              onClick={() => {
                alert(`Deleted ${selectedIds.size} items`);
                setSelectedIds(new Set());
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table Primitives */}
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-10 text-center">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-border text-accent focus:ring-accent cursor-pointer"
                  aria-label="Select all rows on page"
                />
              </TableHead>
            )}

            {columns.map((col) => {
              const isSorted = sortKey === col.key;
              return (
                <TableHead
                  key={col.key}
                  style={{ width: col.width }}
                  className={`${alignClass(col.align)} select-none`}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1.5 font-semibold text-muted hover:text-fg transition-colors cursor-pointer"
                    >
                      <span>{col.header}</span>
                      {isSorted ? (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5 text-accent" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-accent" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                {selectable && (
                  <TableCell className="text-center">
                    <Skeleton className="h-4 w-4 mx-auto rounded" />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={col.key} className={alignClass(col.align)}>
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : paginatedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="py-12 text-center text-muted"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <Inbox className="h-8 w-8 text-muted/60" />
                  <p className="text-sm font-medium">{emptyMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, idx) => {
              const rowId = row.id ?? row.key ?? String(idx);
              const isSelected = selectedIds.has(rowId);

              return (
                <TableRow
                  key={rowId}
                  onClick={() => onRowClick?.(row)}
                  className={`${isSelected ? "bg-accent-soft/30" : ""} ${
                    onRowClick ? "cursor-pointer hover:bg-surface-subtle" : ""
                  }`}
                >
                  {selectable && (
                    <TableCell
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRowSelect(rowId, row)}
                        className="rounded border-border text-accent focus:ring-accent cursor-pointer"
                        aria-label={`Select row ${rowId}`}
                      />
                    </TableCell>
                  )}

                  {columns.map((col) => (
                    <TableCell key={col.key} className={alignClass(col.align)}>
                      {col.render
                        ? col.render(row, (page - 1) * pageSize + idx)
                        : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-muted">
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, sortedData.length)} of {sortedData.length}{" "}
            entries
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            <span className="text-xs font-medium text-fg px-2">
              {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="xs"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
