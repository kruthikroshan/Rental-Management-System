import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, UserPlus, Edit, Trash2, Users, Lock, CheckCircle2 } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
  color: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  assignedDate: string;
}

const RoleManagement: React.FC = () => {
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Available permissions grouped by module
  const allPermissions: Permission[] = [
    // Products Module
    { id: 'products.view', name: 'View Products', description: 'Can view product listings', module: 'Products' },
    { id: 'products.create', name: 'Create Products', description: 'Can add new products', module: 'Products' },
    { id: 'products.edit', name: 'Edit Products', description: 'Can modify product details', module: 'Products' },
    { id: 'products.delete', name: 'Delete Products', description: 'Can remove products', module: 'Products' },
    
    // Bookings Module
    { id: 'bookings.view', name: 'View Bookings', description: 'Can view booking records', module: 'Bookings' },
    { id: 'bookings.create', name: 'Create Bookings', description: 'Can create new bookings', module: 'Bookings' },
    { id: 'bookings.approve', name: 'Approve Bookings', description: 'Can approve/reject bookings', module: 'Bookings' },
    { id: 'bookings.cancel', name: 'Cancel Bookings', description: 'Can cancel bookings', module: 'Bookings' },
    
    // Invoices Module
    { id: 'invoices.view', name: 'View Invoices', description: 'Can view invoices', module: 'Invoices' },
    { id: 'invoices.create', name: 'Create Invoices', description: 'Can generate invoices', module: 'Invoices' },
    { id: 'invoices.edit', name: 'Edit Invoices', description: 'Can modify invoices', module: 'Invoices' },
    
    // Payments Module
    { id: 'payments.view', name: 'View Payments', description: 'Can view payment records', module: 'Payments' },
    { id: 'payments.process', name: 'Process Payments', description: 'Can process payments', module: 'Payments' },
    
    // Deliveries Module
    { id: 'deliveries.view', name: 'View Deliveries', description: 'Can view delivery records', module: 'Deliveries' },
    { id: 'deliveries.update', name: 'Update Deliveries', description: 'Can update delivery status', module: 'Deliveries' },
    
    // Users Module
    { id: 'users.view', name: 'View Users', description: 'Can view user accounts', module: 'Users' },
    { id: 'users.create', name: 'Create Users', description: 'Can add new users', module: 'Users' },
    { id: 'users.edit', name: 'Edit Users', description: 'Can modify user details', module: 'Users' },
    { id: 'users.delete', name: 'Delete Users', description: 'Can remove users', module: 'Users' },
    
    // Reports Module
    { id: 'reports.view', name: 'View Reports', description: 'Can view analytics and reports', module: 'Reports' },
    { id: 'reports.export', name: 'Export Reports', description: 'Can export reports', module: 'Reports' },
  ];

  // Mock data for roles
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      name: 'Manager',
      description: 'Can approve rentals, edit products, and view reports',
      permissions: ['products.view', 'products.edit', 'bookings.view', 'bookings.approve', 'reports.view'],
      userCount: 3,
      createdAt: '2025-01-15',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Staff',
      description: 'Can update deliveries, returns, and create bookings',
      permissions: ['bookings.view', 'bookings.create', 'deliveries.view', 'deliveries.update', 'products.view'],
      userCount: 8,
      createdAt: '2025-01-15',
      color: 'bg-green-500'
    },
    {
      id: 3,
      name: 'Accountant',
      description: 'Can view invoices, payments, and financial reports',
      permissions: ['invoices.view', 'invoices.create', 'payments.view', 'payments.process', 'reports.view', 'reports.export'],
      userCount: 2,
      createdAt: '2025-01-15',
      color: 'bg-purple-500'
    },
    {
      id: 4,
      name: 'Admin',
      description: 'Full system access with all permissions',
      permissions: allPermissions.map(p => p.id),
      userCount: 1,
      createdAt: '2025-01-10',
      color: 'bg-red-500'
    }
  ]);

  // Mock data for users
  const mockUsers: User[] = [
    { id: 1, name: 'John Manager', email: 'john@example.com', role: 'Manager', status: 'Active', assignedDate: '2025-01-20' },
    { id: 2, name: 'Sarah Staff', email: 'sarah@example.com', role: 'Staff', status: 'Active', assignedDate: '2025-01-22' },
    { id: 3, name: 'Mike Accountant', email: 'mike@example.com', role: 'Accountant', status: 'Active', assignedDate: '2025-01-18' },
    { id: 4, name: 'Lisa Staff', email: 'lisa@example.com', role: 'Staff', status: 'Active', assignedDate: '2025-01-25' },
    { id: 5, name: 'Tom Manager', email: 'tom@example.com', role: 'Manager', status: 'Inactive', assignedDate: '2025-01-15' },
  ];

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const handlePermissionToggle = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleCreateRole = () => {
    const role: Role = {
      id: roles.length + 1,
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions,
      userCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      color: 'bg-gray-500'
    };
    setRoles([...roles, role]);
    setIsCreateRoleOpen(false);
    setNewRole({ name: '', description: '', permissions: [] });
  };

  const handleDeleteRole = (roleId: number) => {
    if (confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(r => r.id !== roleId));
    }
  };

  // Group permissions by module
  const groupedPermissions = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Role-Based Access Control
          </h1>
          <p className="text-gray-600 mt-1">Manage user roles and permissions</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Role to User</DialogTitle>
                <DialogDescription>Select a user and assign them a role</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select User</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map(user => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Select Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignRoleOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsAssignRoleOpen(false)}>Assign Role</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Shield className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>Define a new role with specific permissions</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Role Name</Label>
                  <Input
                    placeholder="e.g., Manager"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    placeholder="Brief description of this role"
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-3 block">Permissions ({newRole.permissions.length} selected)</Label>
                  <div className="space-y-4 border rounded-lg p-4 max-h-96 overflow-y-auto">
                    {Object.entries(groupedPermissions).map(([module, permissions]) => (
                      <div key={module} className="space-y-2">
                        <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                          <Lock className="h-4 w-4" />
                          {module}
                        </h4>
                        <div className="grid grid-cols-2 gap-3 ml-6">
                          {permissions.map(permission => (
                            <div key={permission.id} className="flex items-start space-x-2">
                              <Checkbox
                                id={permission.id}
                                checked={newRole.permissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <label
                                  htmlFor={permission.id}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                  {permission.name}
                                </label>
                                <p className="text-xs text-gray-500">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateRole} disabled={!newRole.name || newRole.permissions.length === 0}>
                  Create Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map(role => (
          <Card key={role.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`h-10 w-10 rounded-lg ${role.color} flex items-center justify-center text-white`}>
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {role.name !== 'Admin' && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteRole(role.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
              <CardTitle className="mt-3">{role.name}</CardTitle>
              <CardDescription className="text-sm">{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Users
                  </span>
                  <Badge variant="secondary">{role.userCount}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Permissions
                  </span>
                  <Badge variant="secondary">{role.permissions.length}</Badge>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">Created: {new Date(role.createdAt).toLocaleDateString()}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedRole(role)}>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users with Assigned Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Users & Role Assignments</CardTitle>
          <CardDescription>Overview of all users and their assigned roles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.assignedDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Change Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Details Dialog */}
      {selectedRole && (
        <Dialog open={!!selectedRole} onOpenChange={() => setSelectedRole(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded ${selectedRole.color} flex items-center justify-center text-white`}>
                  <Shield className="h-4 w-4" />
                </div>
                {selectedRole.name}
              </DialogTitle>
              <DialogDescription>{selectedRole.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Assigned Permissions ({selectedRole.permissions.length})</h4>
                <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {selectedRole.permissions.map(permId => {
                    const perm = allPermissions.find(p => p.id === permId);
                    return perm ? (
                      <div key={perm.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{perm.name}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RoleManagement;
