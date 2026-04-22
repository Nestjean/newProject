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
} from 'recharts';

const RevenueExpenseChart = ({ data }) => {
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

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip formatter={(value) => `${value.toLocaleString()} Ar`} />
        <Legend />
        <Bar dataKey="recettes" fill="#3b82f6" name="Recettes" />
        <Bar dataKey="depenses" fill="#ef4444" name="Dépenses" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RevenueExpenseChart;