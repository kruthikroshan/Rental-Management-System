import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Package, TrendingUp, AlertTriangle, Archive, Download, BarChart3, PackageX, Wrench } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  totalStock: number;
  available: number;
  rented: number;
  damaged: number;
  underMaintenance: number;
  timesRented: number;
  revenue: number;
  utilizationRate: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Critical';
}

const InventoryAnalytics: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock inventory data
  const inventoryItems: InventoryItem[] = [
    {
      id: 1,
      name: 'Professional Camera Kit',
      sku: 'PRD-001',
      category: 'Photography',
      totalStock: 15,
      available: 3,
      rented: 10,
      damaged: 1,
      underMaintenance: 1,
      timesRented: 245,
      revenue: 367500,
      utilizationRate: 82,
      status: 'Low Stock'
    },
    {
      id: 2,
      name: 'DJ Equipment Pro',
      sku: 'PRD-003',
      category: 'Audio/Video',
      totalStock: 8,
      available: 0,
      rented: 7,
      damaged: 0,
      underMaintenance: 1,
      timesRented: 189,
      revenue: 378000,
      utilizationRate: 95,
      status: 'Out of Stock'
    },
    {
      id: 3,
      name: 'Party Tent 20x20',
      sku: 'PRD-004',
      category: 'Events',
      totalStock: 12,
      available: 8,
      rented: 3,
      damaged: 1,
      underMaintenance: 0,
      timesRented: 156,
      revenue: 187200,
      utilizationRate: 45,
      status: 'In Stock'
    },
    {
      id: 4,
      name: 'Lighting Equipment Set',
      sku: 'PRD-002',
      category: 'Photography',
      totalStock: 10,
      available: 1,
      rented: 8,
      damaged: 0,
      underMaintenance: 1,
      timesRented: 312,
      revenue: 249600,
      utilizationRate: 88,
      status: 'Low Stock'
    },
    {
      id: 5,
      name: 'Sound System Premium',
      sku: 'PRD-005',
      category: 'Audio/Video',
      totalStock: 6,
      available: 5,
      rented: 1,
      damaged: 0,
      underMaintenance: 0,
      timesRented: 78,
      revenue: 93600,
      utilizationRate: 35,
      status: 'In Stock'
    },
    {
      id: 6,
      name: 'Projector HD',
      sku: 'PRD-006',
      category: 'Presentation',
      totalStock: 5,
      available: 0,
      rented: 3,
      damaged: 2,
      underMaintenance: 0,
      timesRented: 134,
      revenue: 120600,
      utilizationRate: 72,
      status: 'Critical'
    }
  ];

  // Calculate stats
  const stats = {
    totalProducts: inventoryItems.reduce((sum, item) => sum + item.totalStock, 0),
    available: inventoryItems.reduce((sum, item) => sum + item.available, 0),
    rented: inventoryItems.reduce((sum, item) => sum + item.rented, 0),
    damaged: inventoryItems.reduce((sum, item) => sum + item.damaged, 0),
    underMaintenance: inventoryItems.reduce((sum, item) => sum + item.underMaintenance, 0),
    totalRevenue: inventoryItems.reduce((sum, item) => sum + item.revenue, 0),
    avgUtilization: Math.round(
      inventoryItems.reduce((sum, item) => sum + item.utilizationRate, 0) / inventoryItems.length
    ),
    lowStock: inventoryItems.filter(item => item.status === 'Low Stock' || item.status === 'Critical').length
  };

  // Top performing products
  const topProducts = [...inventoryItems]
    .sort((a, b) => b.timesRented - a.timesRented)
    .slice(0, 3);

  // Idle products (low utilization)
  const idleProducts = [...inventoryItems]
    .filter(item => item.utilizationRate < 50)
    .sort((a, b) => a.utilizationRate - b.utilizationRate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-500';
      case 'Low Stock': return 'bg-yellow-500';
      case 'Out of Stock': return 'bg-orange-500';
      case 'Critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredItems = inventoryItems.filter(item => {
    const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
    const statusMatch = filterStatus === 'all' || item.status.toLowerCase().replace(' ', '-') === filterStatus;
    return categoryMatch && statusMatch;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Inventory & Stock Analytics
          </h1>
          <p className="text-gray-600 mt-1">Analyze stock usage, damaged items, and inventory optimization</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              Total Products
            </CardDescription>
            <CardTitle className="text-3xl">{stats.totalProducts}</CardTitle>
            <Progress value={100} className="mt-2" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1 text-green-600">
              <Package className="h-4 w-4" />
              Available
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.available}</CardTitle>
            <Progress value={(stats.available / stats.totalProducts) * 100} className="mt-2" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1 text-blue-600">
              <TrendingUp className="h-4 w-4" />
              Currently Rented
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.rented}</CardTitle>
            <Progress value={(stats.rented / stats.totalProducts) * 100} className="mt-2" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Damaged
            </CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.damaged}</CardTitle>
            <Progress value={(stats.damaged / stats.totalProducts) * 100} className="mt-2" />
          </CardHeader>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1">
              <Wrench className="h-4 w-4" />
              Under Maintenance
            </CardDescription>
            <CardTitle className="text-2xl">{stats.underMaintenance} items</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Average Utilization Rate</CardDescription>
            <CardTitle className="text-2xl">{stats.avgUtilization}%</CardTitle>
            <Progress value={stats.avgUtilization} className="mt-2" />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Revenue Generated</CardDescription>
            <CardTitle className="text-2xl">₹{(stats.totalRevenue / 1000).toFixed(0)}K</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Top Performing Products */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Top Performing Products
            </CardTitle>
            <CardDescription>Most frequently rented items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.timesRented} rentals</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">₹{(product.revenue / 1000).toFixed(0)}K</p>
                    <Badge variant="outline">{product.utilizationRate}% utilized</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-orange-600" />
              Idle / Low Utilization Products
            </CardTitle>
            <CardDescription>Products with utilization below 50%</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {idleProducts.length > 0 ? (
                idleProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.timesRented} rentals</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getUtilizationColor(product.utilizationRate)}>
                        {product.utilizationRate}%
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{product.available} available</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">All products are well utilized</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory Details</CardTitle>
            <div className="flex gap-3">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Photography">Photography</SelectItem>
                  <SelectItem value="Audio/Video">Audio/Video</SelectItem>
                  <SelectItem value="Events">Events</SelectItem>
                  <SelectItem value="Presentation">Presentation</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Total Stock</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Rented</TableHead>
                <TableHead>Damaged</TableHead>
                <TableHead>Maintenance</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Times Rented</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.sku}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{item.totalStock}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-green-600" />
                      {item.available}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      {item.rented}
                    </span>
                  </TableCell>
                  <TableCell>
                    {item.damaged > 0 ? (
                      <span className="flex items-center gap-1 text-red-600">
                        <PackageX className="h-4 w-4" />
                        {item.damaged}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.underMaintenance > 0 ? (
                      <span className="flex items-center gap-1 text-orange-600">
                        <Wrench className="h-4 w-4" />
                        {item.underMaintenance}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={item.utilizationRate} className="w-16" />
                      <span className={`text-sm font-semibold ${getUtilizationColor(item.utilizationRate)}`}>
                        {item.utilizationRate}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{item.timesRented}</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    ₹{(item.revenue / 1000).toFixed(1)}K
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Stock Alerts
          </CardTitle>
          <CardDescription>Products requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inventoryItems
              .filter(item => item.status === 'Critical' || item.status === 'Out of Stock' || item.damaged > 0)
              .map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.status === 'Out of Stock' && 'No units available'}
                        {item.status === 'Critical' && `${item.damaged} damaged, stock critical`}
                        {item.damaged > 0 && item.status !== 'Critical' && `${item.damaged} units damaged`}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryAnalytics;
