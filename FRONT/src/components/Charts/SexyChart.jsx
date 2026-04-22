import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line
} from 'recharts';

const SexyChart = ({ data }) => {
  const defaultData = [
    { day: 'Lun', recettes: 45000, depenses: 25000 },
    { day: 'Mar', recettes: 52000, depenses: 28000 },
    { day: 'Mer', recettes: 48000, depenses: 30000 },
    { day: 'Jeu', recettes: 60000, depenses: 32000 },
    { day: 'Ven', recettes: 75000, depenses: 35000 },
    { day: 'Sam', recettes: 68000, depenses: 30000 },
    { day: 'Dim', recettes: 55000, depenses: 25000 },
  ];

  const chartData = data || defaultData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-blue-600">
              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Recettes: {payload[0]?.value?.toLocaleString()} Ar
            </p>
            <p className="text-sm text-red-500">
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              Dépenses: {payload[1]?.value?.toLocaleString()} Ar
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={chartData}>
        <defs>
          <linearGradient id="colorRecettes" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
          </linearGradient>
          <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="day" stroke="#9ca3af" />
        <YAxis stroke="#9ca3af" tickFormatter={(value) => `${value/1000}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => <span className="text-gray-700">{value}</span>}
        />
        <Bar dataKey="recettes" fill="url(#colorRecettes)" radius={[8, 8, 0, 0]} name="Recettes" />
        <Bar dataKey="depenses" fill="url(#colorDepenses)" radius={[8, 8, 0, 0]} name="Dépenses" />
        <Line 
          type="monotone" 
          dataKey="recettes" 
          stroke="#3b82f6" 
          strokeWidth={2} 
          dot={{ r: 4, fill: '#3b82f6' }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default SexyChart;