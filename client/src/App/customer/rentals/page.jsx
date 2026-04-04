import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';

const RentalsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeRental, setActiveRental] = useState(null);
  const [rentalHistory, setRentalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [activeRes, historyRes] = await Promise.all([
        api.get('/rentals/active').catch(() => ({ data: { rental: null } })),
        api.get('/rentals/my-rentals').catch(() => ({ data: { items: [] } })),
      ]);
      setActiveRental(activeRes.data.rental);
      setRentalHistory(historyRes.data.items || []);
    } catch (err) {
      setError('Failed to load rental data.');
    } finally {
      setLoading(false);
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

  const getFallbackImage = (name) => {
    const initial = name ? name.charAt(0).toUpperCase() : 'P';
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none"><rect width="200" height="200" fill="#f1f5f9"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#94a3b8" font-family="Inter, sans-serif" font-size="48" font-weight="600">${initial}</text></svg>`)}`;
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Rentals</h1>
          <p className="text-slate-500 mt-1">Track your active and past rental sessions.</p>
        </div>
        <button onClick={() => navigate('/customer/products')} className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Rent Something New
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">{error}</div>
      )}

      {/* Active Rental */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-500 rounded-full" />
          Active Rental
        </h2>

        {activeRental ? (
          <div className="card overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-72 aspect-[4/3] lg:aspect-auto bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-100 flex items-center justify-center p-6">
                <img
                  src={activeRental.product?.images?.[0] || getFallbackImage(activeRental.product?.name)}
                  onError={(e) => { e.target.src = getFallbackImage(activeRental.product?.name); }}
                  className="max-h-48 object-contain"
                  alt=""
                />
              </div>
              <div className="flex-1 p-6 lg:p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{activeRental.product?.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{activeRental.product?.category || 'General'}</p>
                  </div>
                  <span className={`badge ${getStatusBadge(activeRental.status)}`}>{activeRental.status}</span>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Duration</span>
                    <p className="font-bold text-slate-800">{activeRental.totalDays} days</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Return Date</span>
                    <p className="font-bold text-slate-800">{new Date(activeRental.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Total Cost</span>
                    <p className="font-bold text-indigo-600 mono-num">₹{activeRental.totalPrice.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="btn-primary !py-2 !text-sm">Extend Rental</button>
                  <button className="btn-secondary !py-2 !text-sm">View Receipt</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50/30">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl mx-auto flex items-center justify-center text-slate-300 mb-4">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No active rental</h3>
            <p className="text-sm text-slate-400 mt-1 mb-4 max-w-xs mx-auto">You don't have any active rentals. Browse products to get started.</p>
            <button onClick={() => navigate('/customer/products')} className="btn-primary !py-2 !px-6 !text-sm">Browse Products</button>
          </div>
        )}
      </section>

      {/* Rental History */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
          <span className="w-2 h-2 bg-slate-400 rounded-full" />
          Rental History
        </h2>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rentalHistory.length > 0 ? rentalHistory.map((rental) => (
                  <tr key={rental._id || rental.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img 
                            src={rental.product?.images?.[0] || getFallbackImage(rental.product?.name)} 
                            onError={(e) => { e.target.src = getFallbackImage(rental.product?.name); }}
                            className="w-full h-full object-cover" 
                            alt="" 
                          />
                        </div>
                        <div>
                          <p className="font-medium text-slate-700 text-sm">{rental.product?.name || 'General Product'}</p>
                          <p className="text-xs text-slate-400">{rental.product?.category || 'General'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm text-slate-600">{new Date(rental.startDate).toLocaleDateString()} → {new Date(rental.endDate).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-400">{rental.totalDays} days</p>
                      </div>
                    </td>
                    <td><span className="font-semibold text-slate-700 mono-num">₹{rental.totalPrice.toLocaleString()}</span></td>
                    <td><span className={`badge ${getStatusBadge(rental.status)}`}>{rental.status.replace('_', ' ')}</span></td>
                    <td className="text-right">
                      <button 
                        onClick={() => {
                          const pid = rental.product?._id || rental.product?.id;
                          if (pid) {
                            navigate(`/customer/products/${pid}`);
                          } else {
                            alert('Product details are no longer available.');
                          }
                        }}
                        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all" 
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-400 text-sm">No rental history yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RentalsPage;