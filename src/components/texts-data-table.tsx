"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
  IconSearch,
  IconFilter,
  IconDownload,
  IconRefresh,
  IconCalendar,
  IconX,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface TextMessage {
  id: number;
  date_time: string;
  sender: string;
  message: string;
  sentiment: string;
  category: string;
  tag: string;
  conflict_detected: boolean;
}

// Enhanced columns with sorting and better formatting
const columns: ColumnDef<TextMessage>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-gray-600"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-gray-600"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date_time",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-gray-300 hover:text-gray-100 hover:bg-gray-800 p-0"
        >
          Date & Time
          {column.getIsSorted() === "asc" ? (
            <IconSortAscending className="ml-1 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconSortDescending className="ml-1 h-4 w-4" />
          ) : null}
        </Button>
      )
    },
    cell: ({ row }) => {
      const dateTime = new Date(row.getValue("date_time"));
      return (
        <div className="text-sm">
          <div className="text-gray-200 font-medium">{dateTime.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}</div>
          <div className="text-gray-400 text-xs">{dateTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</div>
        </div>
      );
    },
    sortingFn: "datetime",
  },
  {
    accessorKey: "sender",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-gray-300 hover:text-gray-100 hover:bg-gray-800 p-0"
        >
          Sender
          {column.getIsSorted() === "asc" ? (
            <IconSortAscending className="ml-1 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconSortDescending className="ml-1 h-4 w-4" />
          ) : null}
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium text-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
            {(row.getValue("sender") as string).charAt(0).toUpperCase()}
          </div>
          {row.getValue("sender")}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "message",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-gray-300 hover:text-gray-100 hover:bg-gray-800 p-0"
        >
          Message
          {column.getIsSorted() === "asc" ? (
            <IconSortAscending className="ml-1 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconSortDescending className="ml-1 h-4 w-4" />
          ) : null}
        </Button>
      )
    },
    cell: ({ row }) => {
      const message = row.getValue("message") as string;
      
      return (
        <div className="max-w-[400px]">
          <p className="text-gray-300 whitespace-pre-wrap break-words">
            {message}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "sentiment",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-gray-300 hover:text-gray-100 hover:bg-gray-800 p-0"
        >
          Sentiment
          {column.getIsSorted() === "asc" ? (
            <IconSortAscending className="ml-1 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconSortDescending className="ml-1 h-4 w-4" />
          ) : null}
        </Button>
      )
    },
    cell: ({ row }) => {
      const sentiment = row.getValue("sentiment") as string;
      const config = {
        positive: { 
          className: "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30",
          icon: "😊"
        },
        negative: { 
          className: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
          icon: "😔"
        },
        neutral: { 
          className: "bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30",
          icon: "😐"
        }
      };
      const { className, icon } = config[sentiment as keyof typeof config] || config.neutral;
      
      return (
        <Badge className={`${className} cursor-pointer transition-all`}>
          <span className="mr-1">{icon}</span>
          {sentiment}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-gray-300 hover:text-gray-100 hover:bg-gray-800 p-0"
        >
          Category
          {column.getIsSorted() === "asc" ? (
            <IconSortAscending className="ml-1 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconSortDescending className="ml-1 h-4 w-4" />
          ) : null}
        </Button>
      )
    },
    cell: ({ row }) => (
      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30 cursor-pointer transition-all">
        {row.getValue("category")}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "tag",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-gray-300 hover:text-gray-100 hover:bg-gray-800 p-0"
        >
          Tag
          {column.getIsSorted() === "asc" ? (
            <IconSortAscending className="ml-1 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconSortDescending className="ml-1 h-4 w-4" />
          ) : null}
        </Button>
      )
    },
    cell: ({ row }) => (
      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 cursor-pointer transition-all">
        {row.getValue("tag")}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "conflict_detected",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-gray-300 hover:text-gray-100 hover:bg-gray-800 p-0"
        >
          Conflict
          {column.getIsSorted() === "asc" ? (
            <IconSortAscending className="ml-1 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <IconSortDescending className="ml-1 h-4 w-4" />
          ) : null}
        </Button>
      )
    },
    cell: ({ row }) => {
      const hasConflict = row.getValue("conflict_detected") as boolean;
      return (
        <Badge className={`${hasConflict 
          ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30" 
          : "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"} 
          cursor-pointer transition-all`}>
          {hasConflict ? "⚠️ Yes" : "✓ No"}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      const hasConflict = row.getValue(id) as boolean;
      return value === "all" || (value === "yes" && hasConflict) || (value === "no" && !hasConflict);
    },
  },
];

interface TextsDataTableProps {
  data: TextMessage[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function TextsDataTable({ 
  data, 
  loading = false, 
  pagination,
  onPageChange,
  onPageSizeChange
}: TextsDataTableProps) {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [rowSelection, setRowSelection] = React.useState({})
  
  // Advanced filter states
  const [dateRange, setDateRange] = React.useState<{ start: string; end: string }>({ start: "", end: "" })
  const [selectedSentiments, setSelectedSentiments] = React.useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [conflictFilter, setConflictFilter] = React.useState<string>("all")
  const [selectedSenders, setSelectedSenders] = React.useState<string[]>([])
  
  // Get unique values for filters
  const uniqueSenders = React.useMemo(() => 
    Array.from(new Set(data.map(item => item.sender))).sort(),
    [data]
  );
  
  const uniqueCategories = React.useMemo(() => 
    Array.from(new Set(data.map(item => item.category))).sort(),
    [data]
  );
  
  const uniqueTags = React.useMemo(() => 
    Array.from(new Set(data.map(item => item.tag))).sort(),
    [data]
  );

  // Apply filters
  React.useEffect(() => {
    const filters: ColumnFiltersState = [];
    
    if (selectedSentiments.length > 0) {
      filters.push({ id: "sentiment", value: selectedSentiments });
    }
    
    if (selectedCategories.length > 0) {
      filters.push({ id: "category", value: selectedCategories });
    }
    
    if (selectedTags.length > 0) {
      filters.push({ id: "tag", value: selectedTags });
    }
    
    if (selectedSenders.length > 0) {
      filters.push({ id: "sender", value: selectedSenders });
    }
    
    if (conflictFilter !== "all") {
      filters.push({ id: "conflict_detected", value: conflictFilter });
    }
    
    setColumnFilters(filters);
  }, [selectedSentiments, selectedCategories, selectedTags, conflictFilter, selectedSenders]);

  // Filter data by date range
  const filteredData = React.useMemo(() => {
    if (!dateRange.start && !dateRange.end) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item.date_time);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      
      return true;
    });
  }, [data, dateRange]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
  })

  // Export functions
  const exportToCSV = () => {
    const headers = columns
      .filter(col => col.id !== "select")
      .map(col => col.header as string)
      .join(",");
    
    const rows = table.getFilteredRowModel().rows.map(row => {
      return columns
        .filter(col => col.id !== "select")
        .map(col => {
          const accessorKey = 'accessorKey' in col ? col.accessorKey as string : col.id;
          if (!accessorKey) return '';
          const value = row.getValue(accessorKey);
          return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(",");
    });
    
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `messages_export_${new Date().toISOString()}.csv`;
    a.click();
  };

  const clearAllFilters = () => {
    setGlobalFilter("");
    setDateRange({ start: "", end: "" });
    setSelectedSentiments([]);
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedSenders([]);
    setConflictFilter("all");
    setColumnFilters([]);
    setSorting([]);
  };

  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (globalFilter) count++;
    if (dateRange.start || dateRange.end) count++;
    if (selectedSentiments.length > 0) count++;
    if (selectedCategories.length > 0) count++;
    if (selectedTags.length > 0) count++;
    if (selectedSenders.length > 0) count++;
    if (conflictFilter !== "all") count++;
    return count;
  }, [globalFilter, dateRange, selectedSentiments, selectedCategories, selectedTags, selectedSenders, conflictFilter]);

  // Stats calculation
  const stats = React.useMemo(() => {
    const filtered = table.getFilteredRowModel().rows;
    return {
      total: filtered.length,
      positive: filtered.filter(row => row.getValue("sentiment") === "positive").length,
      negative: filtered.filter(row => row.getValue("sentiment") === "negative").length,
      neutral: filtered.filter(row => row.getValue("sentiment") === "neutral").length,
      conflicts: filtered.filter(row => row.getValue("conflict_detected") === true).length,
    };
  }, [table]);

  return (
    <div className="w-full space-y-4 bg-gray-900 p-6 rounded-lg">
      {/* Header with title and actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Messages Dashboard</h2>
          <p className="text-gray-400 mt-1">
            Analyze and filter your conversation history with advanced search capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
          >
            <IconRefresh className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={table.getFilteredRowModel().rows.length === 0}
            className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
          >
            <IconDownload className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Total Messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-100">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Positive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.positive}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Negative</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.negative}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Neutral</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400">{stats.neutral}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardDescription className="text-gray-400">Conflicts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.conflicts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Main search bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search messages, senders, categories..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-10 bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400 focus:border-gray-600"
            />
          </div>
          
          {/* Advanced filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700"
              >
                <IconFilter className="h-4 w-4 mr-1" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-800 border-gray-700">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-200">Advanced Filters</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    Clear all
                  </Button>
                </div>
                
                <Separator className="bg-gray-700" />
                
                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      placeholder="Start date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-gray-200"
                    />
                    <Input
                      type="date"
                      placeholder="End date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-gray-200"
                    />
                  </div>
                </div>
                
                {/* Sender Filter */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Sender</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {uniqueSenders.map(sender => (
                      <div key={sender} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sender-${sender}`}
                          checked={selectedSenders.includes(sender)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSenders([...selectedSenders, sender]);
                            } else {
                              setSelectedSenders(selectedSenders.filter(s => s !== sender));
                            }
                          }}
                          className="border-gray-600"
                        />
                        <label
                          htmlFor={`sender-${sender}`}
                          className="text-sm text-gray-300 cursor-pointer"
                        >
                          {sender}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Sentiment Filter */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Sentiment</Label>
                  <div className="space-y-2">
                    {["positive", "negative", "neutral"].map(sentiment => (
                      <div key={sentiment} className="flex items-center space-x-2">
                        <Checkbox
                          id={`sentiment-${sentiment}`}
                          checked={selectedSentiments.includes(sentiment)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSentiments([...selectedSentiments, sentiment]);
                            } else {
                              setSelectedSentiments(selectedSentiments.filter(s => s !== sentiment));
                            }
                          }}
                          className="border-gray-600"
                        />
                        <label
                          htmlFor={`sentiment-${sentiment}`}
                          className="text-sm text-gray-300 cursor-pointer capitalize"
                        >
                          {sentiment}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Category Filter */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Category</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {uniqueCategories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            }
                          }}
                          className="border-gray-600"
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="text-sm text-gray-300 cursor-pointer"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Conflict Filter */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Conflict Status</Label>
                  <Select value={conflictFilter} onValueChange={setConflictFilter}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all" className="text-gray-200">All</SelectItem>
                      <SelectItem value="yes" className="text-gray-200">With Conflicts</SelectItem>
                      <SelectItem value="no" className="text-gray-200">Without Conflicts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700">
                <IconLayoutColumns className="h-4 w-4 mr-1" />
                Columns
                <IconChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
              <DropdownMenuLabel className="text-gray-300">Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-gray-200 focus:bg-gray-700 focus:text-gray-100"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id.replace(/_/g, " ")}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {globalFilter && (
              <Badge className="bg-gray-700 text-gray-300 border-gray-600">
                Search: &ldquo;{globalFilter}&rdquo;
                <button
                  onClick={() => setGlobalFilter("")}
                  className="ml-1 hover:text-gray-100"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(dateRange.start || dateRange.end) && (
              <Badge className="bg-gray-700 text-gray-300 border-gray-600">
                Date: {dateRange.start || "Any"} - {dateRange.end || "Any"}
                <button
                  onClick={() => setDateRange({ start: "", end: "" })}
                  className="ml-1 hover:text-gray-100"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedSentiments.length > 0 && (
              <Badge className="bg-gray-700 text-gray-300 border-gray-600">
                Sentiment: {selectedSentiments.join(", ")}
                <button
                  onClick={() => setSelectedSentiments([])}
                  className="ml-1 hover:text-gray-100"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedCategories.length > 0 && (
              <Badge className="bg-gray-700 text-gray-300 border-gray-600">
                Categories: {selectedCategories.join(", ")}
                <button
                  onClick={() => setSelectedCategories([])}
                  className="ml-1 hover:text-gray-100"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {conflictFilter !== "all" && (
              <Badge className="bg-gray-700 text-gray-300 border-gray-600">
                Conflicts: {conflictFilter === "yes" ? "Yes" : "No"}
                <button
                  onClick={() => setConflictFilter("all")}
                  className="ml-1 hover:text-gray-100"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {/* Table */}
      <div className="rounded-md border border-gray-700 bg-gray-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-700 hover:bg-gray-800">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-gray-300">
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
            {loading ? (
              <TableRow className="hover:bg-gray-800">
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-400">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                    <span className="ml-2">Loading messages...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-gray-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-gray-800">
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-400">
                  No messages found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination and selected actions */}
      <div className="space-y-4">
        {/* Selected rows actions */}
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center justify-between px-2 py-2 bg-gray-800 rounded-md">
            <div className="text-sm text-gray-400">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Export selected rows
                  const selectedData = table.getFilteredSelectedRowModel().rows.map(row => row.original);
                  console.log("Export selected:", selectedData);
                  // Implement export logic
                }}
                className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
              >
                Export Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.toggleAllRowsSelected(false)}
                className="bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
        
        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between px-2">
            <div className="flex-1 text-sm text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} messages
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <Label htmlFor="rows-per-page" className="text-sm font-medium text-gray-300">
                  Rows per page
                </Label>
                <Select
                  value={`${pagination.limit}`}
                  onValueChange={(value) => onPageSizeChange?.(Number(value))}
                >
                  <SelectTrigger size="sm" className="h-8 w-[70px] bg-gray-800 border-gray-700 text-gray-200" id="rows-per-page">
                    <SelectValue placeholder={pagination.limit} />
                  </SelectTrigger>
                  <SelectContent side="top" className="bg-gray-800 border-gray-700">
                    {[10, 25, 50, 100, 200].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`} className="text-gray-200 focus:bg-gray-700">
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium text-gray-300">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                  onClick={() => onPageChange?.(1)}
                  disabled={pagination.page === 1}
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                  onClick={() => onPageChange?.(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0 bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                  onClick={() => onPageChange?.(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                  onClick={() => onPageChange?.(pagination.totalPages)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}