import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';
import ProductCard from '../../../components/ProductCard';

const LoadingSkeleton = () => (
  <div className="card overflow-hidden flex flex-col h-[340px] animate-pulse">
    <div className="bg-slate-100 aspect-[4/3] w-full" />
    <div className="p-5 flex flex-col flex-1 gap-3">
      <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
      <div className="h-3 bg-slate-100 rounded-lg w-full" />
      <div className="mt-auto flex justify-between items-center pt-3 border-t border-slate-100">
        <div className="h-6 bg-slate-100 rounded-lg w-20" />
        <div className="h-10 w-10 bg-slate-100 rounded-xl" />
      </div>
    </div>
  </div>
);

const RentalShopPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRental, setActiveRental] = useState(null);

  const [filters, setFilters] = useState({
    search: '', category: '', minPrice: '', maxPrice: '', sortBy: 'createdAt', sortOrder: 'desc',
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, hasNext: false });

  useEffect(() => { fetchInitialData(); }, []);
  useEffect(() => { fetchProducts(); }, [filters, pagination.page]);

  const fetchInitialData = async () => {
    try {
      const [categoriesRes, activeRentalRes] = await Promise.all([
        api.get('/products/categories'),
        api.get('/rentals/active').catch(() => ({ data: { rental: null } })),
      ]);
      setCategories(categoriesRes.data.categories || []);
      setActiveRental(activeRentalRes.data.rental);
    } catch (error) {
      console.error('Init data error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        rentable: 'true',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '')),
      });
      const response = await api.get(`/products?${params}`);
      setProducts(response.data.items || []);
      setPagination(prev => ({ ...prev, total: response.data.total || 0, hasNext: response.data.hasNext || false }));
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sortBy: 'createdAt', sortOrder: 'desc' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Browse Products</h1>
          <p className="text-slate-500 mt-1">Discover premium items available for rental.</p>
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="input !pl-10"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Categories</h3>
            <nav className="flex flex-col gap-1">
              <button
                onClick={clearFilters}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${!filters.category ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                All Products
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilters(p => ({ ...p, category: cat }))}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${filters.category === cat ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          </div>

          {/* Price Filter */}
          <div className="card p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">Price Range</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilters(p => ({ ...p, minPrice: e.target.value }))}
                className="input !text-sm !py-2"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters(p => ({ ...p, maxPrice: e.target.value }))}
                className="input !text-sm !py-2"
              />
            </div>
            <button onClick={clearFilters} className="text-xs text-indigo-600 font-medium hover:underline">
              Clear all filters
            </button>
          </div>

          {/* Active Rental Banner */}
          {activeRental && (
            <div className="card p-5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none shadow-lg shadow-indigo-200/40">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-white animate-pulse rounded-full" />
                <span className="text-xs text-indigo-200 font-medium">Active Rental</span>
              </div>
              <h4 className="font-bold text-sm mb-1">{activeRental.product?.name}</h4>
              <p className="text-xs text-indigo-200 mb-4">
                Returns {new Date(activeRental.endDate).toLocaleDateString()}
              </p>
              <button
                onClick={() => navigate('/customer/rentals')}
                className="w-full py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg transition-all"
              >
                View Rental →
              </button>
            </div>
          )}
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{pagination.total} products found</span>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters(prev => ({ ...prev, sortBy, sortOrder }));
              }}
              className="text-sm bg-transparent border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 focus:outline-none focus:border-indigo-300"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="pricePerDay-asc">Price: Low to High</option>
              <option value="pricePerDay-desc">Price: High to Low</option>
              <option value="name-asc">Name: A-Z</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => <LoadingSkeleton key={i} />)}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map(product => (
                <ProductCard key={product._id || product.id} product={product} activeRental={activeRental} />
              ))}
            </div>
          ) : (
            <div className="card p-16 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center text-slate-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700">No products found</h3>
              <p className="text-sm text-slate-400 max-w-xs mx-auto">Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="btn-primary !py-2 !px-5 !text-sm">Clear Filters</button>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="w-9 h-9 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              {Array.from({ length: Math.ceil(pagination.total / pagination.limit) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPagination(p => ({ ...p, page: i + 1 }))}
                  className={`w-9 h-9 rounded-lg font-medium text-sm transition-all ${pagination.page === i + 1 ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={!pagination.hasNext}
                className="w-9 h-9 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RentalShopPage;
