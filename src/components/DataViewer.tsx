import React from 'react';
import { motion } from 'motion/react';

interface DataViewerProps {
  rawData: any[];
  cleanedData: any[];
}

export default function DataViewer({ rawData, cleanedData }: DataViewerProps) {
  const displayData = cleanedData.length > 0 ? cleanedData : rawData;
  // Filter out internal columns
  const columns = displayData.length > 0 
    ? Object.keys(displayData[0]).filter(k => !k.startsWith('_')) 
    : [];

  const sampledData = React.useMemo(() => {
    if (displayData.length <= 10) return displayData;
    // For cleaned data, prioritize showing modified rows in the sample
    if (cleanedData.length > 0) {
      const modified = displayData.filter(r => r._isModified);
      const normal = displayData.filter(r => !r._isModified);
      const shuffledNormal = [...normal].sort(() => 0.5 - Math.random());
      return [...modified, ...shuffledNormal].slice(0, 10);
    }
    const shuffled = [...displayData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }, [displayData, cleanedData]);

  if (displayData.length === 0) {
    return <div className="p-8 text-center text-gray-500">No data available to display.</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
        <h3 className="font-semibold text-white">
          {cleanedData.length > 0 ? 'Fully Cleaned Data Preview' : 'Raw Data Preview'}
        </h3>
        <div className="flex items-center gap-3">
          {cleanedData.length > 0 && (
            <div className="flex items-center gap-4 mr-4 text-[10px] uppercase font-bold tracking-wider">
              <span className="flex items-center gap-1.5 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Null Value Filled</span>
            </div>
          )}
          <span className="text-xs font-medium text-gray-400 bg-white/10 px-2.5 py-1 rounded-full">
            Showing up to 10 rows
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-[#0B1121] sticky top-0 z-10 shadow-sm">
            <tr>
              {cleanedData.length > 0 && (
                <th className="px-4 py-3 font-semibold text-brand-green border-b border-white/10 whitespace-nowrap">
                  Cleaning Log
                </th>
              )}
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3 font-semibold text-gray-300 border-b border-white/10 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sampledData.map((row, rowIndex) => {
              const isModified = row._isModified;
              
              let rowClass = "hover:bg-white/5 transition-colors";
              if (isModified) rowClass = "bg-amber-500/5 hover:bg-amber-500/10 transition-colors";

              return (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIndex * 0.05 }}
                  key={rowIndex} 
                  className={rowClass}
                >
                  {cleanedData.length > 0 && (
                    <td className="px-4 py-2.5 whitespace-nowrap text-[10px] font-mono">
                      {row._cleaningLogs && row._cleaningLogs.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {row._cleaningLogs.map((log: string, i: number) => (
                            <span key={i} className="text-amber-400">√ {log}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-600 italic">Verified</span>
                      )}
                    </td>
                  )}
                  {columns.map((col, colIndex) => {
                    const val = row[col];
                    const isNull = val === null || val === undefined || val === '';
                    return (
                      <td key={colIndex} className={`px-4 py-2.5 whitespace-nowrap selectable-text ${isNull ? 'text-red-400 italic bg-red-500/10' : 'text-gray-300'}`}>
                        {isNull ? 'NULL' : String(val)}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
