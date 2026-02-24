import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BeforeAfterGraphProps {
  rawDataLength: number;
  cleanedDataLength: number;
  nullsFilled: number;
}

export default function BeforeAfterGraph({ rawDataLength, cleanedDataLength, nullsFilled }: BeforeAfterGraphProps) {
  const data = [
    {
      name: 'Before Cleaning',
      Rows: rawDataLength,
      color: '#475569' // slate-600
    },
    {
      name: 'After Cleaning',
      Rows: cleanedDataLength,
      color: '#34d399' // emerald-400
    }
  ];

  return (
    <div className="bg-[#0B1121] border border-white/10 rounded-xl p-6 shadow-sm flex flex-col h-full">
      <h3 className="font-semibold text-white mb-4">Data Quality Impact</h3>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }} />
            <Bar dataKey="Rows" radius={[4, 4, 0, 0]} barSize={60}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-400 flex justify-center gap-4">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-600"></span> Raw Data</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#34d399]"></span> Cleaned Data</span>
      </div>
    </div>
  );
}
