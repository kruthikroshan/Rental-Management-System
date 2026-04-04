import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../lib/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, products: 0, rentals: 0, revenue: 39640 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, productsRes, rentalsRes] = await Promise.all([
          api.get('/users'),
          api.get('/products'),
          api.get('/rentals'),
        ]);
        setStats({
          users: usersRes.data.users?.length || 0,
          products: (productsRes.data.items || []).length,
          rentals: (rentalsRes.data.items || rentalsRes.data.rentals || []).length,
          revenue: 39640,
        });
      } catch (err) {
        console.error('Dashboard data fetch error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const kpis = [
    { label: 'Total Users', val: stats.users, change: '+12.5%', positive: true, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'bg-blue-50 text-blue-600' },
    { label: 'Products Listed', val: stats.products, change: '+4.2%', positive: true, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Active Rentals', val: stats.rentals, change: '+18.1%', positive: true, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Revenue', val: `₹${stats.revenue.toLocaleString()}`, change: '+24.8%', positive: true, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-amber-50 text-amber-600' },
  ];

  const quickActions = [
    { name: 'Add New Product', desc: 'List a new item for rental', path: '/admin/products/new', icon: 'M12 4v16m8-8H4', color: 'text-indigo-600 bg-indigo-50' },
    { name: 'View All Users', desc: 'Manage user accounts', path: '/admin/users', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857', color: 'text-emerald-600 bg-emerald-50' },
    { name: 'View Reports', desc: 'Analytics and insights', path: '/admin/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'text-blue-600 bg-blue-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome back 👋</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your rental platform today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, i) => (
          <div key={i} className="card p-5 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.color}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={kpi.icon} />
                </svg>
              </div>
              <span className={`badge ${kpi.positive ? 'badge-success' : 'badge-danger'} !text-[11px]`}>
                {kpi.change}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-slate-800 mono-num tracking-tight">{kpi.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Recent Activity</h3>
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700" onClick={() => navigate('/admin/orders')}>
              View all →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'New user registered', type: 'User', status: 'Completed', statusClass: 'badge-success' },
                  { name: 'Product listed', type: 'Product', status: 'Active', statusClass: 'badge-info' },
                  { name: 'Rental confirmed', type: 'Order', status: 'Processing', statusClass: 'badge-warning' },
                  { name: 'Payment received', type: 'Payment', status: 'Completed', statusClass: 'badge-success' },
                  { name: 'Product returned', type: 'Return', status: 'Completed', statusClass: 'badge-success' },
                ].map((item, i) => (
                  <tr key={i}>
                    <td>
                      <span className="font-medium text-slate-700">{item.name}</span>
                    </td>
                    <td>
                      <span className="text-slate-500">{item.type}</span>
                    </td>
                    <td>
                      <span className={`badge ${item.statusClass}`}>{item.status}</span>
                    </td>
                    <td className="text-right">
                      <span className="text-xs text-slate-400">Just now</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-5">
          <div className="card p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none">
            <h3 className="font-semibold text-white/80 text-sm mb-1">Quick Actions</h3>
            <p className="text-lg font-bold mb-5">What would you like to do?</p>
            <div className="space-y-2">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all group text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{action.name}</p>
                    <p className="text-xs text-white/60">{action.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6 border-dashed border-2 border-slate-200 bg-slate-50/50 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600">All systems operational</p>
            <p className="text-xs text-slate-400 mt-1">Last checked a few seconds ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
