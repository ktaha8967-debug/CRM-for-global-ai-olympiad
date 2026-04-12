"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const regionData = [
  { region: "Europe", countries: 24 },
  { region: "Asia", countries: 32 },
  { region: "Africa", countries: 18 },
  { region: "Americas", countries: 21 },
  { region: "Middle East", countries: 12 },
];

export default function RegionChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={regionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
          <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dx={-10} />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
          />
          <Bar dataKey="countries" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
