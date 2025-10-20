import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Download, 
  Calendar, 
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  FileText,
  Filter,
  RefreshCw
} from "lucide-react";

const Reports = () => {
  const [dateRange, setDateRange] = useState("last_30_days");
  const [reportType, setReportType] = useState("overview");

  // Sample data - in real app this would come from API
  const revenueData = {
    totalRevenue: "₹4,25,890",
    monthlyGrowth: "+18.2%",
    averageOrderValue: "₹15,250",
    totalOrders: 89
  };

  const topProducts = [
    { name: "Professional Camera Kit", rentals: 45, revenue: "₹90,000", utilization: "89%" },
    { name: "Wedding Decoration Set", rentals: 32, revenue: "₹80,000", utilization: "76%" },
    { name: "Sound System Pro", rentals: 28, revenue: "₹42,000", utilization: "65%" },
    { name: "Furniture Set Deluxe", rentals: 24, revenue: "₹72,000", utilization: "58%" },
    { name: "Lighting Equipment", rentals: 19, revenue: "₹38,000", utilization: "45%" }
  ];

  const topCustomers = [
    { name: "Rajesh Kumar", orders: 12, totalSpent: "₹45,000", lastOrder: "2025-08-10" },
    { name: "Priya Sharma", orders: 8, totalSpent: "₹32,000", lastOrder: "2025-08-09" },
    { name: "Arjun Singh", orders: 6, totalSpent: "₹28,500", lastOrder: "2025-08-08" },
    { name: "Meera Gupta", orders: 5, totalSpent: "₹22,000", lastOrder: "2025-08-07" },
    { name: "Vikram Patel", orders: 4, totalSpent: "₹18,000", lastOrder: "2025-08-06" }
  ];

  const monthlyData = [
    { month: "Jan", revenue: 85000, orders: 24, customers: 18 },
    { month: "Feb", revenue: 92000, orders: 28, customers: 22 },
    { month: "Mar", revenue: 78000, orders: 22, customers: 19 },
    { month: "Apr", revenue: 105000, orders: 32, customers: 28 },
    { month: "May", revenue: 118000, orders: 38, customers: 31 },
    { month: "Jun", revenue: 125000, orders: 42, customers: 35 },
    { month: "Jul", revenue: 132000, orders: 45, customers: 38 }
  ];

  const exportReport = (format: string) => {
    // Generate report data based on current filters
    const reportData = {
      reportType,
      dateRange,
      generatedAt: new Date().toISOString(),
      kpis: revenueData,
      topProducts,
      topCustomers,
      monthlyData
    };

    if (format === 'pdf') {
      // For PDF, create a formatted HTML representation
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${reportType.toUpperCase()} Report - ${dateRange}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f4f4f4; font-weight: bold; }
            .kpi { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Reports & Analytics</h1>
          <p><strong>Report Type:</strong> ${reportType}</p>
          <p><strong>Date Range:</strong> ${dateRange}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          
          <h2>Key Performance Indicators</h2>
          <div>
            <div class="kpi"><strong>Total Revenue:</strong> ${revenueData.totalRevenue}</div>
            <div class="kpi"><strong>Total Orders:</strong> ${revenueData.totalOrders}</div>
            <div class="kpi"><strong>Avg Order Value:</strong> ${revenueData.averageOrderValue}</div>
          </div>

          <h2>Top Products</h2>
          <table>
            <tr><th>Product</th><th>Rentals</th><th>Revenue</th><th>Utilization</th></tr>
            ${topProducts.map(p => `<tr><td>${p.name}</td><td>${p.rentals}</td><td>${p.revenue}</td><td>${p.utilization}</td></tr>`).join('')}
          </table>

          <h2>Top Customers</h2>
          <table>
            <tr><th>Customer</th><th>Orders</th><th>Total Spent</th><th>Last Order</th></tr>
            ${topCustomers.map(c => `<tr><td>${c.name}</td><td>${c.orders}</td><td>${c.totalSpent}</td><td>${c.lastOrder}</td></tr>`).join('')}
          </table>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportType}-${dateRange}-${Date.now()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } else if (format === 'excel' || format === 'csv') {
      // For Excel/CSV, create tab-separated data
      const separator = format === 'csv' ? ',' : '\t';
      let csvContent = `${reportType.toUpperCase()} Report - ${dateRange}\n\n`;
      
      // KPIs
      csvContent += `Key Performance Indicators\n`;
      csvContent += `Metric${separator}Value\n`;
      csvContent += `Total Revenue${separator}${revenueData.totalRevenue}\n`;
      csvContent += `Monthly Growth${separator}${revenueData.monthlyGrowth}\n`;
      csvContent += `Average Order Value${separator}${revenueData.averageOrderValue}\n`;
      csvContent += `Total Orders${separator}${revenueData.totalOrders}\n\n`;
      
      // Top Products
      csvContent += `Top Products\n`;
      csvContent += `Product Name${separator}Rentals${separator}Revenue${separator}Utilization\n`;
      topProducts.forEach(p => {
        csvContent += `${p.name}${separator}${p.rentals}${separator}${p.revenue}${separator}${p.utilization}\n`;
      });
      csvContent += '\n';
      
      // Top Customers
      csvContent += `Top Customers\n`;
      csvContent += `Customer Name${separator}Orders${separator}Total Spent${separator}Last Order\n`;
      topCustomers.forEach(c => {
        csvContent += `${c.name}${separator}${c.orders}${separator}${c.totalSpent}${separator}${c.lastOrder}\n`;
      });
      csvContent += '\n';
      
      // Monthly Data
      csvContent += `Monthly Data\n`;
      csvContent += `Month${separator}Revenue${separator}Orders${separator}Customers\n`;
      monthlyData.forEach(m => {
        csvContent += `${m.month}${separator}${m.revenue}${separator}${m.orders}${separator}${m.customers}\n`;
      });
      
      const blob = new Blob([csvContent], { type: format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportType}-${dateRange}-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } else {
      // JSON export
      const jsonStr = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report-${reportType}-${dateRange}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    console.log(`✅ Exported ${reportType} report in ${format} format for ${dateRange}`);
  };

  return (
    <Layout>
      <div className="flex-1 space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
            <p className="text-muted-foreground">
              Business insights and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportReport('pdf')}>
                  <FileText className="w-4 h-4 mr-2 text-red-500" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportReport('excel')}>
                  <BarChart3 className="w-4 h-4 mr-2 text-green-500" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportReport('csv')}>
                  <Download className="w-4 h-4 mr-2 text-blue-500" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="last_6_months">Last 6 Months</option>
                <option value="last_year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
              
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="overview">Overview</option>
                <option value="revenue">Revenue Analysis</option>
                <option value="products">Product Performance</option>
                <option value="customers">Customer Analysis</option>
                <option value="operations">Operations Report</option>
              </select>

              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueData.totalRevenue}</div>
              <p className="text-xs text-green-600 font-medium">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                {revenueData.monthlyGrowth} from last period
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueData.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Average: 3 orders/day</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueData.averageOrderValue}</div>
              <p className="text-xs text-green-600 font-medium">+12% vs last period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">147</div>
              <p className="text-xs text-muted-foreground">23 new this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables Row */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.slice(-6).map((data, index) => (
                  <div key={data.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{data.month} 2025</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground">{data.orders} orders</span>
                      <span className="font-bold">₹{(data.revenue / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Most Rented Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.rentals} rentals • {product.utilization} utilization
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{product.revenue}</p>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div
                  key={customer.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{customer.name}</span>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {customer.orders} orders • Last order: {customer.lastOrder}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{customer.totalSpent}</p>
                    <p className="text-sm text-muted-foreground">
                      Avg: ₹{Math.round(parseInt(customer.totalSpent.replace('₹', '').replace(',', '')) / customer.orders).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => exportReport('pdf')}
              >
                <FileText className="w-5 h-5 mr-3 text-red-500" />
                <div className="text-left">
                  <p className="font-medium">PDF Report</p>
                  <p className="text-sm text-muted-foreground">Formatted for printing</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => exportReport('excel')}
              >
                <BarChart3 className="w-5 h-5 mr-3 text-green-500" />
                <div className="text-left">
                  <p className="font-medium">Excel Report</p>
                  <p className="text-sm text-muted-foreground">Data analysis ready</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => exportReport('csv')}
              >
                <Download className="w-5 h-5 mr-3 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">CSV Export</p>
                  <p className="text-sm text-muted-foreground">Raw data export</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
