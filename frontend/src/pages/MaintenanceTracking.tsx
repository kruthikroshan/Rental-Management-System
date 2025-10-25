import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wrench, Plus, Calendar as CalendarIcon, AlertTriangle, CheckCircle2, Clock, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';

interface MaintenanceRecord {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  maintenanceType: 'Cleaning' | 'Inspection' | 'Repair' | 'Servicing';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  scheduledDate: string;
  completedDate?: string;
  technician: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  cost: number;
  notes: string;
  nextServiceDue?: string;
}

const MaintenanceTracking: React.FC = () => {
  const [isCreateMaintenanceOpen, setIsCreateMaintenanceOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock maintenance records
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([
    {
      id: 1,
      productId: 101,
      productName: 'Professional Camera Kit',
      productSku: 'PRD-001',
      maintenanceType: 'Cleaning',
      status: 'Completed',
      scheduledDate: '2025-10-20',
      completedDate: '2025-10-20',
      technician: 'John Tech',
      priority: 'Medium',
      cost: 500,
      notes: 'Lens cleaned, sensor checked',
      nextServiceDue: '2025-11-20'
    },
    {
      id: 2,
      productId: 102,
      productName: 'DJ Equipment Pro',
      productSku: 'PRD-003',
      maintenanceType: 'Inspection',
      status: 'Overdue',
      scheduledDate: '2025-10-22',
      technician: 'Mike Service',
      priority: 'High',
      cost: 800,
      notes: 'Annual safety inspection required',
      nextServiceDue: '2025-10-22'
    },
    {
      id: 3,
      productId: 103,
      productName: 'Party Tent 20x20',
      productSku: 'PRD-004',
      maintenanceType: 'Repair',
      status: 'In Progress',
      scheduledDate: '2025-10-25',
      technician: 'Sarah Fix',
      priority: 'Critical',
      cost: 1200,
      notes: 'Torn fabric needs replacement',
      nextServiceDue: '2025-11-25'
    },
    {
      id: 4,
      productId: 104,
      productName: 'Lighting Equipment Set',
      productSku: 'PRD-002',
      maintenanceType: 'Servicing',
      status: 'Scheduled',
      scheduledDate: '2025-10-28',
      technician: 'Tom Electric',
      priority: 'Medium',
      cost: 600,
      notes: 'Electrical safety check and bulb replacement',
      nextServiceDue: '2025-11-28'
    },
    {
      id: 5,
      productId: 105,
      productName: 'Sound System Premium',
      productSku: 'PRD-005',
      maintenanceType: 'Cleaning',
      status: 'Scheduled',
      scheduledDate: '2025-10-30',
      technician: 'John Tech',
      priority: 'Low',
      cost: 400,
      notes: 'Routine cleaning after event season',
      nextServiceDue: '2025-11-30'
    }
  ]);

  // Stats calculation
  const stats = {
    total: maintenanceRecords.length,
    completed: maintenanceRecords.filter(r => r.status === 'Completed').length,
    inProgress: maintenanceRecords.filter(r => r.status === 'In Progress').length,
    overdue: maintenanceRecords.filter(r => r.status === 'Overdue').length,
    scheduled: maintenanceRecords.filter(r => r.status === 'Scheduled').length,
    totalCost: maintenanceRecords.reduce((sum, r) => sum + r.cost, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Overdue': return 'bg-red-500';
      case 'Scheduled': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600';
      case 'High': return 'text-orange-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredRecords = filterStatus === 'all' 
    ? maintenanceRecords 
    : maintenanceRecords.filter(r => r.status.toLowerCase() === filterStatus);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wrench className="h-8 w-8 text-orange-600" />
            Maintenance & Service Tracking
          </h1>
          <p className="text-gray-600 mt-1">Schedule and track product maintenance activities</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Dialog open={isCreateMaintenanceOpen} onOpenChange={setIsCreateMaintenanceOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule Maintenance</DialogTitle>
                <DialogDescription>Create a new maintenance schedule for a product</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Product</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Professional Camera Kit - PRD-001</SelectItem>
                      <SelectItem value="2">DJ Equipment Pro - PRD-003</SelectItem>
                      <SelectItem value="3">Party Tent 20x20 - PRD-004</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Maintenance Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="servicing">Servicing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Scheduled Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Assigned Technician</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Tech</SelectItem>
                      <SelectItem value="mike">Mike Service</SelectItem>
                      <SelectItem value="sarah">Sarah Fix</SelectItem>
                      <SelectItem value="tom">Tom Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estimated Cost (₹)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea placeholder="Add maintenance notes, requirements, or special instructions..." rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateMaintenanceOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsCreateMaintenanceOpen(false)}>Schedule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Maintenance</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Completed
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-600" />
              In Progress
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.inProgress}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4 text-yellow-600" />
              Scheduled
            </CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.scheduled}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Overdue
            </CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.overdue}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Cost</CardDescription>
            <CardTitle className="text-2xl">₹{stats.totalCost.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Maintenance Records</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
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
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Next Service</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map(record => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{record.productName}</p>
                      <p className="text-sm text-gray-500">{record.productSku}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{record.maintenanceType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${getPriorityColor(record.priority)}`}>
                      {record.priority}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(record.scheduledDate).toLocaleDateString()}</TableCell>
                  <TableCell>{record.technician}</TableCell>
                  <TableCell>₹{record.cost.toLocaleString()}</TableCell>
                  <TableCell>
                    {record.nextServiceDue ? (
                      <span className="text-sm">{new Date(record.nextServiceDue).toLocaleDateString()}</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {record.status === 'Scheduled' && (
                        <Button size="sm" variant="outline">Start</Button>
                      )}
                      {record.status === 'In Progress' && (
                        <Button size="sm">Complete</Button>
                      )}
                      <Button size="sm" variant="ghost">View</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upcoming Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Upcoming Maintenance Alerts
          </CardTitle>
          <CardDescription>Products requiring maintenance in the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {maintenanceRecords
              .filter(r => r.status === 'Scheduled' || r.status === 'Overdue')
              .map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wrench className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">{record.productName}</p>
                      <p className="text-sm text-gray-600">
                        {record.maintenanceType} - Due {new Date(record.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceTracking;
