import React, { useState, useEffect } from 'react';
import api from '../../../lib/api';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/rentals');
      const ordersData = (response.data.items || []).map(order => ({
        ...order,
        id: (order._id || order.id || 'unknown').toString(),
      }));
      setOrders(ordersData);
    } catch (error) {
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/rentals/${orderId}/status`, { status: newStatus });
      await fetchOrders();
    } catch (error) {
      setError('Failed to update order status.');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: 'badge-warning',
      CONFIRMED: 'badge-info',
      PICKED_UP: 'badge-success',
      RETURNED: 'badge-neutral',
      CANCELLED: 'badge-danger',
      OVERDUE: 'badge-danger',
    };
    return map[status] || 'badge-neutral';
  };

  const getFilteredOrders = () => {
    let filtered = orders;
    if (filter !== 'all') filtered = filtered.filter(o => o.status === filter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o =>
        o.userName?.toLowerCase().includes(term) ||
        o.userEmail?.toLowerCase().includes(term) ||
        o.product?.name?.toLowerCase().includes(term) ||
        o.id?.toLowerCase().includes(term)
      );
    }
    return filtered;
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Orders', val: orders.length, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Active', val: orders.filter(o => ['CONFIRMED', 'PICKED_UP'].includes(o.status)).length, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Pending', val: orders.filter(o => o.status === 'PENDING').length, color: 'text-amber-600 bg-amber-50' },
    { label: 'Revenue', val: `₹${orders.reduce((s, o) => s + (Number(o.totalPrice) || 0), 0).toLocaleString()}`, color: 'text-blue-600 bg-blue-50' },
  ];

  const filters = ['all', 'PENDING', 'CONFIRMED', 'PICKED_UP', 'RETURNED', 'CANCELLED', 'OVERDUE'];
  const filterLabels = { all: 'All', PENDING: 'Pending', CONFIRMED: 'Confirmed', PICKED_UP: 'Picked Up', RETURNED: 'Returned', CANCELLED: 'Cancelled', OVERDUE: 'Overdue' };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Orders</h1>
          <p className="text-slate-500 mt-1">Track and manage all rental orders.</p>
        </div>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input !pl-10"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-slate-800 mono-num">{stat.val}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === s
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {filterLabels[s]}
            <span className="ml-1.5 text-xs opacity-60">{orders.filter(o => s === 'all' ? true : o.status === s).length}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">{error}</div>
      )}

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Duration</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredOrders().map((order) => (
                <tr key={order.id}>
                  <td><span className="font-medium text-slate-600 mono-num text-sm">#{order.id.slice(-8).toUpperCase()}</span></td>
                  <td>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">{order.userName}</p>
                      <p className="text-xs text-slate-400">{order.userEmail}</p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-medium text-slate-700 text-sm truncate max-w-[140px]">{order.product?.name || 'N/A'}</p>
                      <p className="text-xs text-slate-400">{order.product?.category || 'General'}</p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="text-sm text-slate-600">{new Date(order.startDate).toLocaleDateString()} → {new Date(order.endDate).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-400">{order.totalDays} days</p>
                    </div>
                  </td>
                  <td><span className="font-semibold text-slate-800 mono-num">₹{order.totalPrice.toLocaleString()}</span></td>
                  <td><span className={`badge ${getStatusBadge(order.status)}`}>{order.status.replace('_', ' ')}</span></td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      {order.status === 'PENDING' && (
                        <button onClick={() => updateOrderStatus(order.id, 'CONFIRMED')} className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all">Approve</button>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <button onClick={() => updateOrderStatus(order.id, 'PICKED_UP')} className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all">Handover</button>
                      )}
                      {order.status === 'PICKED_UP' && (
                        <button onClick={() => updateOrderStatus(order.id, 'RETURNED')} className="px-3 py-1.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all">Return</button>
                      )}
                      {['PENDING', 'CONFIRMED'].includes(order.status) && (
                        <button onClick={() => updateOrderStatus(order.id, 'CANCELLED')} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Cancel">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {getFilteredOrders().length === 0 && (
          <div className="p-16 text-center">
            <p className="text-slate-400">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersManagement;
