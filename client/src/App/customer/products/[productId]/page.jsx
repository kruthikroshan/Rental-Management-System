import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import { useWishlist } from '../../../../contexts/WishlistContext';
import api, { reviewsAPI } from '../../../../lib/api';
import { Star, MessageSquare, Send, ShieldCheck, User } from 'lucide-react';

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeRental, setActiveRental] = useState(null);
  
  const [rentalForm, setRentalForm] = useState({
    startDate: '',
    endDate: '',
    quantity: 1,
    notes: ''
  });
  
  const [pricing, setPricing] = useState({
    totalDays: 0,
    subtotal: 0,
    taxes: 0,
    total: 0
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (productId) {
      fetchData();
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setReviewLoading(true);
      const data = await reviewsAPI.getProductReviews(productId);
      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/auth/login'); return; }
    
    try {
      setIsSubmittingReview(true);
      setReviewError('');
      await reviewsAPI.addReview({ productId, ...newReview });
      setNewReview({ rating: 5, comment: '' });
      fetchReviews(); // Refresh reviews
      fetchData(); // Refresh product avg rating
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    calculatePricing();
  }, [rentalForm.startDate, rentalForm.endDate, rentalForm.quantity, product]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productRes, rentalRes] = await Promise.all([
        api.get(`/products/${productId}`),
        api.get('/rentals/active').catch(() => ({ data: { rental: null } }))
      ]);
      setProduct(productRes.data.product);
      setActiveRental(rentalRes.data.rental);
    } catch (err) {
      setError('ASSET_IDENTIFIER_NOT_FOUND');
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!product || !rentalForm.startDate || !rentalForm.endDate) return;
    const start = new Date(rentalForm.startDate);
    const end = new Date(rentalForm.endDate);
    const totalDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const subtotal = totalDays * product.pricePerDay * rentalForm.quantity;
    const taxes = Math.round(subtotal * 0.05);
    const total = subtotal + taxes;
    setPricing({ totalDays, subtotal, taxes, total });
  };

  const handleCheckout = () => {
    if (activeRental) { setError('ACTIVE_SESSION_LIMIT_EXCEEDED'); return; }
    if (!rentalForm.startDate || !rentalForm.endDate) { setError('REQUIRED: SESSION_DATES'); return; }
    const today = new Date(); today.setHours(0,0,0,0);
    if (new Date(rentalForm.startDate) < today) { setError('INVALID: BACKDATED_START'); return; }

    setIsSubmitting(true);
    const cartData = { product, ...rentalForm, pricing };
    setTimeout(() => {
      navigate('/customer/checkout/review', { state: { cartItem: cartData } });
    }, 800);
  };

  const formatCurrency = (amt) => `₹${Number(amt).toLocaleString()}`;

  if (loading) return (
     <div className="flex h-[400px] items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#DFE1E6] border-t-[#0052cc] rounded-full animate-spin"></div>
     </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-[1440px] mx-auto py-6">
      {/* HEADER BREADCRUMBS */}
      <nav className="flex items-center gap-3 text-[0.65rem] font-black uppercase tracking-widest text-[#A5ADBA]">
        <Link to="/customer/products" className="hover:text-[#0052CC] transition-all">_INVENTORY</Link>
        <span className="text-[#DFE1E6]">/</span>
        <span className="text-[#172B4D] italic">_{product?.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* GALLERY SECTION */}
        <div className="lg:col-span-7 space-y-8">
           <div className="exec-card overflow-hidden bg-white shadow-2xl relative group">
              <div className="aspect-[16/10] bg-[#F4F5F7] flex items-center justify-center overflow-hidden">
                 <img 
                  src={product?.images?.[selectedImageIndex] || product?.images?.[0] || 'https://via.placeholder.com/600'} 
                  className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all duration-700" 
                 />
              </div>
              <button 
                onClick={() => toggleWishlist(product)}
                className="absolute top-8 right-8 w-14 h-14 bg-white border-2 border-[#EBECF0] flex items-center justify-center hover:bg-[#0052CC] hover:text-white transition-all shadow-xl group/fav"
              >
                 <svg className={`w-6 h-6 ${isWishlisted(product?._id) ? 'fill-current text-red-500 group-hover/fav:text-white' : 'text-[#A5ADBA] group-hover/fav:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
           </div>

           <div className="exec-card p-10 space-y-10">
              <div className="space-y-4">
                 <h2 className="text-[0.75rem] font-black text-[#172B4D] uppercase tracking-[0.3em] border-b border-[#EBECF0] pb-4">EQUIPMENT_SPECIFICATION_LEDGER</h2>
                 <p className="text-sm font-semibold text-[#5E6C84] italic leading-relaxed">
                    {product?.description || 'No descriptive metadata provided. Industrial asset is validated for standard regional deployment protocols.'}
                 </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {[
                    { l: 'CATEGORY', v: product?.category },
                    { l: 'AVAILABILITY', v: `${product?.availableStock} UNITS` },
                    { l: 'PROTECTION', v: 'PROTOCOL_HIGH' },
                    { l: 'BRAND', v: product?.brand || 'EXECUTIVE' }
                 ].map(s => (
                    <div key={s.l} className="bg-[#F4F5F7] p-4 border border-[#EBECF0]">
                       <span className="block text-[0.55rem] font-black text-[#A5ADBA] uppercase tracking-widest mb-1">{s.l}</span>
                       <span className="text-[0.7rem] font-black text-[#172B4D] uppercase italic">{s.v}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* BOOKING SIDEBAR */}
        <div className="lg:col-span-5">
           <div className="sticky top-6 space-y-6">
              <section className="exec-card p-10 bg-white shadow-2xl border-t-4 border-t-[#0052CC] space-y-10">
                 <div className="flex justify-between items-start">
                    <div className="space-y-2">
                       <h1 className="text-4xl font-black text-[#172B4D] uppercase tracking-tighter italic leading-none">{product?.name}</h1>
                       <span className="status-pill status-active text-[0.6rem]">ASSET_VALIDATED</span>
                    </div>
                    <div className="text-right">
                       <span className="text-3xl font-black text-[#0052CC] italic tracking-tighter mono-num">{formatCurrency(product?.pricePerDay)}</span>
                       <span className="block text-[0.55rem] font-black text-[#A5ADBA] uppercase tracking-widest">/ SESSION_DAY</span>
                    </div>
                 </div>

                 {activeRental && (
                   <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-[0.65rem] font-bold uppercase tracking-widest italic">
                      SYSTEM_LOCK: ACTIVE_SESSION_DETECTED. TERMINATE PREVIOUS SESSION BEFORE INITIALIZING NEW ASSET.
                   </div>
                 )}

                 <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[0.55rem] font-black text-[#A5ADBA] uppercase tracking-widest px-1">START_DATE</label>
                          <input 
                            type="date" 
                            min={new Date().toISOString().split('T')[0]}
                            max="2030-12-31"
                            className="w-full h-12 bg-[#F4F5F7] border border-[#EBECF0] px-4 text-xs font-black outline-none focus:border-[#0052CC] transition-all"
                            value={rentalForm.startDate}
                            onChange={(e) => setRentalForm(p => ({ ...p, startDate: e.target.value }))}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[0.55rem] font-black text-[#A5ADBA] uppercase tracking-widest px-1">END_DATE</label>
                          <input 
                            type="date" 
                            min={rentalForm.startDate || new Date().toISOString().split('T')[0]}
                            max="2030-12-31"
                            className="w-full h-12 bg-[#F4F5F7] border border-[#EBECF0] px-4 text-xs font-black outline-none focus:border-[#0052CC] transition-all"
                            value={rentalForm.endDate}
                            onChange={(e) => setRentalForm(p => ({ ...p, endDate: e.target.value }))}
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[0.55rem] font-black text-[#A5ADBA] uppercase tracking-widest px-1">DEPLOYMENT_QUANTITY</label>
                       <div className="flex bg-[#F4F5F7] border border-[#EBECF0] rounded-none overflow-hidden h-14">
                          <button onClick={() => setRentalForm(p => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))} className="w-14 bg-white border-r border-[#EBECF0] font-black hover:bg-[#EBECF0] transition-colors">-</button>
                          <span className="flex-1 flex items-center justify-center font-black text-lg mono-num">{rentalForm.quantity}</span>
                          <button onClick={() => setRentalForm(p => ({ ...p, quantity: Math.min(product?.availableStock, p.quantity + 1) }))} className="w-14 bg-white border-l border-[#EBECF0] font-black hover:bg-[#EBECF0] transition-colors">+</button>
                       </div>
                    </div>
                 </div>

                 {pricing.totalDays > 0 && (
                   <div className="bg-[#F4F5F7] p-8 space-y-4 border-l-4 border-l-[#0052CC]">
                      <div className="flex justify-between text-[0.65rem] font-bold text-[#5E6C84] uppercase tracking-widest italic">
                         <span>{pricing.totalDays} DAYS_SESSION_TOTAL</span>
                         <span className="mono-num">{formatCurrency(pricing.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-[0.65rem] font-bold text-[#5E6C84] uppercase tracking-widest italic">
                         <span>PROTOCOL_FEE_LOGISTICS</span>
                         <span className="mono-num">{formatCurrency(pricing.taxes)}</span>
                      </div>
                      <div className="pt-4 border-t border-[#DFE1E6] flex justify-between items-center text-[#172B4D]">
                         <span className="text-[0.75rem] font-black uppercase tracking-widest">NET_FISCAL_SETTLEMENT</span>
                         <span className="text-3xl font-black italic tracking-tighter mono-num text-[#0052CC]">{formatCurrency(pricing.total)}</span>
                      </div>
                   </div>
                 )}

                 {error && (
                   <div className="text-[0.6rem] font-black text-red-600 uppercase tracking-widest italic animate-pulse">
                      {error}
                   </div>
                 )}

                 <button 
                  onClick={handleCheckout}
                  disabled={activeRental || isSubmitting || product?.availableStock < 1}
                  className="w-full h-16 bg-[#0052CC] text-white text-[0.75rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/10 hover:bg-[#0047B3] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                    {isSubmitting ? 'INITIALIZING...' : product?.availableStock < 1 ? 'STOCK_DEPLETED' : 'INITIALIZE_BOOKING'}
                 </button>
                 
                 <p className="text-center text-[0.55rem] font-black text-[#A5ADBA] uppercase tracking-[0.2em] italic">
                    ★ TERMS: 24HR_CANCELLATION_PROTOCOL_INCLUDED
                 </p>
              </section>

              <div className="exec-card p-6 flex items-center gap-5 bg-slate-900 text-white">
                 <div className="w-10 h-10 border-2 border-[#36B37E] flex items-center justify-center text-[#36B37E]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-[0.65rem] font-black uppercase tracking-widest leading-none">EQUIPMENT_INSURANCE_VALID</h4>
                    <p className="text-[0.55rem] text-white/50 font-semibold italic">Session includes standard wear-and-tear protection ledger.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-20 pt-20 border-t border-[#EBECF0]">
        <div className="lg:col-span-7 space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.75rem] font-black text-[#172B4D] uppercase tracking-[0.3em]">EQUIPMENT_FEEDBACK_LEDGER ({reviews.length})</h2>
            <div className="flex items-center gap-2">
               <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(product?.averageRating || 0) ? 'fill-current' : 'text-slate-200'}`} />
                  ))}
               </div>
               <span className="text-xl font-black text-[#172B4D] italic mono-num">{product?.averageRating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>

          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="p-10 border-2 border-dashed border-[#DFE1E6] text-center space-y-4">
                <MessageSquare className="w-10 h-10 text-[#A5ADBA] mx-auto opacity-30" />
                <p className="text-[0.65rem] font-black text-[#A5ADBA] uppercase tracking-widest italic">NO_FEEDBACK_DATA_SYNCED</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="exec-card p-10 bg-white border-l-4 border-l-[#36B37E] space-y-6 group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#F4F5F7] border border-[#EBECF0] flex items-center justify-center text-[#0052CC]">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-[0.75rem] font-black text-[#172B4D] uppercase tracking-widest">{rev.user?.name}</h4>
                        <span className="text-[0.55rem] font-black text-[#A5ADBA] uppercase italic">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex text-amber-500">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                       ))}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[#5E6C84] italic leading-relaxed pl-16">
                    "{rev.comment}"
                  </p>
                  <div className="pl-16 pt-4 flex items-center gap-2 text-[#36B37E]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-[0.55rem] font-black uppercase tracking-widest">VERIFIED_RENTAL_PROTOCOL</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
           <div className="exec-card p-10 bg-[#172B4D] text-white space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0052CC]/10 rounded-full blur-3xl"></div>
              
              <div className="space-y-2">
                 <h2 className="text-[0.75rem] font-black uppercase tracking-[0.3em] text-[#0052CC]">SUBMIT_FEEDBACK</h2>
                 <p className="text-[0.55rem] font-black text-white/40 uppercase italic tracking-widest leading-relaxed">
                   ASSET_PERFORMANCE_METRICS_ENTRY
                 </p>
              </div>

              {!user ? (
                <div className="space-y-6">
                   <p className="text-xs font-semibold text-white/70 italic italic leading-relaxed">
                     AUTHORIZATION_REQUIRED: System identity verification necessary before feedback injection.
                   </p>
                   <Link to="/auth/login" className="block w-full h-12 bg-[#0052CC] flex items-center justify-center text-[0.65rem] font-black uppercase tracking-widest hover:bg-[#0047B3] transition-all">
                      AUTHENTICATE_SESSION
                   </Link>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[0.55rem] font-black text-white/50 uppercase tracking-widest">RATING_LEVEL</label>
                      <div className="flex gap-2">
                         {[1, 2, 3, 4, 5].map((star) => (
                           <button
                             key={star}
                             type="button"
                             onClick={() => setNewReview(p => ({ ...p, rating: star }))}
                             className={`w-12 h-12 border-2 ${newReview.rating >= star ? 'bg-[#0052CC] border-[#0052CC] text-white' : 'border-white/10 text-white/30'} flex items-center justify-center transition-all hover:border-[#0052CC]`}
                           >
                              <span className="text-[0.85rem] font-black mono-num italic">{star}</span>
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-[0.55rem] font-black text-white/50 uppercase tracking-widest">FEEDBACK_COMMENTARY</label>
                      <textarea
                        required
                        value={newReview.comment}
                        onChange={(e) => setNewReview(p => ({ ...p, comment: e.target.value }))}
                        className="w-full h-32 bg-white/5 border border-white/10 p-4 text-xs font-semibold italic text-white outline-none focus:border-[#0052CC] transition-all resize-none"
                        placeholder="Input asset performance commentary..."
                      />
                   </div>

                   {reviewError && (
                     <p className="text-[0.6rem] font-black text-red-400 uppercase tracking-widest italic">{reviewError}</p>
                   )}

                   <button
                     type="submit"
                     disabled={isSubmittingReview}
                     className="w-full h-14 bg-white text-[#172B4D] text-[0.65rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#EBECF0] transition-all disabled:opacity-30"
                   >
                      {isSubmittingReview ? (
                        'UPLOADING...'
                      ) : (
                        <>
                          INJECT_FEEDBACK
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                   </button>
                </form>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
