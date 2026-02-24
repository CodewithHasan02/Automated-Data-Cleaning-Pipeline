import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

interface EDAViewerProps {
  data: any[];
}

const COLORS = ['#34d399', '#4285F4', '#F4B400', '#DB4437', '#10b981', '#009688'];

export default function EDAViewer({ data }: EDAViewerProps) {
  const { numericCols, categoricalCols } = useMemo(() => {
    if (!data || data.length === 0) return { numericCols: [], categoricalCols: [] };
    
    const sample = data[0];
    const numCols: string[] = [];
    const catCols: string[] = [];
    
    Object.keys(sample).forEach(key => {
      const isNumeric = data.some(row => typeof row[key] === 'number' && !isNaN(row[key]));
      if (isNumeric) numCols.push(key);
      else catCols.push(key);
    });
    
    return { numericCols: numCols, categoricalCols: catCols };
  }, [data]);

  const getCategoricalDistribution = (col: string) => {
    const counts: Record<string, number> = {};
    data.forEach(row => {
      const val = String(row[col] || 'Unknown');
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
  };

  const getNumericDistribution = (col: string) => {
    // Simple binning for numeric data
    const values = data.map(r => Number(r[col])).filter(v => !isNaN(v));
    if (values.length === 0) return [];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const binCount = 10;
    const binSize = range / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => ({
      name: `${(min + i * binSize).toFixed(1)} - ${(min + (i + 1) * binSize).toFixed(1)}`,
      count: 0
    }));
    
    values.forEach(v => {
      const binIndex = Math.min(Math.floor((v - min) / binSize), binCount - 1);
      if (bins[binIndex]) bins[binIndex].count++;
    });
    
    return bins;
  };

  if (!data || data.length === 0) return <div className="p-8 text-center text-gray-400">No data available for EDA.</div>;

  return (
    <div className="h-full overflow-auto p-6 bg-[#040B16] grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Categorical Charts */}
      {categoricalCols.slice(0, 2).map(col => (
        <div key={col} className="bg-[#0B1121] p-5 rounded-xl border border-white/10 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">{col} Distribution</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getCategoricalDistribution(col)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getCategoricalDistribution(col).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}

      {/* Numeric Charts */}
      {numericCols.slice(0, 2).map(col => (
        <div key={col} className="bg-[#0B1121] p-5 rounded-xl border border-white/10 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">{col} Histogram</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getNumericDistribution(col)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
                <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}

    </div>
  );
}
