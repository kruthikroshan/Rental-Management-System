import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useWishlist } from '../../../../contexts/WishlistContext';

const CheckoutSuccessPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { removeFromWishlist } = useWishlist();

  const rental = location.state?.rental;
  const orderDetails = location.state?.orderDetails;

  useEffect(() => {
    if (!rental) {
      navigate('/customer/products');
      return;
    }

    const productId = rental.productId || rental.product?._id || rental.product?.id;
    if (productId) {
      try {
        removeFromWishlist(productId);
      } catch (err) {
        console.warn('Wishlist sync failure:', err);
      }
    }

    localStorage.removeItem('pendingRental');
    localStorage.removeItem('cart');
  }, [rental, navigate, removeFromWishlist]);

  const formatCurrency = (amount) => `₹${Number(amount).toLocaleString()}`;
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  }).toUpperCase();

  if (!rental) return (
     <div className="flex h-96 items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#DFE1E6] border-t-[#0052cc] rounded-full animate-spin"></div>
     </div>
  );

  return (
    <div className="space-y-16 animate-in fade-in zoom-in-95 duration-700 max-w-[900px] mx-auto py-12">
      <div className="text-center space-y-8">
         <div className="w-24 h-24 bg-[#36B37E] rounded-none rotate-45 flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-900/10 border-4 border-white outline outline-4 outline-[#36B37E]">
            <svg className="w-12 h-12 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
         </div>
         <div className="space-y-3">
            <span className="text-[0.7rem] font-bold text-[#36B37E] uppercase tracking-[0.4em] block italic">Transmission Successful</span>
            <h1 className="text-6xl font-black text-[#172B4D] tracking-tighter uppercase italic leading-none">ORDER COMMITTED</h1>
            <p className="text-[#6B778C] text-sm font-semibold italic max-w-md mx-auto">Your high-performance equipment reservation is now locked within the active platform registry.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
         <section className="exec-card overflow-hidden">
            <div className="px-10 py-6 bg-[#F4F5F7] border-b border-[#EBECF0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div>
                  <span className="block text-[0.6rem] font-black text-[#A5ADBA] uppercase tracking-widest mb-1">Session Identifier</span>
                  <span className="font-mono font-black text-[#172B4D] text-lg tracking-widest">SID_{rental._id?.slice(-12).toUpperCase() || 'EXTERNAL_TRANS'}</span>
               </div>
               <div className="bg-[#FFAB00]/10 border border-[#FFAB00]/20 px-4 py-1.5 flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#FFAB00] rounded-full animate-pulse shadow-[0_0_8px_rgba(255,171,0,0.5)]"></div>
                  <span className="text-[0.6rem] font-black text-[#FFAB00] uppercase tracking-widest">INITIALIZING_ASSET</span>
               </div>
            </div>
            
            <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
               <div className="space-y-2">
                  <span className="block text-[0.6rem] font-black text-[#A5ADBA] uppercase tracking-widest">Asset Class</span>
                  <h3 className="text-sm font-black text-[#172B4D] uppercase italic tracking-widest leading-loose">{rental.productName || 'Industrial Gear'}</h3>
               </div>
               <div className="space-y-2">
                  <span className="block text-[0.6rem] font-black text-[#A5ADBA] uppercase tracking-widest">Commitment Period</span>
                  <h3 className="text-[0.7rem] font-black text-[#172B4D] uppercase italic tracking-tighter">{rental.startDate ? formatDate(rental.startDate) : 'TBD'} ▸ {rental.endDate ? formatDate(rental.endDate) : 'TBD'}</h3>
                  <span className="text-[0.6rem] font-bold text-[#A5ADBA] uppercase tracking-[0.1em]">{rental.totalDays} Total Op Days</span>
               </div>
               <div className="space-y-2">
                  <span className="block text-[0.6rem] font-black text-[#A5ADBA] uppercase tracking-widest">Fiscal Settlement</span>
                  <h3 className="text-3xl font-black text-[#0052CC] italic tracking-tighter mono-num">{formatCurrency(rental.totalPrice)}</h3>
               </div>
            </div>

            {orderDetails?.deliveryAddress && (
              <div className="p-10 bg-[#F4F5F7]/30 border-t border-[#EBECF0] grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-2">
                    <span className="block text-[0.6rem] font-black text-[#A5ADBA] uppercase tracking-widest">Destination Protocols</span>
                    <p className="text-[0.75rem] font-black text-[#172B4D] uppercase italic tracking-tighter">{orderDetails.deliveryAddress.fullName}</p>
                    <p className="text-[0.65rem] text-[#6B778C] font-semibold italic uppercase">{orderDetails.deliveryAddress.addressLine1}, {orderDetails.deliveryAddress.city}</p>
                 </div>
                 <div className="space-y-2">
                    <span className="block text-[0.6rem] font-black text-[#A5ADBA] uppercase tracking-widest">Deploy Method</span>
                    <p className="text-[0.75rem] font-black text-[#172B4D] uppercase italic tracking-tighter">PROTOCOL_{orderDetails.deliveryMethod?.toUpperCase() || 'STANDARD_DEPLOY'}</p>
                 </div>
              </div>
            )}
         </section>

         <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <button 
             onClick={() => navigate('/customer/rentals')}
             className="flex-1 h-14 bg-slate-900 text-white text-[0.7rem] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-900/10"
            >
               AUDIT MY RENTALS
            </button>
            <button 
             onClick={() => navigate('/customer/products')}
             className="flex-1 h-14 bg-white border-2 border-slate-900 text-slate-900 text-[0.7rem] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
            >
               RESUME DISCOVERY
            </button>
         </div>

         <div className="text-center pt-10 border-t border-[#EBECF0]">
            <p className="text-[0.6rem] font-black text-[#A5ADBA] uppercase tracking-[0.2em] mb-4 italic">Protocol assistance available via secure communication</p>
            <a href="mailto:ops@smartrent.hq" className="text-[0.7rem] font-black text-[#0052CC] hover:underline uppercase italic tracking-widest">OPS@SMARTRENT.HQ</a>
         </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
