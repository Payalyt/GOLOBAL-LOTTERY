import React, { useState, useEffect, useRef } from 'react';
import { Download, Plus, Trash2, Search, FileSpreadsheet, Edit3, Check, CheckSquare, Info, X, HelpCircle, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Define spreadsheet column configurations
export interface ExcelColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'image' | 'date';
  options?: string[]; // for 'select' type
  readOnly?: boolean;
  width?: string; // Tailwind width class or custom width
}

interface ExcelSheetProps {
  sheetName: string;
  columns: ExcelColumn[];
  data: any[];
  onDataChange: (updatedData: any[]) => void;
  onAddRow?: () => any; // custom row creator
  onDeleteRow?: (index: number, row: any) => void;
  onEditRow?: (row: any) => void;
  onCellClick?: (rowIndex: number, columnKey: string) => void;
}

export function ExcelSheet({
  sheetName,
  columns,
  data,
  onDataChange,
  onAddRow,
  onDeleteRow,
  onEditRow,
  onCellClick
}: ExcelSheetProps) {
  const [selectedCell, setSelectedCell] = useState<{ rowIndex: number; colIndex: number; key: string } | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gridData, setGridData] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const formulaInputRef = useRef<HTMLInputElement>(null);

  // Sync prop data with local state
  useEffect(() => {
    setGridData(data);
  }, [data]);

  // Translate numeric col index to letter (A, B, C...)
  const getColLetter = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  // Convert row index and col index to Excel cell address (e.g. B4)
  const getCellAddress = (): string => {
    if (!selectedCell) return '';
    return `${getColLetter(selectedCell.colIndex)}${selectedCell.rowIndex + 1}`;
  };

  // Handle selecting a cell
  const handleSelectCell = (rowIndex: number, colIndex: number, key: string) => {
    setSelectedCell({ rowIndex, colIndex, key });
    
    // Stop editing previous cell if selected cell changed
    if (editingCell && (editingCell.rowIndex !== rowIndex || editingCell.colIndex !== colIndex)) {
      saveCellEdit();
    }

    const value = gridData[rowIndex]?.[key];
    setEditValue(value !== undefined ? String(value) : '');

    if (onCellClick) {
      onCellClick(rowIndex, key);
    }
  };

  // Trigger editing mode
  const startEditing = (rowIndex: number, colIndex: number, key: string) => {
    const col = columns[colIndex];
    if (col.readOnly) return;
    
    setEditingCell({ rowIndex, colIndex });
    const value = gridData[rowIndex]?.[key];
    setEditValue(value !== undefined ? String(value) : '');
  };

  // Save the active edit
  const saveCellEdit = () => {
    if (!selectedCell) return;
    const { rowIndex, key } = selectedCell;
    const col = columns[selectedCell.colIndex];
    
    if (col.readOnly) {
      setEditingCell(null);
      return;
    }

    const updated = [...gridData];
    let finalVal: any = editValue;

    if (col.type === 'number') {
      finalVal = parseFloat(editValue);
      if (isNaN(finalVal)) finalVal = 0;
    } else if (col.type === 'boolean') {
      finalVal = editValue === 'true' || editValue === 'YES' || editValue === 'checked';
    }

    updated[rowIndex] = {
      ...updated[rowIndex],
      [key]: finalVal
    };

    setGridData(updated);
    onDataChange(updated);
    setEditingCell(null);
  };

  // Handle cell value changed directly from input
  const handleCellInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditValue(e.target.value);
  };

  // Handle Key presses on cell (Excel-like keyboard navigation)
  const handleCellKeyDown = (e: React.KeyboardEvent, rowIndex: number, colIndex: number, key: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingCell) {
        saveCellEdit();
      } else {
        startEditing(rowIndex, colIndex, key);
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      const value = gridData[rowIndex]?.[key];
      setEditValue(value !== undefined ? String(value) : '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      saveCellEdit();
      const nextColIndex = (colIndex + 1) % columns.length;
      const nextRowIndex = nextColIndex === 0 ? (rowIndex + 1) % gridData.length : rowIndex;
      handleSelectCell(nextRowIndex, nextColIndex, columns[nextColIndex].key);
    }
  };

  // Add new blank row
  const handleAddNewRow = () => {
    if (onAddRow) {
      const newRow = onAddRow();
      if (newRow) {
        const updated = [...gridData, newRow];
        setGridData(updated);
        onDataChange(updated);
        // Focus on new row
        setTimeout(() => {
          handleSelectCell(updated.length - 1, 0, columns[0].key);
        }, 50);
      }
    } else {
      // Default blank row creation
      const blankRow: any = {};
      columns.forEach(col => {
        if (col.type === 'number') blankRow[col.key] = 0;
        else if (col.type === 'boolean') blankRow[col.key] = false;
        else blankRow[col.key] = '';
      });
      // Try generating unique id
      blankRow.id = 'row-' + Date.now();
      const updated = [...gridData, blankRow];
      setGridData(updated);
      onDataChange(updated);
    }
  };

  // Delete selected or specific row
  const handleDeleteSelectedRow = (index: number) => {
    const rowToDelete = gridData[index];
    if (onDeleteRow) {
      onDeleteRow(index, rowToDelete);
    }
    const updated = gridData.filter((_, i) => i !== index);
    setGridData(updated);
    onDataChange(updated);
    setSelectedCell(null);
    setEditingCell(null);
  };

  // Export grid data to CSV format
  const exportToCSV = () => {
    const headers = columns.map(c => c.label).join(',');
    const rows = gridData.map(row => {
      return columns.map(c => {
        let val = row[c.key];
        if (val === undefined || val === null) val = '';
        // Escape quotes
        const strVal = String(val).replace(/"/g, '""');
        return strVal.includes(',') || strVal.includes('\n') || strVal.includes('"') ? `"${strVal}"` : strVal;
      }).join(',');
    }).join('\n');

    const csvContent = "data:text/csv;charset=utf-8," + headers + '\n' + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${sheetName.replace(/\s+/g, '_')}_sheet_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter grid rows by search
  const filteredRows = gridData.map((row, index) => ({ row, originalIndex: index })).filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return columns.some(col => {
      const val = item.row[col.key];
      return val !== undefined && String(val).toLowerCase().includes(query);
    });
  });

  return (
    <div className="bg-[#0b0b10] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col w-full text-zinc-100 font-sans">
      
      {/* Top Banner Toolbar styled like Microsoft Excel / Google Sheets */}
      <div className="p-4 bg-[#0d0d12] border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
        
        {/* Sheet Title & Metadata */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] bg-zinc-800/80 text-zinc-400 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                Spreadsheet Mode
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h4 className="text-xs font-black uppercase text-zinc-200 mt-1 flex items-center gap-1.5 font-mono">
              {sheetName.replace(/_/g, ' ')}.xlsx
            </h4>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Real-time search inside sheet */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Sheet Cells..."
              className="bg-zinc-950/60 text-[11px] font-medium pl-8 pr-4 py-2 rounded-xl border border-zinc-800/80 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 w-44 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={handleAddNewRow}
            className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-950/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>

          <button
            type="button"
            onClick={exportToCSV}
            className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-zinc-800/80 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Formula & Reference Box Bar */}
      <div className="px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800/50 flex items-center gap-2.5 text-xs font-mono">
        {/* Active cell coordinate lookup */}
        <div className="flex items-center gap-1 shrink-0 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-md text-emerald-400 font-extrabold select-none min-w-[50px] justify-center">
          {getCellAddress() || 'None'}
        </div>
        <div className="text-zinc-600 font-extrabold select-none">fx</div>
        <div className="w-[1px] h-4 bg-zinc-800 shrink-0" />
        
        {/* Dynamic Formula Bar Value Display and Editing */}
        <input 
          ref={formulaInputRef}
          type="text"
          value={editValue}
          onChange={(e) => {
            setEditValue(e.target.value);
            if (selectedCell) {
              const updated = [...gridData];
              updated[selectedCell.rowIndex] = {
                ...updated[selectedCell.rowIndex],
                [selectedCell.key]: e.target.value
              };
              setGridData(updated);
              onDataChange(updated);
            }
          }}
          disabled={!selectedCell || columns[selectedCell.colIndex]?.readOnly}
          placeholder={selectedCell ? (columns[selectedCell.colIndex]?.readOnly ? "[Read Only Cell]" : "Edit cell value here...") : "Select any cell to inspect and edit its value..."}
          className={`bg-transparent text-xs text-white placeholder-zinc-600 focus:outline-none w-full font-medium ${(!selectedCell || columns[selectedCell.colIndex]?.readOnly) ? 'cursor-not-allowed opacity-55' : ''}`}
        />

        {selectedCell && !columns[selectedCell.colIndex]?.readOnly && (
          <button
            type="button"
            onClick={saveCellEdit}
            className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-bold uppercase transition-all shrink-0 cursor-pointer"
          >
            Confirm
          </button>
        )}
      </div>

      {/* Interactive Sheet Body */}
      <div className="overflow-x-auto w-full no-scrollbar" ref={containerRef}>
        <table className="w-full text-left border-collapse min-w-[900px]">
          
          {/* Header row A, B, C */}
          <thead>
            <tr className="bg-zinc-900/50 text-[10.5px] font-bold text-zinc-500 select-none">
              <th className="w-10 border-r border-b border-zinc-800 p-2 text-center bg-zinc-950 font-mono text-[9px]">#</th>
              {columns.map((col, colIdx) => (
                <th key={col.key} className="border-r border-b border-zinc-800 p-2.5 font-mono text-zinc-400 font-extrabold min-w-[120px]" style={{ width: col.width }}>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400">{getColLetter(colIdx)}</span>
                    <span className="text-[10px] text-zinc-500 font-sans tracking-wide truncate ml-2 uppercase font-black">{col.label}</span>
                  </div>
                </th>
              ))}
              <th className="w-16 border-b border-zinc-800 p-2 text-center bg-zinc-950 font-mono text-[9px]">ACTIONS</th>
            </tr>
          </thead>

          {/* Records body */}
          <tbody className="divide-y divide-zinc-850">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="p-12 text-center text-zinc-500 font-medium">
                  <LayoutGrid className="w-8 h-8 text-zinc-700 mx-auto mb-3 animate-pulse" />
                  No database entries matched your filter queries. Double check spreadsheet values or press <b>Add Row</b> to insert data.
                </td>
              </tr>
            ) : (
              filteredRows.map(({ row, originalIndex }, rowIdx) => {
                const globalRowNumber = originalIndex + 1;
                return (
                  <tr key={row.id || row.email || rowIdx} className="group hover:bg-zinc-950/40 transition-colors text-xs font-mono">
                    {/* Index label column */}
                    <td className="border-r border-zinc-800 bg-zinc-950/60 p-2 text-center text-zinc-500 text-[10px] font-black tracking-tighter select-none">
                      {globalRowNumber}
                    </td>

                    {/* Data column cells */}
                    {columns.map((col, colIdx) => {
                      const isCellSelected = selectedCell?.rowIndex === originalIndex && selectedCell?.colIndex === colIdx;
                      const isCellEditing = editingCell?.rowIndex === originalIndex && editingCell?.colIndex === colIdx;
                      const cellValue = row[col.key];

                      return (
                        <td
                          key={col.key}
                          onClick={() => handleSelectCell(originalIndex, colIdx, col.key)}
                          onDoubleClick={() => startEditing(originalIndex, colIdx, col.key)}
                          className={`border-r border-zinc-800 p-1 relative transition-all min-h-[38px] ${
                            isCellSelected 
                              ? 'bg-indigo-950/20 shadow-[inset_0_0_0_2px_#6366f1]' 
                              : 'hover:bg-zinc-900/30'
                          } ${col.readOnly ? 'bg-zinc-950/20 text-zinc-400' : ''}`}
                        >
                          {isCellEditing ? (
                            col.type === 'select' ? (
                              <select
                                value={editValue}
                                onChange={handleCellInputChange}
                                onBlur={saveCellEdit}
                                onKeyDown={(e) => handleCellKeyDown(e, originalIndex, colIdx, col.key)}
                                className="w-full bg-zinc-950 border border-indigo-500 rounded p-1 text-xs text-white focus:outline-none"
                                autoFocus
                              >
                                {col.options?.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={editValue}
                                onChange={handleCellInputChange}
                                onBlur={saveCellEdit}
                                onKeyDown={(e) => handleCellKeyDown(e, originalIndex, colIdx, col.key)}
                                className="w-full bg-zinc-950 border border-indigo-500 rounded p-1 text-xs text-white focus:outline-none font-mono"
                                autoFocus
                              />
                            )
                          ) : (
                            <div className="w-full h-full min-h-[24px] flex items-center px-2 py-1 justify-between select-none">
                              {/* Display formats customized by type */}
                              {col.type === 'boolean' ? (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded ${cellValue ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50' : 'bg-zinc-900 text-zinc-500'}`}>
                                  {cellValue ? 'YES' : 'NO'}
                                </span>
                              ) : col.type === 'image' ? (
                                <div className="flex items-center gap-1.5 overflow-hidden w-full">
                                  {cellValue ? (
                                    <img 
                                      src={cellValue} 
                                      alt="preview" 
                                      referrerPolicy="no-referrer"
                                      className="w-5 h-5 rounded-md object-cover border border-zinc-800 shrink-0" 
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-5 h-5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                                      <X className="w-2.5 h-2.5 text-zinc-600" />
                                    </div>
                                  )}
                                  <span className="truncate text-[10px] text-zinc-500 text-left font-sans">{cellValue || 'No URL'}</span>
                                </div>
                              ) : col.key === 'role' ? (
                                <span className={`inline-flex text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                                  cellValue === 'admin' ? 'bg-red-950/60 text-red-400 border border-red-900/60' : 'bg-zinc-800/80 text-zinc-400'
                                }`}>
                                  {String(cellValue || 'user')}
                                </span>
                              ) : col.key === 'status' ? (
                                <span className={`inline-flex text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                                  cellValue === 'Approved' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/60' :
                                  cellValue === 'Rejected' ? 'bg-red-950/60 text-red-400 border border-red-900/60' :
                                  'bg-amber-950/60 text-amber-400 border border-amber-900/60'
                                }`}>
                                  {String(cellValue || 'Pending')}
                                </span>
                              ) : col.type === 'number' ? (
                                <span className="font-bold text-zinc-200">
                                  {typeof cellValue === 'number' ? cellValue.toLocaleString() : cellValue}
                                </span>
                              ) : (
                                <span className="truncate text-zinc-300 font-sans font-medium">{String(cellValue !== undefined ? cellValue : '')}</span>
                              )}

                              {!col.readOnly && (
                                <Edit3 className="w-3 h-3 text-zinc-700 group-hover:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1.5" />
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    {/* Action controls button (Delete row) */}
                    <td className="p-1 border-b border-zinc-800 bg-zinc-950/40 text-center">
                      
                      {onEditRow && (
                        <button
                          type="button"
                          onClick={() => onEditRow(row)}
                          className="p-1.5 mr-1 bg-blue-950/30 hover:bg-blue-950/70 border border-blue-900/30 text-blue-400 rounded-lg transition-colors cursor-pointer"
                          title="Edit spreadsheet row"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteSelectedRow(originalIndex)}
                        className="p-1.5 bg-red-950/30 hover:bg-red-950/70 border border-red-900/30 text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete spreadsheet row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Spreadsheet Status Bar Summary */}
      <div className="p-3 bg-[#0d0d12] border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-semibold text-zinc-500 select-none font-mono">
        <div className="flex items-center gap-4">
          <span>Rows: <strong className="text-zinc-300">{gridData.length}</strong></span>
          <span>Columns: <strong className="text-zinc-300">{columns.length}</strong></span>
          {selectedCell && (
            <span>Selected Cell: <strong className="text-indigo-400">{getCellAddress()}</strong></span>
          )}
        </div>
        <div className="flex items-center gap-2 text-emerald-500 font-extrabold uppercase tracking-widest text-[9px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Realtime Firestore Synced</span>
        </div>
      </div>

    </div>
  );
}
