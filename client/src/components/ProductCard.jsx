import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, activeRental }) => {
  const navigate = useNavigate();

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) return product.images[0];
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" fill="none"><rect width="300" height="300" fill="#f1f5f9"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#94a3b8" font-family="Inter, sans-serif" font-size="48" font-weight="600">${product.name?.charAt(0) || 'P'}</text></svg>`)}`;
  };

  const isOutOfStock = product.availableStock < 1;

  return (
    <div
      className="card group overflow-hidden flex flex-col h-full cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
      onClick={() => navigate(`/customer/products/${product._id || product.id}`)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300" fill="none"><rect width="300" height="300" fill="#f1f5f9"/><text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#94a3b8" font-family="Inter, sans-serif" font-size="48" font-weight="600">${product.name?.charAt(0) || 'P'}</text></svg>`)}`;
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className={`badge ${isOutOfStock ? 'badge-danger' : 'badge-success'} shadow-sm`}>
            {isOutOfStock ? 'Out of Stock' : 'Available'}
          </span>
        </div>
        {product.category && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm">
              {product.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors mb-1 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-1">
            {product.description || 'Premium quality item available for rental.'}
          </p>
          {/* Rating Display */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.averageRating || 0) ? 'fill-current' : 'text-slate-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ))}
            </div>
            <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">
              ({product.reviewCount || 0})
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Per day</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold text-slate-800 mono-num">₹{product.pricePerDay}</span>
              <span className="text-xs text-slate-400">/day</span>
            </div>
          </div>

          <button
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm shadow-indigo-200 hover:shadow-md'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOutOfStock ? "M6 18L18 6M6 6l12 12" : "M17 8l4 4m0 0l-4 4m4-4H3"} />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
