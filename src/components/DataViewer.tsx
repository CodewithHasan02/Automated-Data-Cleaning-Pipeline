import React from 'react';
import { motion } from 'motion/react';

interface DataViewerProps {
  rawData: any[];
  cleanedData: any[];
}

export default function DataViewer({ rawData, cleanedData }: DataViewerProps) {
  const displayData = cleanedData.length > 0 ? cleanedData : rawData;
  const columns = displayData.length > 0 ? Object.keys(displayData[0]) : [];

  if (displayData.length === 0) {
    return <div className="p-8 text-center text-gray-500">No data available to display.</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <h3 className="font-semibold text-white">
          {cleanedData.length > 0 ? 'Cleaned Data Preview' : 'Raw Data Preview'}
        </h3>
        <span className="text-xs font-medium text-gray-400 bg-white/10 px-2.5 py-1 rounded-full">
          Showing first 100 rows
        </span>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-[#0B1121] sticky top-0 z-10 shadow-sm">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3 font-semibold text-gray-300 border-b border-white/10 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {displayData.slice(0, 100).map((row, rowIndex) => (
              <motion.tr 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: rowIndex * 0.01 }}
                key={rowIndex} 
                className="hover:bg-white/5 transition-colors"
              >
                {columns.map((col, colIndex) => {
                  const val = row[col];
                  const isNull = val === null || val === undefined || val === '';
                  return (
                    <td key={colIndex} className={`px-4 py-2.5 whitespace-nowrap ${isNull ? 'text-red-400 italic bg-red-500/10' : 'text-gray-300'}`}>
                      {isNull ? 'NULL' : String(val)}
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
