import { useState, useCallback } from 'react';
import { NoteSettings, DEFAULT_SETTINGS } from '@/types/notes';

export function useTableData(initialRows = 4, initialCols = 3) {
  const [tableData, setTableData] = useState<string[][]>(() =>
    Array.from({ length: initialRows }, () =>
      Array.from({ length: initialCols }, () => '')
    )
  );

  const updateTableData = useCallback((newData: string[][]) => {
    setTableData(newData);
  }, []);

  const resetTableData = useCallback((rows: number, cols: number) => {
    setTableData(
      Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => '')
      )
    );
  }, []);

  return {
    tableData,
    updateTableData,
    resetTableData,
  };
}
