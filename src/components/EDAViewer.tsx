import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'motion/react';
import { BarChart2 } from 'lucide-react';

interface EDAViewerProps {
  data: any[];
  requestedVisualization?: { type: string; column?: string; columns?: string[] } | null;
}

const COLORS = ['#34d399', '#4285F4', '#F4B400', '#DB4437', '#10b981', '#009688'];

export default function EDAViewer({ data, requestedVisualization }: EDAViewerProps) {
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
    const binSize = range / binCount || 1;
    
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

  const renderRequestedChart = () => {
    if (!requestedVisualization) return null;

    const { type, column, columns } = requestedVisualization;
    const col = column || (columns && columns[0]);

    if (!col) return null;

    const isNumeric = numericCols.includes(col);

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-1 lg:col-span-2 bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl shadow-lg mb-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-brand-green" />
            AI Requested: {col} ({type} Analysis)
          </h3>
          <span className="text-xs font-medium text-brand-green bg-brand-green/10 px-3 py-1 rounded-full border border-brand-green/20 uppercase tracking-wider">
            Live Insight
          </span>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            {isNumeric ? (
              <BarChart data={getNumericDistribution(col)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} interval={0} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }} 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                  itemStyle={{ color: '#34d399' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                />
                <Legend verticalAlign="top" height={36}/>
                <Bar name={`Frequency of ${col}`} dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={getCategoricalDistribution(col)}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getCategoricalDistribution(col).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                  itemStyle={{ color: '#34d399' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-6 bg-[#040B16] space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderRequestedChart()}
        
        {/* Categorical Charts */}
        {categoricalCols.slice(0, 2).map(col => (
          <div key={col} className="bg-[#0B1121] p-5 rounded-xl border border-white/10 shadow-sm flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4">Distribution of {col}</h3>
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
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#34d399' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}

        {/* Numeric Charts */}
        {numericCols.slice(0, 2).map(col => (
          <div key={col} className="bg-[#0B1121] p-5 rounded-xl border border-white/10 shadow-sm flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4">Histogram of {col}</h3>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getNumericDistribution(col)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} interval={0} angle={-45} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip 
                    cursor={{ fill: '#1e293b' }} 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#34d399' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar name={`Count of ${col}`} dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
