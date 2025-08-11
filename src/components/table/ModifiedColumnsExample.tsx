/**
 * Example of how to modify the columns to allow blank values
 * Replace the sentiment, category, and tag column definitions with these
 */

// For the sentiment column (around line 288-322)
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
    const sentiment = row.getValue("sentiment") as string || ''; // Handle null/undefined
    const rowId = row.original.id;
    
    return (
      <EditableCell
        value={sentiment}
        onSave={(value) => onUpdateRow(rowId, 'sentiment', value)}
        options={['positive', 'negative', 'neutral']} // Remove empty string, component handles it
        type="select"
        allowBlank={true} // Explicitly allow blank
      />
    );
  },
  filterFn: (row, id, value) => {
    const cellValue = row.getValue(id) || ''; // Handle null/undefined
    return value.includes(cellValue)
  },
},

// For the category column (around line 323-356)
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
    const category = row.getValue("category") as string || ''; // Handle null/undefined
    const rowId = row.original.id;
    
    return (
      <EditableCell
        value={category}
        onSave={(value) => onUpdateRow(rowId, 'category', value)}
        type="text"
        allowBlank={true} // Explicitly allow blank
      />
    );
  },
  filterFn: (row, id, value) => {
    const cellValue = row.getValue(id) || ''; // Handle null/undefined
    return value.includes(cellValue)
  },
},

// For the tag column (around line 357-391)
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
    const tag = row.getValue("tag") as string || ''; // Handle null/undefined
    const rowId = row.original.id;
    
    return (
      <EditableCell
        value={tag}
        onSave={(value) => onUpdateRow(rowId, 'tag', value)}
        type="text"
        allowBlank={true} // Explicitly allow blank
      />
    );
  },
  filterFn: (row, id, value) => {
    const cellValue = row.getValue(id) || ''; // Handle null/undefined
    return value.includes(cellValue)
  },
},

// Also update the filter logic to handle empty values properly
// In the uniqueCategories calculation (around line 458-461)
const uniqueCategories = React.useMemo(() => 
  Array.from(new Set(localData
    .map(item => item.category)
    .filter(Boolean) // Filter out null/undefined/empty values
  )).sort(),
  [localData]
);

// In the uniqueTags calculation (around line 463-466)
const uniqueTags = React.useMemo(() => 
  Array.from(new Set(localData
    .map(item => item.tag)
    .filter(Boolean) // Filter out null/undefined/empty values
  )).sort(),
  [localData]
);