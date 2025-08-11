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
  IconX,
  IconSortAscending,
  IconSortDescending,
  IconEdit,
  IconCheck,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
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
import { Separator } from "@/components/ui/separator"

interface TextMessage {
  id: number;
  date_time: string;
  sender: string;
  message: string;
  sentiment: string;
  category: string;
  tag: string;
}

interface EditableCellProps {
  value: string;
  onSave: (value: string) => void;
  options?: string[];
  type?: 'text' | 'select';
}

function EditableCell({ value, onSave, options, type = 'text' }: EditableCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 group cursor-pointer hover:bg-blue-50 px-2 py-1 rounded border border-dashed border-gray-300 hover:border-blue-400" onClick={() => setIsEditing(true)}>
        <span className="text-xs text-gray-700 group-hover:text-blue-700">{value || 'Edit...'}</span>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-50 group-hover:opacity-100 transition-opacity h-5 w-5 p-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <IconEdit className="h-3 w-3 text-blue-500" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {type === 'select' && options ? (
        <Select value={editValue} onValueChange={setEditValue}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8 w-32"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
        />
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={handleSave}
      >
        <IconCheck className="h-3 w-3 text-green-500" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={handleCancel}
      >
        <IconX className="h-3 w-3 text-red-500" />
      </Button>
    </div>
  );
}

// Enhanced columns with sorting and inline editing
const createColumns = (
  onUpdateRow: (id: number, field: string, value: string) => void
): ColumnDef<TextMessage>[] => [
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
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-0"
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
        <div className="text-xs">
          <div className="text-gray-800">{dateTime.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}</div>
          <div className="text-gray-500 text-xs">{dateTime.toLocaleTimeString('en-US', { 
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
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-0"
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
      <div className="text-xs text-gray-900">
        {row.getValue("sender")}
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "message",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-0"
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
          <p className="text-xs text-gray-700 whitespace-pre-wrap break-words">
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
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-0"
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
      const rowId = row.original.id;
      
      return (
        <EditableCell
          value={sentiment}
          onSave={(value) => onUpdateRow(rowId, 'sentiment', value)}
          options={['positive', 'negative', 'neutral']}
          type="select"
        />
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
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-0"
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
    cell: ({ row }) => {
      const category = row.getValue("category") as string;
      const rowId = row.original.id;
      
      return (
        <EditableCell
          value={category}
          onSave={(value) => onUpdateRow(rowId, 'category', value)}
          type="text"
        />
      );
    },
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
          className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 p-0"
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
    cell: ({ row }) => {
      const tag = row.getValue("tag") as string;
      const rowId = row.original.id;
      
      return (
        <EditableCell
          value={tag}
          onSave={(value) => onUpdateRow(rowId, 'tag', value)}
          type="text"
        />
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
];

interface TextsDataTableEditableProps {
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
  onUpdateRow?: (id: number, field: string, value: string) => Promise<void>;
}

export function TextsDataTableEditable({ 
  data, 
  loading = false, 
  pagination,
  onPageChange,
  onPageSizeChange,
  onUpdateRow
}: TextsDataTableEditableProps) {
  const [localData, setLocalData] = React.useState(data);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "date_time", desc: false }])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [rowSelection, setRowSelection] = React.useState({})
  
  // Advanced filter states
  const [dateRange, setDateRange] = React.useState<{ start: string; end: string }>({ start: "", end: "" })
  const [selectedYear, setSelectedYear] = React.useState<string>("all")
  const [selectedSentiments, setSelectedSentiments] = React.useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [selectedSenders, setSelectedSenders] = React.useState<string[]>([])

  React.useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleUpdateRow = React.useCallback(async (id: number, field: string, value: string) => {
    // Update local state immediately for responsiveness
    setLocalData(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));

    // Call the parent's update function if provided
    if (onUpdateRow) {
      try {
        await onUpdateRow(id, field, value);
      } catch (error) {
        // Revert on error
        setLocalData(data);
        console.error('Failed to update row:', error);
      }
    }
  }, [data, onUpdateRow]);
  
  // Get unique values for filters
  const uniqueSenders = React.useMemo(() => 
    Array.from(new Set(localData.map(item => item.sender))).sort(),
    [localData]
  );
  
  const uniqueCategories = React.useMemo(() => 
    Array.from(new Set(localData.map(item => item.category))).sort(),
    [localData]
  );
  
  const uniqueTags = React.useMemo(() => 
    Array.from(new Set(localData.map(item => item.tag))).sort(),
    [localData]
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
    
    setColumnFilters(filters);
  }, [selectedSentiments, selectedCategories, selectedTags, selectedSenders]);

  // Filter data by date range
  const filteredData = React.useMemo(() => {
    if (!dateRange.start && !dateRange.end && selectedYear === "all") return localData;
    
    return localData.filter(item => {
      const itemDate = new Date(item.date_time);
      
      // Year filter
      if (selectedYear !== "all") {
        const itemYear = itemDate.getFullYear().toString();
        if (itemYear !== selectedYear) return false;
      }
      
      // Date range filter
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      
      return true;
    });
  }, [localData, dateRange, selectedYear]);

  const columns = React.useMemo(() => createColumns(handleUpdateRow), [handleUpdateRow]);

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
    const headers = ["Date Time", "Sender", "Message", "Sentiment", "Category", "Tag"];
    const rows = table.getFilteredRowModel().rows.map(row => {
      return [
        row.getValue("date_time"),
        row.getValue("sender"),
        row.getValue("message"),
        row.getValue("sentiment"),
        row.getValue("category"),
        row.getValue("tag")
      ].map(value => {
        return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(",");
    });
    
    const csv = [headers.join(","), ...rows].join("\n");
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
    setSelectedYear("all");
    setSelectedSentiments([]);
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedSenders([]);
    setColumnFilters([]);
    setSorting([]);
  };

  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (globalFilter) count++;
    if (dateRange.start || dateRange.end) count++;
    if (selectedYear !== "all") count++;
    if (selectedSentiments.length > 0) count++;
    if (selectedCategories.length > 0) count++;
    if (selectedTags.length > 0) count++;
    if (selectedSenders.length > 0) count++;
    return count;
  }, [globalFilter, dateRange, selectedYear, selectedSentiments, selectedCategories, selectedTags, selectedSenders]);


  return (
    <div className="w-full space-y-4 bg-white p-0 rounded-lg">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Main search bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search messages, senders, categories..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-gray-500"
            />
          </div>
          
          {/* Advanced filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
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
            <PopoverContent className="w-80 bg-white border-gray-300">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Advanced Filters</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </Button>
                </div>
                
                <Separator className="bg-gray-200" />
                
                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="text-gray-700">Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      placeholder="Start date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="bg-white border-gray-300 text-gray-900"
                    />
                    <Input
                      type="date"
                      placeholder="End date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                </div>

                {/* Year Filter */}
                <div className="space-y-2">
                  <Label className="text-gray-700">Filter by Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      <SelectItem value="all" className="text-gray-900">All Years</SelectItem>
                      {Array.from(new Set(localData.map(item => new Date(item.date_time).getFullYear())))
                        .sort((a, b) => b - a)
                        .map(year => (
                          <SelectItem key={year} value={year.toString()} className="text-gray-900">
                            {year}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
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
                          className="text-sm text-gray-700 cursor-pointer"
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
                          className="text-sm text-gray-700 cursor-pointer capitalize"
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
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Tag Filter */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Tag</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {uniqueTags.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTags([...selectedTags, tag]);
                            } else {
                              setSelectedTags(selectedTags.filter(t => t !== tag));
                            }
                          }}
                          className="border-gray-600"
                        />
                        <label
                          htmlFor={`tag-${tag}`}
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                <IconLayoutColumns className="h-4 w-4 mr-1" />
                Columns
                <IconChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-gray-300">
              <DropdownMenuLabel className="text-gray-700">Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-gray-700 focus:bg-gray-100 focus:text-gray-900"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id.replace(/_/g, " ")}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={table.getFilteredRowModel().rows.length === 0}
            className="bg-white border-gray-300 p-2 text-gray-700 hover:bg-gray-50"
>
            <IconDownload className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm p-2"
            onClick={() => window.location.reload()}
            className="bg-white border-gray-300 text-gray-700 p-2 hover:bg-gray-50">
            <IconRefresh className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
        
        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {globalFilter && (
              <Badge className="bg-gray-200 text-gray-700 border-gray-300">
                Search: {globalFilter}
                <button
                  type="button"
                  onClick={() => setGlobalFilter("")}
                  className="ml-1 hover:text-gray-900"
                  aria-label="Clear search"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(dateRange.start || dateRange.end) && (
              <Badge className="bg-gray-200 text-gray-700 border-gray-300">
                Date: {dateRange.start || "Any"} - {dateRange.end || "Any"}
                <button
                  type="button"
                  onClick={() => setDateRange({ start: "", end: "" })}
                  className="ml-1 hover:text-gray-900"
                  aria-label="Clear date range"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedYear !== "all" && (
              <Badge className="bg-gray-200 text-gray-700 border-gray-300">
                Year: {selectedYear}
                <button
                  type="button"
                  onClick={() => setSelectedYear("all")}
                  className="ml-1 hover:text-gray-900"
                  aria-label="Clear year filter"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedSentiments.length > 0 && (
              <Badge className="bg-gray-200 text-gray-700 border-gray-300">
                Sentiment: {selectedSentiments.join(", ")}
                <button
                  type="button"
                  onClick={() => setSelectedSentiments([])}
                  className="ml-1 hover:text-gray-900"
                  aria-label="Clear sentiment filter"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedCategories.length > 0 && (
              <Badge className="bg-gray-200 text-gray-700 border-gray-300">
                Categories: {selectedCategories.join(", ")}
                <button
                  type="button"
                  onClick={() => setSelectedCategories([])}
                  className="ml-1 hover:text-gray-900"
                  aria-label="Clear category filter"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedTags.length > 0 && (
              <Badge className="bg-gray-200 text-gray-700 border-gray-300">
                Tags: {selectedTags.join(", ")}
                <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className="ml-1 hover:text-gray-900"
                  aria-label="Clear tag filter"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {/* Table */}
      <div className="rounded-md border border-gray-300 bg-white overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-200 hover:bg-gray-100">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-gray-700">
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
              <TableRow className="hover:bg-gray-50">
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
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
                  className="border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-gray-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-gray-50">
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
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
          <div className="flex items-center justify-between px-2 py-2 bg-gray-50 rounded-md border border-gray-200">
            <div className="text-sm text-gray-600">
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
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Export Selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.toggleAllRowsSelected(false)}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
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
                <Label htmlFor="rows-per-page" className="text-sm font-medium text-gray-700">
                  Rows per page
                </Label>
                <Select
                  value={`${pagination.limit}`}
                  onValueChange={(value) => onPageSizeChange?.(Number(value))}
                >
                  <SelectTrigger size="sm" className="h-8 w-[70px] bg-white border-gray-300 text-gray-900" id="rows-per-page">
                    <SelectValue placeholder={pagination.limit} />
                  </SelectTrigger>
                  <SelectContent side="top" className="bg-white border-gray-300">
                    {[10, 25, 50, 100, 200, 500, 1000].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`} className="text-gray-900 focus:bg-gray-100">
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => onPageChange?.(1)}
                  disabled={pagination.page === 1}
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => onPageChange?.(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => onPageChange?.(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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