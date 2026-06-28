import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Button } from "./button";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Skeleton } from "./skeleton";

export interface ColumnDef<T> {
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  className?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
  keyExtractor: (item: T) => string | number;
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No results found.",
  pagination,
  onPageChange,
  keyExtractor,
}: DataTableProps<T>) {
  return (
    <div className="w-full space-y-4">
      {/* Table Container - Rounded, borders, shadow */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-950">
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow className="hover:bg-transparent border-b-slate-200 dark:border-b-slate-800">
                {columns.map((col, i) => (
                  <TableHead
                    key={i}
                    className={`h-11 font-medium text-slate-500 dark:text-slate-400 ${col.className || ""}`}
                  >
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: pagination?.limit || 5 }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`} className="border-b-slate-100 dark:border-b-slate-800/50 hover:bg-transparent">
                    {columns.map((col, colIndex) => (
                      <TableCell key={colIndex} className={col.className}>
                        <Skeleton className="h-5 w-full max-w-[200px] rounded-md" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                // Empty State
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center align-middle"
                  >
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Inbox className="h-8 w-8 mb-2 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-medium">{emptyMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // Data Rows
                data.map((item) => (
                  <TableRow
                    key={keyExtractor(item)}
                    className="group border-b-slate-100 dark:border-b-slate-800/50 transition-colors duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-900/50 cursor-default"
                  >
                    {columns.map((col, i) => (
                      <TableCell key={i} className={`py-3 ${col.className || ""}`}>
                        {col.cell(item)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3 sm:px-6 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex flex-1 items-center justify-between sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={!pagination.hasPrevious || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={!pagination.hasNext || isLoading}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Showing{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {Math.min(pagination.page * pagination.limit, pagination.totalItems)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {pagination.totalItems}
                  </span>{" "}
                  results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 lg:flex"
                  onClick={() => onPageChange?.(pagination.page - 1)}
                  disabled={!pagination.hasPrevious || isLoading}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 lg:flex"
                  onClick={() => onPageChange?.(pagination.page + 1)}
                  disabled={!pagination.hasNext || isLoading}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
