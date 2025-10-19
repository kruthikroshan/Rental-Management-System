import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign } from 'lucide-react';

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
  timeRange?: '7days' | '30days' | '90days';
  chartType?: 'line' | 'bar' | 'area';
}

export function RevenueChart({ data, timeRange = '7days', chartType = 'area' }: RevenueChartProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate total revenue and growth
  const analytics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalRevenue: 0,
        averageRevenue: 0,
        growth: 0,
        totalBookings: 0,
      };
    }

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalBookings = data.reduce((sum, item) => sum + item.bookings, 0);
    const averageRevenue = totalRevenue / data.length;

    // Calculate growth (compare first half vs second half)
    const midPoint = Math.floor(data.length / 2);
    const firstHalfRevenue = data.slice(0, midPoint).reduce((sum, item) => sum + item.revenue, 0);
    const secondHalfRevenue = data.slice(midPoint).reduce((sum, item) => sum + item.revenue, 0);
    const growth = firstHalfRevenue > 0 
      ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 
      : 0;

    return {
      totalRevenue,
      averageRevenue,
      growth: Math.round(growth * 10) / 10,
      totalBookings,
    };
  }, [data]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {payload[0].payload.date}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Bookings: {payload[1].value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#888888"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#888888"
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#888888"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#888888"
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );

      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#888888"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#888888"
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        );
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Revenue Overview</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {timeRange === '7days' ? 'Last 7 days' : timeRange === '30days' ? 'Last 30 days' : 'Last 90 days'}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(analytics.totalRevenue)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm mt-1">
              <TrendingUp className={`h-4 w-4 ${analytics.growth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={analytics.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                {analytics.growth >= 0 ? '+' : ''}{analytics.growth}%
              </span>
              <span className="text-muted-foreground ml-1">vs previous period</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(analytics.totalRevenue)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Average Daily</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(analytics.averageRevenue)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Bookings</p>
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {analytics.totalBookings}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
