"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export type ChartData = {
  unitStats: { name: string; count: number }[];
  activityStats: { name: string; count: number }[];
  stageStats: { name: string; count: number }[];
  programStats: { name: string; count: number }[];
};

const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'];

export default function ReportCharts({ data }: { data: ChartData }) {
  // We only show top 10 for bar charts to avoid crowding
  const topUnits = useMemo(() => {
    return [...data.unitStats].sort((a, b) => b.count - a.count).slice(0, 10);
  }, [data.unitStats]);

  const topActivities = useMemo(() => {
    return [...data.activityStats].sort((a, b) => b.count - a.count).slice(0, 10);
  }, [data.activityStats]);

  // If there are no reports, don't show the charts section
  const totalReports = data.unitStats.reduce((sum, item) => sum + item.count, 0);
  if (totalReports === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Biểu đồ số lượng theo đơn vị */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Báo cáo theo Đơn vị (Top 10)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topUnits} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                interval={0}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" name="Số lượng" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Biểu đồ số lượng theo chương trình */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tỷ lệ theo Chương trình lớn</h3>
        <div className="flex-1 min-h-[300px] w-full">
          {data.programStats.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.programStats}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.programStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} báo cáo`, 'Số lượng']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
              Không có dữ liệu chương trình
            </div>
          )}
        </div>
      </div>

      {/* Biểu đồ số lượng theo hoạt động */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm lg:col-span-2">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Báo cáo theo Hoạt động (Top 10)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topActivities} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }} 
                angle={-15} 
                textAnchor="end" 
                height={60} 
                interval={0}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" name="Số lượng" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
