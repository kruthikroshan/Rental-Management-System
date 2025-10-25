import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Plus, Download, TrendingUp, Percent, Users, Receipt, FileText } from 'lucide-react';

interface TaxConfig {
  id: number;
  taxName: string;
  taxType: 'GST' | 'VAT' | 'Service Tax';
  rate: number;
  applicableOn: string;
  isActive: boolean;
}

interface CommissionRule {
  id: number;
  agentName: string;
  agentType: 'Vendor' | 'Sales Agent' | 'Partner';
  commissionType: 'Percentage' | 'Fixed';
  commissionValue: number;
  applicableOn: string;
  totalEarned: number;
  transactionsCount: number;
}

interface TaxReport {
  id: number;
  month: string;
  totalSales: number;
  taxableAmount: number;
  gstCollected: number;
  vatCollected: number;
  totalTax: number;
  status: 'Pending' | 'Filed' | 'Paid';
}

const TaxCommissionManagement: React.FC = () => {
  const [isAddTaxOpen, setIsAddTaxOpen] = useState(false);
  const [isAddCommissionOpen, setIsAddCommissionOpen] = useState(false);

  // Mock tax configurations
  const [taxConfigs, setTaxConfigs] = useState<TaxConfig[]>([
    {
      id: 1,
      taxName: 'GST 18%',
      taxType: 'GST',
      rate: 18,
      applicableOn: 'All Rentals',
      isActive: true
    },
    {
      id: 2,
      taxName: 'Service Tax 5%',
      taxType: 'Service Tax',
      rate: 5,
      applicableOn: 'Services Only',
      isActive: true
    },
    {
      id: 3,
      taxName: 'VAT 12%',
      taxType: 'VAT',
      rate: 12,
      applicableOn: 'Products',
      isActive: false
    }
  ]);

  // Mock commission rules
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([
    {
      id: 1,
      agentName: 'ABC Vendors Pvt Ltd',
      agentType: 'Vendor',
      commissionType: 'Percentage',
      commissionValue: 10,
      applicableOn: 'Photography Equipment',
      totalEarned: 45600,
      transactionsCount: 23
    },
    {
      id: 2,
      agentName: 'John Sales',
      agentType: 'Sales Agent',
      commissionType: 'Percentage',
      commissionValue: 5,
      applicableOn: 'All Sales',
      totalEarned: 28900,
      transactionsCount: 45
    },
    {
      id: 3,
      agentName: 'XYZ Partners',
      agentType: 'Partner',
      commissionType: 'Fixed',
      commissionValue: 500,
      applicableOn: 'Per Transaction',
      totalEarned: 15000,
      transactionsCount: 30
    }
  ]);

  // Mock tax reports
  const taxReports: TaxReport[] = [
    {
      id: 1,
      month: 'October 2025',
      totalSales: 456000,
      taxableAmount: 456000,
      gstCollected: 82080,
      vatCollected: 0,
      totalTax: 82080,
      status: 'Pending'
    },
    {
      id: 2,
      month: 'September 2025',
      totalSales: 523000,
      taxableAmount: 523000,
      gstCollected: 94140,
      vatCollected: 0,
      totalTax: 94140,
      status: 'Filed'
    },
    {
      id: 3,
      month: 'August 2025',
      totalSales: 489000,
      taxableAmount: 489000,
      gstCollected: 88020,
      vatCollected: 0,
      totalTax: 88020,
      status: 'Paid'
    }
  ];

  // Calculate stats
  const stats = {
    totalTaxCollected: taxReports.reduce((sum, r) => sum + r.totalTax, 0),
    currentMonthTax: taxReports[0].totalTax,
    totalCommissionPaid: commissionRules.reduce((sum, r) => sum + r.totalEarned, 0),
    activeAgents: commissionRules.length,
    avgCommissionRate: Math.round(
      commissionRules
        .filter(r => r.commissionType === 'Percentage')
        .reduce((sum, r) => sum + r.commissionValue, 0) /
        commissionRules.filter(r => r.commissionType === 'Percentage').length
    )
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8 text-green-600" />
            Tax & Commission Management
          </h1>
          <p className="text-gray-600 mt-1">Automated tax calculation and commission tracking</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Financial Report
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Receipt className="h-4 w-4" />
              Total Tax Collected
            </CardDescription>
            <CardTitle className="text-2xl">₹{(stats.totalTaxCollected / 1000).toFixed(0)}K</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1 text-blue-600">
              <TrendingUp className="h-4 w-4" />
              Current Month
            </CardDescription>
            <CardTitle className="text-2xl text-blue-600">₹{(stats.currentMonthTax / 1000).toFixed(0)}K</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Percent className="h-4 w-4" />
              Commission Paid
            </CardDescription>
            <CardTitle className="text-2xl">₹{(stats.totalCommissionPaid / 1000).toFixed(0)}K</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Active Agents
            </CardDescription>
            <CardTitle className="text-2xl">{stats.activeAgents}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Commission</CardDescription>
            <CardTitle className="text-2xl">{stats.avgCommissionRate}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tax" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tax">Tax Configuration</TabsTrigger>
          <TabsTrigger value="commission">Commission Rules</TabsTrigger>
          <TabsTrigger value="reports">Tax Reports</TabsTrigger>
        </TabsList>

        {/* Tax Configuration Tab */}
        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tax Configurations</CardTitle>
                  <CardDescription>Manage GST, VAT, and other tax rules</CardDescription>
                </div>
                <Dialog open={isAddTaxOpen} onOpenChange={setIsAddTaxOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Tax Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Tax Configuration</DialogTitle>
                      <DialogDescription>Create a new tax rule for automatic calculation</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Tax Name</Label>
                        <Input placeholder="e.g., GST 18%" />
                      </div>
                      <div>
                        <Label>Tax Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gst">GST</SelectItem>
                            <SelectItem value="vat">VAT</SelectItem>
                            <SelectItem value="service">Service Tax</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Tax Rate (%)</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <div>
                        <Label>Applicable On</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select application" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Rentals</SelectItem>
                            <SelectItem value="products">Products Only</SelectItem>
                            <SelectItem value="services">Services Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddTaxOpen(false)}>Cancel</Button>
                      <Button onClick={() => setIsAddTaxOpen(false)}>Add Tax Rule</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tax Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Applicable On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxConfigs.map(tax => (
                    <TableRow key={tax.id}>
                      <TableCell className="font-medium">{tax.taxName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tax.taxType}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{tax.rate}%</TableCell>
                      <TableCell>{tax.applicableOn}</TableCell>
                      <TableCell>
                        <Badge variant={tax.isActive ? 'default' : 'secondary'}>
                          {tax.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Sample Invoice Calculation */}
          <Card>
            <CardHeader>
              <CardTitle>Sample Invoice Calculation</CardTitle>
              <CardDescription>See how taxes are automatically calculated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal (Base Amount)</span>
                  <span className="font-semibold">₹10,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST 18%</span>
                  <span className="font-semibold text-blue-600">₹1,800</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Tax 5%</span>
                  <span className="font-semibold text-blue-600">₹500</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="font-bold text-lg text-green-600">₹12,300</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Rules Tab */}
        <TabsContent value="commission" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Commission Rules</CardTitle>
                  <CardDescription>Manage agent and vendor commission structures</CardDescription>
                </div>
                <Dialog open={isAddCommissionOpen} onOpenChange={setIsAddCommissionOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Commission Rule
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Commission Rule</DialogTitle>
                      <DialogDescription>Create a new commission structure</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Agent/Vendor Name</Label>
                        <Input placeholder="Enter name" />
                      </div>
                      <div>
                        <Label>Agent Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vendor">Vendor</SelectItem>
                            <SelectItem value="agent">Sales Agent</SelectItem>
                            <SelectItem value="partner">Partner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Commission Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Commission Value</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <div>
                        <Label>Applicable On</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select application" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Sales</SelectItem>
                            <SelectItem value="category">Specific Category</SelectItem>
                            <SelectItem value="transaction">Per Transaction</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddCommissionOpen(false)}>Cancel</Button>
                      <Button onClick={() => setIsAddCommissionOpen(false)}>Add Rule</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent/Vendor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Applicable On</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Total Earned</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionRules.map(rule => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.agentName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.agentType}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {rule.commissionType === 'Percentage' 
                          ? `${rule.commissionValue}%` 
                          : `₹${rule.commissionValue}`}
                      </TableCell>
                      <TableCell>{rule.applicableOn}</TableCell>
                      <TableCell>{rule.transactionsCount}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ₹{rule.totalEarned.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Monthly Tax Reports</CardTitle>
                  <CardDescription>Automatically generated tax summaries</CardDescription>
                </div>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Taxable Amount</TableHead>
                    <TableHead>GST Collected</TableHead>
                    <TableHead>VAT Collected</TableHead>
                    <TableHead>Total Tax</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxReports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.month}</TableCell>
                      <TableCell>₹{report.totalSales.toLocaleString()}</TableCell>
                      <TableCell>₹{report.taxableAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-blue-600">₹{report.gstCollected.toLocaleString()}</TableCell>
                      <TableCell className="text-purple-600">₹{report.vatCollected.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        ₹{report.totalTax.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            report.status === 'Paid' ? 'default' : 
                            report.status === 'Filed' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaxCommissionManagement;
