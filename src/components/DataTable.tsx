import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SparqlJsonResult, Column, Binding } from '../types';
import { AutoSizer, Table, Column as VirtualizedColumn } from 'react-virtualized';
import 'react-virtualized/styles.css';
import { Search, ArrowUpDown } from 'lucide-react';

interface DataTableProps {
  data: SparqlJsonResult | null;
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [filteredData, setFilteredData] = useState<Binding[]>([]);
  const tableRef = useRef<Table | null>(null);

  // Prepare columns based on the data headers
  const columns: Column[] = data?.head.vars.map(varName => ({
    id: varName,
    header: varName,
    accessorFn: (row: Binding) => row[varName]?.value || ''
  })) || [];

  // Handle search and sorting
  useEffect(() => {
    if (!data?.results?.bindings) {
      setFilteredData([]);
      return;
    }

    let processed = [...data.results.bindings];

    // Apply search filter if query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      processed = processed.filter(row =>
        data.head.vars.some(varName => {
          const val = row[varName]?.value || '';
          return val.toLowerCase().includes(query);
        })
      );
    }

    // Apply sorting if set
    if (sortBy) {
      processed.sort((a, b) => {
        const aVal = a[sortBy]?.value || '';
        const bVal = b[sortBy]?.value || '';
        return sortDirection === 'ASC'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }

    setFilteredData(processed);
  }, [data, searchQuery, sortBy, sortDirection]);

  // Handle sort toggle
  const handleSort = useCallback((columnId: string) => {
    setSortBy(prev =>
      prev === columnId
        ? (sortDirection === 'ASC' ? (() => { setSortDirection('DESC'); return columnId })() : (() => { setSortDirection('ASC'); return columnId })())
        : (setSortDirection('ASC'), columnId)
    );
  }, [sortDirection]);

  // Cell renderer
  const cellRenderer = useCallback(({ columnIndex, rowIndex, key, style }: any) => {
    const row = filteredData[rowIndex];
    if (!row) return null;

    const colId = columns[columnIndex].id;
    const val = row[colId]?.value || '';
    const isUri = row[colId]?.type === 'uri';

    return (
      <div key={key} style={style} className="truncate px-4 py-2 border-b border-gray-200 text-sm">
        {isUri
          ? <a href={val} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {val.replace(/^https?:\/\//, '')}
            </a>
          : val}
      </div>
    );
  }, [filteredData, columns]);

  // Header renderer
  const headerRenderer = useCallback(({ columnIndex }: any) => {
    const col = columns[columnIndex];
    const isSorted = sortBy === col.id;

    return (
      <div
        className="flex items-center justify-between px-4 py-3 uppercase text-xs font-medium text-gray-500 cursor-pointer"
        onClick={() => handleSort(col.id)}
      >
        <span>{col.header}</span>
        {isSorted && (
          <ArrowUpDown
            className={`ml-1 h-4 w-4 ${sortDirection === 'ASC' ? '' : 'transform rotate-180'}`}
          />
        )}
      </div>
    );
  }, [columns, sortBy, sortDirection, handleSort]);

  // If no data at all, show placeholder
  if (!data) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
        No data available. Please upload a .gz file or wait for default data to load.
      </div>
    );
  }

  const rowCount = filteredData.length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Search bar always visible */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search in data..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {searchQuery === '' ? (
        // Hide table until user types
        <div className="p-8 text-center text-gray-500">
          Start typing above to view the table.
        </div>
      ) : (
        <>
          {/* Table stats */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
            Showing {rowCount} of {data.results.bindings.length} rows
          </div>

          {/* Virtualized table */}
          <div className="h-[500px] w-full">
            <AutoSizer>
              {({ height, width }) => (
                <Table
                  ref={tableRef}
                  height={height}
                  width={width}
                  rowHeight={40}
                  headerHeight={48}
                  rowCount={rowCount}
                  rowGetter={({ index }) => filteredData[index]}
                  sortBy={sortBy || ''}
                  sortDirection={sortDirection}
                  className="font-sans"
                >
                  {columns.map((col, idx) => (
                    <VirtualizedColumn
                      key={col.id}
                      dataKey={col.id}
                      label={col.header}
                      width={200}
                      flexGrow={1}
                      cellRenderer={({ rowIndex }) =>
                        cellRenderer({ columnIndex: idx, rowIndex, key: `${rowIndex}-${col.id}`, style: {} })
                      }
                      headerRenderer={() => headerRenderer({ columnIndex: idx })}
                    />
                  ))}
                </Table>
              )}
            </AutoSizer>
          </div>
        </>
      )}
    </div>
  );
};

export default DataTable;
