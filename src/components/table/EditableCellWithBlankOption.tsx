/**
 * Modified EditableCell component that allows blank/empty values
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconEdit, IconCheck, IconX } from "@tabler/icons-react";

interface EditableCellProps {
  value: string;
  onSave: (value: string) => void;
  options?: string[];
  type?: 'text' | 'select';
  allowBlank?: boolean; // New prop to explicitly allow blank values
}

export function EditableCell({ 
  value, 
  onSave, 
  options, 
  type = 'text',
  allowBlank = true // Default to allowing blank values
}: EditableCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value || ''); // Initialize with empty string if null

  const handleSave = () => {
    // Save the value even if it's empty
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div 
        className="flex items-center gap-2 group cursor-pointer hover:bg-blue-50 px-2 py-1 rounded border border-dashed border-gray-300 hover:border-blue-400" 
        onClick={() => setIsEditing(true)}
      >
        <span className={`text-xs ${value ? 'text-gray-700' : 'text-gray-400 italic'} group-hover:text-blue-700`}>
          {value || 'Click to add...'}
        </span>
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
        <Select 
          value={editValue} 
          onValueChange={setEditValue}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {allowBlank && (
              <SelectItem value="">
                <span className="text-gray-400 italic">None</span>
              </SelectItem>
            )}
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
          placeholder={allowBlank ? "Optional..." : "Required"}
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