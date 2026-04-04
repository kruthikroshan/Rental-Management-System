import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWishlist } from '../../../contexts/WishlistContext';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) return product.images[0];
    return 'https://via.placeholder.com/300';
  };

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-6">
        <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-300">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800">Your wishlist is empty</h2>
          <p className="text-slate-400 text-sm mt-1">Save items you love and come back to them later.</p>
        </div>
        <Link to="/customer/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">My Wishlist</h1>
        <p className="text-slate-500 mt-1">{wishlist.length} saved {wishlist.length === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlist.map((product) => (
          <div key={product._id || product.id} className="card overflow-hidden flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="h-48 bg-slate-50 overflow-hidden relative">
              <img
                src={getProductImage(product)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <button
                onClick={() => removeFromWishlist(product._id || product.id)}
                className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 flex-1 flex flex-col gap-4">
              <div>
                <h3
                  onClick={() => navigate(`/customer/products/${product._id || product.id}`)}
                  className="font-semibold text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  {product.name}
                </h3>
                <span className="text-xs text-slate-400">{product.category} · {product.brand || 'SmartRent'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t border-slate-100 mt-auto">
                <div>
                  <span className="text-xs text-slate-400">Per day</span>
                  <p className="text-lg font-bold text-slate-800 mono-num">₹{Number(product.pricePerDay).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/customer/products/${product._id || product.id}`)}
                className="w-full btn-primary !py-2.5 !text-sm"
              >
                Rent Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
