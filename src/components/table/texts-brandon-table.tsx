"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"

import { useTextsBrandonPaginated } from "@/hooks/useTextsBrandon"
import { TextsBrandon, groupByMonth, groupBySender, formatDate } from "@/types/texts-brandon"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLoader,
  IconSearch,
} from "@tabler/icons-react"

const columns: ColumnDef<TextsBrandon>[] = [
  {
    accessorKey: "date_time",
    header: "Date & Time",
    cell: ({ row }) => {
      const dateTime = row.original.date_time;
      if (!dateTime) return <span className="text-muted-foreground">—</span>;
      
      const date = new Date(dateTime);
      return (
        <div className="w-40">
          <div className="font-medium">{format(date, "MMM d, yyyy")}</div>
          <div className="text-sm text-muted-foreground">{format(date, "h:mm a")}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "sender",
    header: "Sender",
    cell: ({ row }) => (
      <div className="w-24">
        <Badge variant={row.original.sender === "You" ? "default" : "secondary"}>
          {row.original.sender || "Unknown"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <div className="max-w-[500px] truncate">
        {row.original.message || "—"}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original.category;
      if (!category) return <span className="text-muted-foreground">—</span>;
      
      const variantMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
        "Affectionate": "default",
        "Conflict": "destructive",
        "Neutral": "outline",
        "Important": "secondary",
      };
      
      return (
        <Badge variant={variantMap[category] || "outline"}>
          {category}
        </Badge>
      );
    },
  },
  {
    accessorKey: "sentiment",
    header: "Sentiment",
    cell: ({ row }) => {
      const sentiment = row.original.sentiment;
      if (!sentiment) return <span className="text-muted-foreground">—</span>;
      
      const colorMap: Record<string, string> = {
        "positive": "text-green-600 bg-green-50 border-green-200",
        "negative": "text-red-600 bg-red-50 border-red-200",
        "neutral": "text-gray-600 bg-gray-50 border-gray-200",
      };
      
      return (
        <Badge variant="outline" className={colorMap[sentiment.toLowerCase()] || "text-gray-600"}>
          {sentiment}
        </Badge>
      );
    },
  },
  {
    accessorKey: "conflict_detected",
    header: "Conflict",
    cell: ({ row }) => {
      const hasConflict = row.original.conflict_detected;
      if (hasConflict === null || hasConflict === undefined) return <span className="text-muted-foreground">—</span>;
      
      return hasConflict ? (
        <Badge variant="destructive">Conflict</Badge>
      ) : (
        <Badge variant="outline" className="text-green-600">Clear</Badge>
      );
    },
  },
  {
    accessorKey: "tag",
    header: "Tag",
    cell: ({ row }) => (
      <div className="text-muted-foreground">
        {row.original.tag || "—"}
      </div>
    ),
  },
]

interface TextsBrandonTableProps {
  initialFilters?: {
    sender?: string;
    search?: string;
    from?: string;
    to?: string;
  };
}

export function TextsBrandonTable({ initialFilters = {} }: TextsBrandonTableProps) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(50);
  const [search, setSearch] = React.useState(initialFilters.search || "");
  const [sender, setSender] = React.useState(initialFilters.sender || "");
  const [dateFrom, setDateFrom] = React.useState(initialFilters.from || "");
  const [dateTo, setDateTo] = React.useState(initialFilters.to || "");
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = React.useState(search);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);
  
  const { data, pagination, isLoading, isError, currentPage, totalPages } = useTextsBrandonPaginated(
    page,
    pageSize,
    {
      search: debouncedSearch || null,
      sender: sender || null,
      from: dateFrom || null,
      to: dateTo || null,
    }
  );

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  })

  // Chart data
  const chartData = React.useMemo(() => groupByMonth(data), [data]);
  const senderStats = React.useMemo(() => groupBySender(data), [data]);

  const handleApplyFilters = () => {
    setPage(1); // Reset to first page when applying filters
  };

  const handleClearFilters = () => {
    setSearch("");
    setSender("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <Tabs defaultValue="table" className="w-full">
      <div className="flex items-center justify-between px-4 lg:px-6 mb-4">
        <TabsList>
          <TabsTrigger value="table">Messages</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="table" className="space-y-4">
        {/* Filters */}
        <Card className="mx-4 lg:mx-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter messages by sender, date, or content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Messages</Label>
                <div className="relative">
                  <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sender">Sender</Label>
                <Select value={sender} onValueChange={setSender}>
                  <SelectTrigger id="sender">
                    <SelectValue placeholder="All senders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All senders</SelectItem>
                    <SelectItem value="You">You</SelectItem>
                    <SelectItem value="Brandon">Brandon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date-from">From Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date-to">To Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleApplyFilters} size="sm">
                Apply Filters
              </Button>
              <Button onClick={handleClearFilters} variant="outline" size="sm">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <div className="mx-4 lg:mx-6 rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <IconLoader className="h-6 w-6 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Error loading messages. Please try again.
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No messages found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 lg:px-6">
          <div className="text-sm text-muted-foreground">
            {pagination && (
              <>
                Showing {((currentPage - 1) * pageSize) + 1} to{" "}
                {Math.min(currentPage * pageSize, pagination.total)} of{" "}
                {pagination.total} messages
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <Label htmlFor="page-size" className="text-sm">Rows per page</Label>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-8 w-[70px]" id="page-size">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
              >
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center justify-center text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4 px-4 lg:px-6">
        {/* Message Frequency Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Message Frequency Over Time</CardTitle>
            <CardDescription>Number of messages per month</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => {
                      const date = new Date(value + "-01");
                      return format(date, "MMM yyyy");
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => {
                      const date = new Date(value + "-01");
                      return format(date, "MMMM yyyy");
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sender Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Messages by Sender</CardTitle>
              <CardDescription>Distribution of messages</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <div className="space-y-4">
                  {senderStats.map((stat) => (
                    <div key={stat.sender} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{stat.sender}</span>
                        <span className="text-sm text-muted-foreground">
                          {stat.count} ({stat.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary Statistics</CardTitle>
              <CardDescription>Overview of your messages</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Messages</span>
                    <span className="text-2xl font-bold">{pagination?.total || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Date Range</span>
                    <span className="text-sm">
                      {data.length > 0
                        ? `${formatDate(data[data.length - 1].date_time)} - ${formatDate(data[0].date_time)}`
                        : "No data"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average per Day</span>
                    <span className="text-sm">
                      {data.length > 0 && pagination
                        ? Math.round(pagination.total / 365).toLocaleString()
                        : "0"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}