import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../lib/api';

const PaymentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cartItem, setCartItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentType, setPaymentType] = useState('full');
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const item = location.state?.cartItem || JSON.parse(localStorage.getItem('pendingRental') || 'null');
    if (!item || !item.deliveryAddress) {
      navigate('/customer/products');
      return;
    }
    setCartItem(item);
  }, [location.state, navigate]);

  const validatePaymentForm = () => {
    const newErrors = {};
    if (paymentMethod === 'upi') {
      if (!upiId.trim()) newErrors.upiId = 'UPI_ID_REQUIRED';
      else if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) newErrors.upiId = 'INVALID_UPI_FORMAT';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loadRazorpay = () => {
    return new Promise(resolve => {
      if (document.getElementById('razorpay-script')) { resolve(true); return; }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    if (!validatePaymentForm()) return;
    setLoading(true);
    setError('');

    const finalTotal = cartItem?.finalTotal || cartItem?.pricing?.total || 0;
    const amountToPay = paymentType === 'deposit' ? Math.round(finalTotal * 0.2) : finalTotal;

    try {
      const { data } = await api.post('/payments/razorpay/order', { amount: amountToPay });
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        setError('Gateway Critical Failure: Unable to initialize protocol.');
        setLoading(false);
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'SMARTRENT_ERP',
        description: 'FISCAL_SETTLEMENT',
        order_id: data.orderId,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#0052CC' },
        handler: async () => {
          try {
              const product = cartItem.product || {};
              const rentalData = {
                productId: product._id || product.id,
                productName: product.name || cartItem.productName || 'Product',
                pricePerDay: product.pricePerDay || cartItem.pricePerDay || 0,
                startDate: cartItem.startDate,
                endDate: cartItem.endDate,
                totalDays: cartItem.pricing?.totalDays || cartItem.totalDays || 1,
                totalPrice: finalTotal,
                paidAmount: amountToPay,
                paymentStatus: paymentType === 'deposit' ? 'PARTIAL' : 'PAID',
                notes: cartItem.notes || '',
                paymentMethod: paymentMethod,
                deliveryAddress: cartItem.deliveryAddress,
                invoiceAddress: cartItem.invoiceAddress,
                deliveryMethod: cartItem.deliveryMethod,
              };
            const response = await api.post('/rentals', rentalData);
            localStorage.removeItem('pendingRental');
            navigate('/customer/checkout/success', { state: { rental: response.data.rental, orderDetails: cartItem } });
          } catch (err) {
            setError(err.response?.data?.message || 'Transaction accepted but record commitment failed.');
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment Protocol Aborted.');
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      setError(error.response?.data?.message || 'Initialization Failure.');
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `₹${Number(amount).toLocaleString()}`;

  if (!cartItem) return (
     <div className="flex h-96 items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#DFE1E6] border-t-[#0052cc] rounded-full animate-spin"></div>
     </div>
  );

  const finalTotal = cartItem.finalTotal || cartItem.pricing.total;

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-[1240px] mx-auto py-8">
      {/* CHECKOUT PROGRESS HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#EBECF0] pb-10 gap-8">
        <div className="space-y-3">
           <span className="text-[0.65rem] font-black text-[#0052CC] uppercase tracking-[0.3em] block italic">Step 03 / 03</span>
           <h1 className="text-4xl font-black text-[#172B4D] tracking-tighter uppercase italic leading-none">FISCAL SETTLEMENT</h1>
           <p className="text-[#6B778C] text-sm font-semibold italic max-w-xl">Initialize secure payment protocol. Authenticate gateway connection and finalize technical equipment commitment.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#F4F5F7] p-1.5 rounded-sm border border-[#DFE1E6]">
           <div className="px-5 py-2 text-[#A5ADBA] text-[0.65rem] font-black uppercase tracking-widest cursor-pointer" onClick={() => navigate('/customer/checkout/review')}>Review</div>
           <div className="w-8 h-px bg-[#DFE1E6]"></div>
           <div className="px-5 py-2 text-[#A5ADBA] text-[0.65rem] font-black uppercase tracking-widest cursor-pointer" onClick={() => navigate('/customer/checkout/delivery')}>Delivery</div>
           <div className="w-8 h-px bg-[#DFE1E6]"></div>
           <div className="px-5 py-2 bg-[#0052CC] text-white text-[0.65rem] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20">Payment</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
           {/* PAYMENT CHANNEL SELECTOR */}
           <section className="exec-card overflow-hidden">
              <div className="px-8 py-4 bg-[#F4F5F7] border-b border-[#EBECF0]">
                 <h3 className="text-[0.65rem] font-black text-[#172B4D] uppercase tracking-widest italic">Gateway Authentication Channel</h3>
              </div>
              <div className="p-8">
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    {['card', 'upi', 'netbanking'].map((method) => (
                      <div 
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`p-6 border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${paymentMethod === method ? 'border-[#0052CC] bg-[#F4F5F7]' : 'border-[#DFE1E6] hover:border-[#A5ADBA]'}`}
                      >
                         <span className="text-[0.65rem] font-black text-[#172B4D] uppercase tracking-widest">{method.replace('_', ' ')}</span>
                      </div>
                    ))}
                 </div>

                 {paymentMethod === 'upi' && (
                   <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <label className="block text-[0.6rem] font-black text-[#6B778C] uppercase tracking-[0.2em] mb-2 px-1">VIRTUAL_PAYMENT_ADDRESS [VPA]</label>
                      <input
                        type="text"
                        placeholder="IDENTIFIER@UPI"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className={`w-full h-11 bg-white border px-4 text-xs font-black uppercase tracking-widest focus:border-[#0052CC] transition-all italic ${errors.upiId ? 'border-red-500' : 'border-[#DFE1E6]'}`}
                      />
                   </div>
                 )}

                 {paymentMethod === 'card' && (
                    <div className="p-4 bg-[#EBECF0]/50 border border-[#DFE1E6] rounded-sm flex items-center gap-4 text-[0.7rem] font-semibold italic text-[#5E6C84]">
                       <svg className="w-5 h-5 text-[#0052CC]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                       Technical redirect to secure industrial bank portal for card authentication. No sensitive parameters stored on local registry.
                    </div>
                 )}
              </div>
           </section>

           {/* COMMITMENT TYPE */}
           <section className="exec-card overflow-hidden">
              <div className="px-8 py-4 bg-[#F4F5F7] border-b border-[#EBECF0]">
                 <h3 className="text-[0.65rem] font-black text-[#172B4D] uppercase tracking-widest italic">Commitment Protocol Tier</h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div 
                  onClick={() => setPaymentType('full')}
                  className={`p-6 border-2 cursor-pointer transition-all flex flex-col gap-2 ${paymentType === 'full' ? 'border-[#0052CC] bg-[#F4F5F7]' : 'border-[#DFE1E6] hover:border-[#A5ADBA]'}`}
                 >
                    <span className="text-[0.65rem] font-black text-[#172B4D] uppercase tracking-widest">FULL_SETTLEMENT</span>
                    <p className="text-[0.6rem] text-[#6B778C] font-semibold italic">Complete fiscal commitment at point of order initialization.</p>
                 </div>
                 <div 
                  onClick={() => setPaymentType('deposit')}
                  className={`p-6 border-2 cursor-pointer transition-all flex flex-col gap-2 ${paymentType === 'deposit' ? 'border-[#0052CC] bg-[#F4F5F7]' : 'border-[#DFE1E6] hover:border-[#A5ADBA]'}`}
                 >
                    <span className="text-[0.65rem] font-black text-[#172B4D] uppercase tracking-widest">DEPOSIT_RESERVATION [20%]</span>
                    <p className="text-[0.6rem] text-[#6B778C] font-semibold italic">Partial commitment of {formatCurrency(Math.round(finalTotal * 0.2))}. Balance due at equipment deploy.</p>
                 </div>
              </div>
           </section>
        </div>

        <div className="lg:col-span-4">
           <div className="sticky top-10 space-y-6">
              <section className="exec-card p-10 bg-white shadow-2xl space-y-8 border-t-4 border-t-[#0052CC]">
                 <h3 className="text-[0.75rem] font-black text-[#172B4D] uppercase tracking-[0.25em] border-b border-[#EBECF0] pb-4">FINAL FISCAL LEDGER</h3>
                 
                 <div className="space-y-5 text-[0.75rem] font-bold text-[#5E6C84]">
                    <div className="flex justify-between uppercase tracking-widest">
                       <span>Yield Total</span>
                       <span className="mono-num font-black">{formatCurrency(finalTotal)}</span>
                    </div>
                    <div className="flex justify-between uppercase tracking-widest">
                       <span>Commitment Tier</span>
                       <span className="text-[#0052CC] font-black">{paymentType.toUpperCase()}</span>
                    </div>
                    
                    <div className="pt-8 border-t border-[#EBECF0] flex justify-between items-center text-[#172B4D]">
                       <span className="text-[0.75rem] font-black uppercase tracking-[0.1em]">NET PAYABLE NOW</span>
                       <span className="text-3xl font-black italic tracking-tighter mono-num text-[#0052CC]">
                         {formatCurrency(paymentType === 'deposit' ? Math.round(finalTotal * 0.2) : finalTotal)}
                       </span>
                    </div>
                 </div>

                 {error && (
                   <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-[0.6rem] font-black uppercase tracking-widest italic">
                      PROTOCOL_ERROR: {error}
                   </div>
                 )}

                 <button 
                  onClick={handlePayNow}
                  disabled={loading}
                  className="w-full h-14 bg-[#0052CC] text-white text-[0.65rem] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 hover:bg-[#0047B3] transition-all disabled:opacity-50 flex items-center justify-center"
                 >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'VALIDATE & EXECUTE PAYMENT'}
                 </button>
                 
                 <button 
                  onClick={() => navigate('/customer/checkout/delivery')}
                  className="w-full text-center text-[0.6rem] font-black text-[#A5ADBA] uppercase tracking-widest hover:text-[#172B4D] transition-colors italic"
                 >
                    ← AUDIT PREVIOUS STEP
                 </button>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
