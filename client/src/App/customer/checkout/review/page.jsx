import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';

const ReviewOrderPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cartItem, setCartItem] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  
  useEffect(() => {
    const item = location.state?.cartItem || JSON.parse(localStorage.getItem('pendingRental') || 'null');
    if (!item) {
      navigate('/customer/products');
      return;
    }
    setCartItem(item);
    localStorage.setItem('pendingRental', JSON.stringify(item));
  }, [location.state, navigate]);

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) {
      setCouponError('Enter protocol code');
      return;
    }
    const mockCoupons = {
      'SAVE10': { discount: 10, type: 'percentage', description: '10% off' },
      'WELCOME': { discount: 5, type: 'percentage', description: '5% off' }
    };
    const coupon = mockCoupons[couponCode.toUpperCase()];
    if (coupon) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), ...coupon });
    } else {
      setCouponError('Invalid protocol: Code not recognized');
    }
  };

  const calculateFinalTotal = () => {
    if (!cartItem) return 0;
    let total = cartItem.pricing.total;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        total = total * (1 - appliedCoupon.discount / 100);
      } else {
        total = Math.max(0, total - appliedCoupon.discount);
      }
    }
    return Math.round(total);
  };

  const formatCurrency = (amount) => `₹${Number(amount).toLocaleString()}`;

  if (!cartItem) return (
     <div className="flex h-96 items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#DFE1E6] border-t-[#0052cc] rounded-full animate-spin"></div>
     </div>
  );

  const finalTotal = calculateFinalTotal();

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-[1100px] mx-auto py-8">
      {/* CHECKOUT PROGRESS HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#EBECF0] pb-10 gap-8">
        <div className="space-y-3">
           <span className="text-[0.65rem] font-black text-[#0052CC] uppercase tracking-[0.3em] block italic">Step 01 / 03</span>
           <h1 className="text-4xl font-black text-[#172B4D] tracking-tighter uppercase italic leading-none">REVIEW QUOTATION</h1>
           <p className="text-[#6B778C] text-sm font-semibold italic max-w-xl">Audit your equipment reservation parameters. Verify fiscal totals and session timing before technical commitment.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#F4F5F7] p-1.5 rounded-sm border border-[#DFE1E6]">
           <div className="px-5 py-2 bg-[#0052CC] text-white text-[0.65rem] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20">Review</div>
           <div className="w-8 h-px bg-[#DFE1E6]"></div>
           <div className="px-5 py-2 text-[#A5ADBA] text-[0.65rem] font-black uppercase tracking-widest">Delivery</div>
           <div className="w-8 h-px bg-[#DFE1E6]"></div>
           <div className="px-5 py-2 text-[#A5ADBA] text-[0.65rem] font-black uppercase tracking-widest">Payment</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
           <section className="exec-card overflow-hidden">
              <div className="px-8 py-4 bg-[#F4F5F7] border-b border-[#EBECF0] flex justify-between items-center">
                 <h3 className="text-[0.65rem] font-black text-[#172B4D] uppercase tracking-widest">ASSET SPECIFICATIONS</h3>
                 <span className="status-pill status-active text-[0.55rem]">1 ITEM_LOCKED</span>
              </div>
              <div className="p-8 space-y-8">
                 <div className="flex gap-8 items-start">
                    <div className="w-24 h-24 bg-[#F4F5F7] border border-[#EBECF0] shrink-0 flex items-center justify-center">
                       <img 
                        src={cartItem.product.images?.[0] || 'https://via.placeholder.com/100'} 
                        className="w-full h-full object-cover grayscale opacity-80"
                       />
                    </div>
                    <div className="space-y-4 flex-1">
                       <div>
                          <h4 className="text-xl font-black text-[#172B4D] uppercase italic tracking-tighter leading-none">{cartItem.product.name}</h4>
                          <span className="text-[0.6rem] font-black text-[#0052CC] uppercase tracking-[0.2em]">{cartItem.product.category} ▸ {formatCurrency(cartItem.product.pricePerDay)}/DAY</span>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#F4F5F7] p-3 border border-[#EBECF0] rounded-sm">
                             <span className="block text-[0.55rem] font-black text-[#A5ADBA] uppercase tracking-widest">INITIALIZE</span>
                             <span className="text-xs font-black text-[#172B4D] uppercase italic">{new Date(cartItem.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="bg-[#F4F5F7] p-3 border border-[#EBECF0] rounded-sm">
                             <span className="block text-[0.55rem] font-black text-[#A5ADBA] uppercase tracking-widest">TERMINATE</span>
                             <span className="text-xs font-black text-[#172B4D] uppercase italic">{new Date(cartItem.endDate).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                 </div>
                 {cartItem.notes && (
                    <div className="p-4 bg-slate-900 text-white italic text-[0.7rem] font-semibold border-l-4 border-l-[#0052CC]">
                       " {cartItem.notes} "
                    </div>
                 )}
              </div>
           </section>

           <div className="exec-card p-8 bg-slate-900 text-white space-y-4">
              <h3 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#0052CC]">SECURITY & COMPLIANCE</h3>
              <div className="space-y-3 opacity-80 text-[0.7rem] font-semibold italic">
                 <p>▸ Operational commitment may be aborted up to 24HR prior to session start.</p>
                 <p>▸ Asset includes baseline technical insurance and standard wear-and-tear protection.</p>
              </div>
           </div>
        </div>

        <div className="lg:col-span-5">
           <div className="sticky top-10 space-y-6">
              <section className="exec-card p-10 bg-white shadow-2xl space-y-10 border-t-4 border-t-[#0052CC]">
                 <h3 className="text-[0.75rem] font-black text-[#172B4D] uppercase tracking-[0.25em] border-b border-[#EBECF0] pb-4">FISCAL SUMMARY</h3>
                 
                 <div className="space-y-4 text-[0.75rem] font-bold text-[#5E6C84]">
                    <div className="flex justify-between">
                       <span className="uppercase tracking-widest">Rental Yield</span>
                       <span className="text-[#172B4D] mono-num">{formatCurrency(cartItem.pricing.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="uppercase tracking-widest">Logistics Surcharge</span>
                       <span className="text-[#36B37E] uppercase tracking-tighter">WAIVED_PROTOCOL</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="uppercase tracking-widest">Tax Provision (5%)</span>
                       <span className="text-[#172B4D] mono-num">{formatCurrency(cartItem.pricing.taxes)}</span>
                    </div>
                    {appliedCoupon && (
                       <div className="flex justify-between text-[#0052CC] pt-2 border-t border-dashed border-[#DFE1E6]">
                          <span className="uppercase font-black tracking-widest">Discount [{appliedCoupon.code}]</span>
                          <span className="font-black">-{appliedCoupon.discount}%</span>
                       </div>
                    )}
                    <div className="pt-6 border-t border-[#EBECF0] flex justify-between items-center">
                       <span className="text-[#172B4D] font-black uppercase tracking-[0.1em]">Total Commitment</span>
                       <span className="text-3xl font-black text-[#172B4D] italic tracking-tighter mono-num">{formatCurrency(finalTotal)}</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex bg-[#F4F5F7] border border-[#DFE1E6] rounded-sm overflow-hidden">
                       <input 
                          type="text" 
                          placeholder="INPUT PROMO"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 bg-transparent px-4 text-[0.65rem] font-black uppercase tracking-widest focus:outline-none italic"
                       />
                       <button onClick={handleApplyCoupon} className="bg-[#172B4D] text-white px-5 py-3 text-[0.6rem] font-black uppercase tracking-widest hover:bg-black transition-all">VALIDATE</button>
                    </div>
                    {couponError && <p className="text-[0.6rem] font-bold text-red-600 uppercase tracking-widest italic">{couponError}</p>}
                 </div>

                 <button 
                  onClick={() => {
                    const data = { ...cartItem, appliedCoupon, finalTotal };
                    localStorage.setItem('pendingRental', JSON.stringify(data));
                    navigate('/customer/checkout/delivery', { state: { cartItem: data } });
                  }}
                  className="w-full exec-btn-primary py-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-900/10"
                 >
                    INITIALIZE DELIVERY PROTOCOL
                 </button>
                 
                 <Link to="/customer/products" className="block text-center text-[0.6rem] font-black text-[#A5ADBA] uppercase tracking-widest hover:text-[#172B4D] transition-colors italic">
                    ← ABORT & ADJUST ASSETS
                 </Link>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewOrderPage;
