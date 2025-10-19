import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Search, UserPlus, Check } from 'lucide-react';
import { Customer } from '../BookingWizard';

interface CustomerStepProps {
  selectedCustomer: Customer | null;
  onSelectCustomer: (customer: Customer) => void;
}

const CustomerStep: React.FC<CustomerStepProps> = ({ selectedCustomer, onSelectCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState<Omit<Customer, 'id'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // Mock customer data
  useEffect(() => {
    const mockCustomers: Customer[] = [
      { id: '1', name: 'John Doe', email: 'john@example.com', phone: '555-0101', address: '123 Main St' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '555-0102', address: '456 Oak Ave' },
      { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '555-0103', address: '789 Pine Rd' },
      { id: '4', name: 'Alice Williams', email: 'alice@example.com', phone: '555-0104', address: '321 Elm St' },
      { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-0105', address: '654 Maple Dr' },
    ];
    setCustomers(mockCustomers);
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.email && newCustomer.phone) {
      const customer: Customer = {
        id: `new-${Date.now()}`,
        ...newCustomer,
      };
      setCustomers([customer, ...customers]);
      onSelectCustomer(customer);
      setShowAddForm(false);
      setNewCustomer({ name: '', email: '', phone: '', address: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'secondary' : 'default'}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Add New</span>
        </Button>
      </div>

      {/* Add Customer Form */}
      {showAddForm && (
        <Card className="p-6 border-2 border-blue-200 bg-blue-50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add New Customer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                placeholder="555-0123"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main St"
                value={newCustomer.address}
                onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleAddCustomer} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Customer List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">
          {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
        </h3>
        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
          {filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCustomer?.id === customer.id
                  ? 'border-2 border-blue-500 bg-blue-50'
                  : 'border hover:border-blue-300'
              }`}
              onClick={() => onSelectCustomer(customer)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                    {customer.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                    {customer.address && (
                      <p className="text-xs text-gray-400 mt-1">{customer.address}</p>
                    )}
                  </div>
                </div>
                {selectedCustomer?.id === customer.id && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No customers found matching "{searchTerm}"</p>
          <Button onClick={() => setShowAddForm(true)} variant="link" className="mt-2">
            Add a new customer instead
          </Button>
        </div>
      )}
    </div>
  );
};

export default CustomerStep;
