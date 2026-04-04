import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../lib/api';

const ProductsManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/products');
      const productsData = (response.data.items || []).map(product => ({
        ...product,
        id: (product._id || product.id || 'unknown').toString(),
      }));
      setProducts(productsData);
    } catch (error) {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/products/${productToDelete.id}`);
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      setError('Failed to delete product.');
    }
  };

  const getStatus = (product) => {
    if (!product.isRentable) return { text: 'Disabled', class: 'badge-neutral' };
    if (product.availableStock > 0) return { text: 'Available', class: 'badge-success' };
    return { text: 'Out of Stock', class: 'badge-danger' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading products...</p>
      </div>
    );
  }

  const totalAvailable = products.filter(p => p.availableStock > 0 && p.isRentable).length;
  const outOfStock = products.filter(p => p.availableStock < 1 || !p.isRentable).length;
  const categories = new Set(products.map(p => p.category)).size;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Products</h1>
          <p className="text-slate-500 mt-1">Manage your rental inventory and pricing.</p>
        </div>
        <button onClick={() => navigate('/admin/products/new')} className="btn-primary !px-6 !py-2.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', val: products.length, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Available', val: totalAvailable, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Out of Stock', val: outOfStock, color: 'text-red-600 bg-red-50' },
          { label: 'Categories', val: categories, color: 'text-blue-600 bg-blue-50' },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-slate-800">{stat.val}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Daily Rate</th>
                <th>Status</th>
                <th>Stock</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const status = getStatus(product);
                const stockPercent = product.stock > 0 ? (product.availableStock / product.stock) * 100 : 0;
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.images?.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              className="w-full h-full object-cover" 
                              alt="" 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.outerHTML = `<span class="text-sm font-semibold text-slate-400">${product.name?.charAt(0) || 'P'}</span>`;
                              }}
                            />
                          ) : (
                            <span className="text-sm font-semibold text-slate-400">{product.name?.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate">{product.name}</p>
                          <p className="text-xs text-slate-400">ID: {product.id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-sm text-slate-600">{product.category || 'General'}</span></td>
                    <td><span className="font-semibold text-slate-800 mono-num">₹{product.pricePerDay.toLocaleString()}</span></td>
                    <td><span className={`badge ${status.class}`}>{status.text}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 w-10">{product.availableStock}/{product.stock}</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${stockPercent > 30 ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ width: `${stockPercent}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <button onClick={() => navigate(`/admin/products/edit/${product.id}`)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => handleDeleteProduct(product)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md text-center space-y-6 animate-entrance">
            <div className="w-14 h-14 bg-red-50 text-red-500 mx-auto flex items-center justify-center rounded-2xl">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Delete Product?</h3>
              <p className="text-sm text-slate-500 mt-2">Are you sure you want to delete <span className="font-semibold text-slate-700">{productToDelete?.name}</span>? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="btn-secondary flex-1 !py-2.5">Cancel</button>
              <button onClick={confirmDelete} className="btn-danger flex-1 !py-2.5">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
