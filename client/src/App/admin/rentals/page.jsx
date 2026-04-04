import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';

const AdminRentalsPage = () => {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRental, setSelectedRental] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/rentals');
      console.log('📊 [FetchRentals] Response:', response.data);

      // Map _id to id for compatibility
      const rentalsData = (response.data.items || []).map(rental => {
        const id = rental._id || rental.id;
        if (!id) {
          console.warn('⚠️ [FetchRentals] Rental has no id:', rental);
        }
        return {
          ...rental,
          id: id ? id.toString() : 'unknown'
        };
      });

      console.log('✅ [FetchRentals] Fetched', rentalsData.length, 'rentals');
      setRentals(rentalsData);
    } catch (error) {
      console.error('Failed to fetch rentals:', error);
      setError('Failed to load rentals: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRentalOrder = (rental) => {
    setSelectedRental(rental);
    setShowCreateForm(true);
  };

  // ** FIXED: This function now handles the file download correctly **
  const handleGeneratePDF = async (rental) => {
    try {
      // 1. Call the API, specifying that the expected response is a 'blob' (a file)
      const response = await api.post(`/rentals/${rental.id}/generate-pdf`, {}, {
        responseType: 'blob', 
      });

      // 2. Create a blob from the response
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });

      // 3. Create a temporary URL for the blob
      const url = window.URL.createObjectURL(pdfBlob);
      
      // 4. Create a temporary link to trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `rental_invoice_${rental.id}.pdf`; // Set the download filename
      document.body.appendChild(a);
      
      // 5. Click the link and then remove it
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // ** ADDED: A similar function for the download button **
  const handleDownloadPDF = async (rental) => {
    try {
      const response = await api.get(`/rentals/${rental.id}/download-pdf`, {
        responseType: 'blob',
      });

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rental_receipt_${rental.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };


  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'PICKED_UP':
        return 'bg-green-100 text-green-800';
      case 'RETURNED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilteredRentals = () => {
    let filtered = rentals;

    if (filter !== 'all') {
      filtered = filtered.filter(rental => rental.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(rental =>
        (rental.userName && String(rental.userName).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rental.userEmail && String(rental.userEmail).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rental.product?.name && String(rental.product.name).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (rental.id && String(rental.id).toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Rental Orders</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage rental orders and generate formal documentation.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => {
              setSelectedRental(null);
              setShowCreateForm(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Quotation
          </button>
        </div>
      </div>

      {/* Filters and Search (Matched to ERP Style) */}
      <div className="bg-white rounded-t-lg border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4">
          
          <div className="relative flex-1 max-w-2xl flex items-center bg-gray-100 rounded border border-gray-200 px-3 py-1.5 shadow-inner">
            <svg className="h-4 w-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div className="flex space-x-2 mr-2">
              <button onClick={() => setFilter('all')} className={`${filter === 'all' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-700'} px-2 py-0.5 rounded text-xs flex items-center`}>
                All
              </button>
              <button onClick={() => setFilter('PENDING')} className={`${filter === 'PENDING' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-700'} px-2 py-0.5 rounded text-xs flex items-center`}>
                Quotations {filter === 'PENDING' && <span className="ml-1 text-gray-500 hover:text-gray-900">×</span>}
              </button>
              <button onClick={() => setFilter('CONFIRMED')} className={`${filter === 'CONFIRMED' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-700'} px-2 py-0.5 rounded text-xs flex items-center`}>
                Orders {filter === 'CONFIRMED' && <span className="ml-1 text-gray-500 hover:text-gray-900">×</span>}
              </button>
              <button onClick={() => setFilter('PICKED_UP')} className={`${filter === 'PICKED_UP' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-700'} px-2 py-0.5 rounded text-xs flex items-center`}>
                Pickup {filter === 'PICKED_UP' && <span className="ml-1 text-gray-500 hover:text-gray-900">×</span>}
              </button>
              <button onClick={() => setFilter('RETURNED')} className={`${filter === 'RETURNED' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-700'} px-2 py-0.5 rounded text-xs flex items-center`}>
                Return {filter === 'RETURNED' && <span className="ml-1 text-gray-500 hover:text-gray-900">×</span>}
              </button>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm flex-1 outline-none text-gray-700"
            />
          </div>

          <div className="flex items-center space-x-2 mt-4 lg:mt-0 text-gray-500">
            <span className="text-sm">1-{(getFilteredRentals().length)} / {getFilteredRentals().length}</span>
            <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Rentals Table */}
      <div className="bg-white shadow-sm overflow-hidden border-x border-b border-gray-200 min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 border-r border-gray-200 bg-gray-50 uppercase tracking-wider w-10 text-center">
                  <input type="checkbox" className="rounded text-purple-600 border-gray-300 focus:ring-purple-500" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 border-r border-gray-200 bg-gray-50">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 border-r border-gray-200 bg-gray-50">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 border-r border-gray-200 bg-gray-50">Representative</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 border-r border-gray-200 bg-gray-50">Delivery Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 border-r border-gray-200 bg-gray-50">Return Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 border-r border-gray-200 bg-gray-50">Next Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 border-r border-gray-200 bg-gray-50">Source Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 bg-gray-50 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredRentals().map((rental) => (
                <tr key={rental.id} onClick={() => handleCreateRentalOrder(rental)} className="hover:bg-gray-100 cursor-pointer border-b border-gray-200">
                  <td className="px-4 py-2 whitespace-nowrap text-center">
                    <input type="checkbox" onClick={(e) => e.stopPropagation()} className="rounded text-purple-600 border-gray-300 focus:ring-purple-500" />
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 border-r border-gray-100 font-medium">
                    S{rental.id && rental.id.slice ? rental.id.slice(0, 5) : '00018'}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-700 border-r border-gray-100 font-bold">
                    {rental.userName}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 border-r border-gray-100">
                    Admin
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 border-r border-gray-100">
                    {new Date(rental.startDate).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit' })}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 border-r border-gray-100">
                    {new Date(rental.endDate).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit' })}
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 border-r border-gray-100">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full inline-flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Delivery
                    </span>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 border-r border-gray-100">
                    -
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap text-sm text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase ${getStatusBadgeColor(rental.status)}`}>
                      {rental.status === 'PENDING' ? 'Quotation' : rental.status === 'CONFIRMED' ? 'Rental Order' : rental.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {getFilteredRentals().length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || filter !== 'all' ? 'No matching rentals' : 'No rentals'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No rental orders have been placed yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Rental Order Form Modal */}
      {showCreateForm && (
        <RentalOrderFormModal
          rental={selectedRental}
          onClose={() => {
            setShowCreateForm(false);
            setSelectedRental(null);
          }}
          onSuccess={() => {
            fetchRentals();
            setShowCreateForm(false);
            setSelectedRental(null);
          }}
        />
      )}
    </div>
  );
};

const RentalOrderFormModal = ({ rental, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customer: rental?.userName || '',
    invoiceAddress: '',
    deliveryAddress: '',
    rentalTemplate: 'Standard Rental',
    expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rentalOrderDate: new Date().toISOString().split('T')[0],
    priceList: 'Standard',
    rentalPeriod: rental ? `${rental.totalDays} days` : '1 day',
    rentalDuration: rental ? `${rental.totalDays} days` : '1 day',
    termsConditions: 'Standard terms and conditions apply for this rental agreement. Product must be returned in the same condition as received. Late returns incur additional charges.',
    items: rental ? [{
      product: rental.product?.name || 'Product',
      quantity: 1,
      unitPrice: Number(rental.pricePerDay || 0),
      tax: Math.round(Number(rental.totalPrice || 0) * 0.18), // 18% GST
      subTotal: Number(rental.totalPrice || 0)
    }] : [{
      product: 'New Product',
      quantity: 1,
      unitPrice: 0,
      tax: 0,
      subTotal: 0
    }]
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orderlines');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' || field === 'unitPrice' || field === 'tax' ? Number(value) : value
    };
    
    // Recalculate subtotal
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].subTotal = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        product: 'New Product',
        quantity: 1,
        unitPrice: 100,
        tax: 18,
        subTotal: 100
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return; // Keep at least one item
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const untaxedTotal = formData.items.reduce((sum, item) => sum + item.subTotal, 0);
    const totalTax = formData.items.reduce((sum, item) => sum + item.tax, 0);
    const total = untaxedTotal + totalTax;
    
    return { untaxedTotal, tax: totalTax, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { untaxedTotal, tax, total } = calculateTotals();
      
      const orderData = {
        ...formData,
        rentalId: rental.id,
        untaxedTotal,
        tax,
        total
      };

      const response = await api.post('/rentals/create-order', orderData);
      
      if (response.data.success) {
        alert('Rental order created successfully!');
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create rental order:', error);
      alert('Failed to create rental order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      const { untaxedTotal, tax, total } = calculateTotals();
      
      const orderData = {
        ...formData,
        rentalId: rental.id,
        untaxedTotal,
        tax,
        total
      };

      const response = await api.post(`/rentals/${rental.id}/generate-pdf`, orderData, {
        responseType: 'blob',
      });
      
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rental_invoice_${rental.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { untaxedTotal, tax, total } = calculateTotals();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white mb-8">
        {/* Header */}
        {/* Top Actions & Status Header */}
        <div className="bg-gray-50 border-b border-gray-200 rounded-t-md">
          {/* Breadcrumb / Title */}
          <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-white">
            <div className="text-xl text-gray-800">
              <span className="text-purple-600 hover:text-purple-800 cursor-pointer text-base">Rental Orders</span>
              <span className="mx-2 text-gray-400">/</span>
              <span className="font-semibold text-lg">{rental ? `R${rental.id && rental.id.slice ? rental.id.slice(0, 6) : String(rental.id || 'unknown')}` : 'New'}</span>
            </div>
            
            <div className="flex space-x-2">
              <button onClick={handleGeneratePDF} disabled={loading} className="p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 flex items-center shadow-sm bg-white">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Invoice
              </button>
              <button className="p-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 flex items-center shadow-sm bg-white">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          
          {/* Status and Action Buttons */}
          <div className="px-6 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-gray-200">
            <div className="flex space-x-2">
              <button type="button" className="bg-purple-600 text-white px-4 py-1.5 rounded shadow-sm text-sm font-medium hover:bg-purple-700 uppercase">
                Send by Email
              </button>
              <button type="button" className="bg-white border border-gray-300 text-gray-800 px-4 py-1.5 rounded shadow-sm text-sm font-medium hover:bg-gray-50 uppercase">
                Confirm
              </button>
              <button type="button" className="bg-white border border-gray-300 text-gray-800 px-4 py-1.5 rounded shadow-sm text-sm font-medium hover:bg-gray-50 uppercase">
                Cancel
              </button>
            </div>
            
            {/* Status Chevron Bar */}
            <div className="flex border border-gray-200 rounded text-sm font-medium overflow-hidden bg-white shadow-sm">
              <div className="px-4 py-2 bg-purple-600 text-white flex items-center relative">
                Quotation
                <div className="absolute right-[-10px] top-0 bottom-0 w-[10px] bg-purple-600 z-10" style={{clipPath: 'polygon(0 0, 100% 50%, 0 100%)'}}></div>
              </div>
              <div className="px-4 py-2 text-gray-400 bg-gray-50 flex items-center pl-6 border-l border-white relative">
                Quotation Sent
                <div className="absolute right-[-10px] top-0 bottom-0 w-[10px] bg-gray-50 z-10 border-l border-gray-200" style={{clipPath: 'polygon(0 0, 100% 50%, 0 100%)'}}></div>
              </div>
              <div className="px-4 py-2 text-gray-400 bg-gray-50 flex items-center pl-6 border-l border-white">
                Rental Order
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Order ID */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {rental ? `→R${rental.id && rental.id.slice ? rental.id.slice(0, 6) : String(rental.id || 'unknown')}` : 'New Quotation'}
            </h2>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer:</label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => handleInputChange('customer', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Address:</label>
                <textarea
                  value={formData.invoiceAddress}
                  onChange={(e) => handleInputChange('invoiceAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="2"
                  placeholder="Enter invoice address..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address:</label>
                <textarea
                  value={formData.deliveryAddress}
                  onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="2"
                  placeholder="Enter delivery address..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rental Template:</label>
                <select
                  value={formData.rentalTemplate}
                  onChange={(e) => handleInputChange('rentalTemplate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Standard Rental">Standard Rental</option>
                  <option value="Premium Rental">Premium Rental</option>
                  <option value="Basic Rental">Basic Rental</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration:</label>
                <input
                  type="date"
                  value={formData.expiration}
                  onChange={(e) => handleInputChange('expiration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rental Order Date:</label>
                <input
                  type="date"
                  value={formData.rentalOrderDate}
                  onChange={(e) => handleInputChange('rentalOrderDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price List:</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={formData.priceList}
                    onChange={(e) => handleInputChange('priceList', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Discount">Discount</option>
                  </select>
                  <button
                    type="button"
                    className="bg-purple-500 text-white px-3 py-2 rounded-md text-sm hover:bg-purple-600"
                  >
                    Update Prices
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rental Period:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                    defaultValue={rental ? new Date(rental.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  />
                  <span className="text-gray-500 text-sm">to</span>
                  <input
                    type="date"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
                    defaultValue={rental ? new Date(rental.endDate).toISOString().split('T')[0] : new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  />
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">({rental ? rental.totalDays : 1} Days)</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rental Duration:</label>
                <input
                  type="text"
                  value={formData.rentalDuration}
                  onChange={(e) => handleInputChange('rentalDuration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('orderlines')}
                  className={`py-2 px-1 text-sm font-medium ${
                    activeTab === 'orderlines'
                      ? 'border-b-2 border-purple-500 text-purple-600'
                      : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Order lines
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-1 text-sm font-medium ${
                    activeTab === 'details'
                      ? 'border-b-2 border-purple-500 text-purple-600'
                      : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Other details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notes')}
                  className={`py-2 px-1 text-sm font-medium ${
                    activeTab === 'notes'
                      ? 'border-b-2 border-purple-500 text-purple-600'
                      : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Rental Notes
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'orderlines' && (
            <div className="mb-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Product</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Quantity</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Unit Price</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Tax</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Sub Total</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.product}
                            onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.tax}
                            onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-2 font-medium">₹{item.subTotal.toLocaleString()}</td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                            disabled={formData.items.length === 1}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-between items-start">
                <button
                  type="button"
                  onClick={addItem}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium bg-purple-50 px-3 py-1.5 rounded"
                >
                  Add a product
                </button>
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Untaxed Amount:</span>
                    <span>₹{untaxedTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes:</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-lg border-t pt-2 border-gray-200">
                    <span>Total:</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms:</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Immediate Payment</option>
                    <option>15 Days</option>
                    <option>30 Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method:</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Pickup</option>
                    <option>Home Delivery</option>
                    <option>Express Delivery</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms & Conditions:</label>
              <textarea
                value={formData.termsConditions}
                onChange={(e) => handleInputChange('termsConditions', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="6"
              />
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Untaxed Total:</span>
                <span className="text-sm font-medium">₹{untaxedTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax:</span>
                <span className="text-sm font-medium">₹{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-bold">Total:</span>
                <span className="text-sm font-bold">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-2 rounded-md font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Rental Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRentalsPage;
