import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import api from '../lib/api';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ active: 0, items: 0, totalSpend: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerStats = async () => {
      try {
        const rentalsRes = await api.get('/rentals/active').catch(() => ({ data: { rental: null } }));
        setStats({
          active: rentalsRes.data.rental ? 1 : 0,
          items: wishlist.length,
          totalSpend: 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };
    fetchCustomerStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const metrics = [
    { label: 'Active Rentals', val: stats.active, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Wishlist Items', val: stats.items, icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'text-rose-600 bg-rose-50' },
    { label: 'Member Status', val: 'Active', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {getGreeting()}, {user?.name} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {stats.active > 0
              ? `You have ${stats.active} active rental right now.`
              : 'Welcome back! Ready to explore new items?'}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary" onClick={() => navigate('/customer/products')}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Browse Products
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {metrics.map((metric, i) => (
          <div key={i} className="stat-card">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-slate-800">{metric.val}</p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${metric.color}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={metric.icon} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-8 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none shadow-lg shadow-indigo-200/50 group cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate('/customer/rentals')}>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-indigo-200 font-medium">My Rentals</span>
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:translate-x-0.5 transition-transform">
            Manage Your Rentals
          </h3>
          <p className="text-indigo-200 text-sm mb-6">
            View active sessions, track returns, and manage your rental history.
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-white/80 group-hover:text-white transition-colors">
            View Rentals
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </div>
        </div>

        <div className="card p-8 group cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/customer/products')}>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm text-slate-400 font-medium">Catalog</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all">
            Browse Products
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            Explore our curated catalog of premium items available for rental.
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
            Explore Now
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;