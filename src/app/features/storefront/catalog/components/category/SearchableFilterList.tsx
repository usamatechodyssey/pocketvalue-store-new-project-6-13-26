
"use client";

import { useState, useMemo, useId } from "react";
import { Search } from "lucide-react";
import FilterCheckboxRow from "./FilterCheckboxRow";

interface SearchableListProps {
  items: { id: string; name: string; value: string }[];
  selectedValues: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchableFilterList({
  items,
  selectedValues,
  onChange,
  placeholder = "Search...",
}: SearchableListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // ✅ FIX 1: Generate unique ID for list container
  const listId = useId();

  // Filter list based on search
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const hasResults = filteredItems.length > 0;

  return (
    <div className="flex flex-col h-full max-h-60">
      {/* Search Bar (Sticky Top) */}
      <div className="relative mb-2 shrink-0">
        <input
          type="text"
          placeholder={placeholder}
          aria-label={placeholder || "Search filters"}
          // ✅ FIX 1: Associate input with the list it controls
          aria-controls={listId}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-brand-primary/50 transition-colors"
        />
        <Search
          size={12}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
      </div>

      {/* Scrollable List */}
      <div 
        id={listId} // ✅ FIX 1: ID for aria-controls
        // ✅ FIX 2: Proper list semantics
        role="list"
        aria-label="Filtered options"
        className="overflow-y-auto custom-scrollbar pr-1 grow space-y-0.5"
      >
        {hasResults ? (
          filteredItems.map((item) => (
            <div key={item.id} role="listitem">
              <FilterCheckboxRow
                label={item.name}
                checked={selectedValues.includes(item.value)}
                onChange={() => onChange(item.value)}
              />
            </div>
          ))
        ) : (
          // ✅ FIX 3: Announce empty state to screen readers
          <p 
            role="status" 
            aria-live="polite"
            className="text-xs text-center text-gray-400 py-4"
          >
            No matches found
          </p>
        )}
      </div>
    </div>
  );
}