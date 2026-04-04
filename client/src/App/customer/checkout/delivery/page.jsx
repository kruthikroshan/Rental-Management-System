import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../../contexts/AuthContext';

const DeliveryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cartItem, setCartItem] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: user?.name || '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  
  const [invoiceAddress, setInvoiceAddress] = useState({
    fullName: user?.name || '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const item = location.state?.cartItem || JSON.parse(localStorage.getItem('pendingRental') || 'null');
    if (!item) {
      navigate('/customer/products');
      return;
    }
    setCartItem(item);
  }, [location.state, navigate]);

  const handleDeliveryAddressChange = (field, value) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
    if (useSameAddress) setInvoiceAddress(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleInvoiceAddressChange = (field, value) => {
    setInvoiceAddress(prev => ({ ...prev, [field]: value }));
    if (errors[`invoice_${field}`]) setErrors(prev => ({ ...prev, [`invoice_${field}`]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const required = ['fullName', 'phoneNumber', 'addressLine1', 'city', 'state', 'pincode'];
    required.forEach(f => { if (!deliveryAddress[f]?.trim()) newErrors[f] = 'Required protocol field'; });
    if (deliveryAddress.pincode && !/^\d{6}$/.test(deliveryAddress.pincode)) newErrors.pincode = 'Invalid PIN sequence';
    if (deliveryAddress.phoneNumber && !/^\d{10}$/.test(deliveryAddress.phoneNumber)) newErrors.phoneNumber = 'Invalid phone sequence';
    
    if (!useSameAddress) {
      required.forEach(f => { if (!invoiceAddress[f]?.trim()) newErrors[`invoice_${f}`] = 'Required protocol field'; });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateForm()) return;
    setLoading(true);
    const orderData = { ...cartItem, deliveryAddress, invoiceAddress: useSameAddress ? deliveryAddress : invoiceAddress, deliveryMethod, useSameAddress };
    localStorage.setItem('pendingRental', JSON.stringify(orderData));
    setTimeout(() => {
      setLoading(false);
      navigate('/customer/checkout/payment', { state: { cartItem: orderData } });
    }, 800);
  };

  const formatCurrency = (amount) => `₹${Number(amount).toLocaleString()}`;

  if (!cartItem) return (
     <div className="flex h-96 items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#DFE1E6] border-t-[#0052cc] rounded-full animate-spin"></div>
     </div>
  );

  const deliveryMethods = [
    { id: 'pickup', name: 'PIKUP_STATION', price: 0, description: 'Direct collection from regional logistics hub.' },
    { id: 'delivery', name: 'STANDARD_DELIVERY', price: 50, description: 'Regional delivery sequence within 24-48HR.' },
    { id: 'express', name: 'EXPRESS_DEPLOY', price: 100, description: 'Priority equipment deployment within 12HR.' }
  ];

  const finalTotal = cartItem.finalTotal || cartItem.pricing.total;

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-[1240px] mx-auto py-8">
      {/* CHECKOUT PROGRESS HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#EBECF0] pb-10 gap-8">
        <div className="space-y-3">
           <span className="text-[0.65rem] font-black text-[#0052CC] uppercase tracking-[0.3em] block italic">Step 02 / 03</span>
           <h1 className="text-4xl font-black text-[#172B4D] tracking-tighter uppercase italic leading-none">LOGISTICS PARAMETERS</h1>
           <p className="text-[#6B778C] text-sm font-semibold italic max-w-xl">Configure regional equipment deployment protocols. Verify physical identifiers and destination metadata.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#F4F5F7] p-1.5 rounded-sm border border-[#DFE1E6]">
           <div className="px-5 py-2 text-[#A5ADBA] text-[0.65rem] font-black uppercase tracking-widest cursor-pointer" onClick={() => navigate('/customer/checkout/review')}>Review</div>
           <div className="w-8 h-px bg-[#DFE1E6]"></div>
           <div className="px-5 py-2 bg-[#0052CC] text-white text-[0.65rem] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20">Delivery</div>
           <div className="w-8 h-px bg-[#DFE1E6]"></div>
           <div className="px-5 py-2 text-[#A5ADBA] text-[0.65rem] font-black uppercase tracking-widest">Payment</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
           {/* DELIVERY ADDRESS */}
           <section className="exec-card overflow-hidden">
              <div className="px-8 py-4 bg-[#F4F5F7] border-b border-[#EBECF0]">
                 <h3 className="text-[0.65rem] font-black text-[#172B4D] uppercase tracking-widest italic">Destination Metadata [PRIMARY]</h3>
              </div>
              <div className="p-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {['fullName', 'phoneNumber', 'addressLine1', 'addressLine2', 'city', 'state', 'pincode', 'landmark'].map((field) => (
                      <div key={field} className={field.includes('addressLine') ? 'md:col-span-2' : ''}>
                         <label className="block text-[0.6rem] font-black text-[#6B778C] uppercase tracking-[0.2em] mb-2 px-1">
                            {field.replace(/([A-Z])/g, '_$1').toUpperCase()}{['fullName', 'phoneNumber', 'addressLine1', 'city', 'state', 'pincode'].includes(field) && ' [REQUIRED]'}
                         </label>
                         <input
                           type="text"
                           value={deliveryAddress[field]}
                           onChange={(e) => handleDeliveryAddressChange(field, e.target.value)}
                           className={`w-full h-11 bg-white border px-4 py-2 text-xs font-black uppercase tracking-widest outline-none focus:border-[#0052CC] transition-all italic placeholder-[#A5ADBA] ${errors[field] ? 'border-red-500' : 'border-[#DFE1E6]'}`}
                         />
                         {errors[field] && <p className="text-[0.6rem] font-bold text-red-600 mt-1 uppercase italic tracking-widest">{errors[field]}</p>}
                      </div>
                    ))}
                 </div>
              </div>
           </section>

           {/* BILLING PROTOCOL */}
           <section className="exec-card overflow-hidden">
              <div className="px-8 py-4 bg-[#F4F5F7] border-b border-[#EBECF0] flex justify-between items-center">
                 <h3 className="text-[0.65rem] font-black text-[#172B4D] uppercase tracking-widest italic">Fiscal Ledger Identity [BILLING]</h3>
                 <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={useSameAddress} onChange={() => setUseSameAddress(!useSameAddress)} className="w-4 h-4 text-[#0052CC] focus:ring-0 rounded-none border-[#DFE1E6]" />
                    <span className="text-[0.65rem] font-black text-[#5E6C84] uppercase tracking-widest group-hover:text-[#172B4D] transition-colors">Duplicate Primary</span>
                 </label>
              </div>
              {!useSameAddress && (
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                   {['fullName', 'phoneNumber', 'addressLine1', 'city', 'state', 'pincode'].map((field) => (
                      <div key={field} className={field === 'addressLine1' ? 'md:col-span-2' : ''}>
                         <label className="block text-[0.6rem] font-black text-[#6B778C] uppercase tracking-[0.2em] mb-2 px-1">{field.toUpperCase()}_FISCAL</label>
                         <input
                           type="text"
                           value={invoiceAddress[field]}
                           onChange={(e) => handleInvoiceAddressChange(field, e.target.value)}
                           className={`w-full h-11 bg-white border px-4 py-2 text-xs font-black uppercase tracking-widest outline-none focus:border-[#0052CC] transition-all italic ${errors[`invoice_${field}`] ? 'border-red-500' : 'border-[#DFE1E6]'}`}
                         />
                      </div>
                    ))}
                </div>
              )}
           </section>

           {/* DEPLOYMENT MODE */}
           <section className="exec-card overflow-hidden">
              <div className="px-8 py-4 bg-[#F4F5F7] border-b border-[#EBECF0]">
                 <h3 className="text-[0.65rem] font-black text-[#172B4D] uppercase tracking-widest italic">Deployment Protocol Select</h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                 {deliveryMethods.map((m) => (
                   <div 
                    key={m.id}
                    onClick={() => setDeliveryMethod(m.id)}
                    className={`p-6 border-2 cursor-pointer transition-all space-y-4 group ${deliveryMethod === m.id ? 'border-[#0052CC] bg-[#F4F5F7]' : 'border-[#DFE1E6] hover:border-[#A5ADBA]'}`}
                   >
                       <div className="flex justify-between items-start">
                          <div className={`w-3 h-3 rounded-full border-2 ${deliveryMethod === m.id ? 'border-[#0052CC] bg-[#0052CC]' : 'border-[#A5ADBA]'}`}></div>
                          <span className="text-sm font-black text-[#172B4D] italic tracking-tighter mono-num">{m.price === 0 ? 'NOMINAL' : `₹${m.price}`}</span>
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-[0.65rem] font-black text-[#172B4D] uppercase tracking-widest">{m.name}</h4>
                          <p className="text-[0.6rem] text-[#6B778C] font-semibold italic leading-tight">{m.description}</p>
                       </div>
                   </div>
                 ))}
              </div>
           </section>
        </div>

        <div className="lg:col-span-4">
           <div className="sticky top-10 space-y-6">
              <section className="exec-card p-10 bg-white shadow-2xl space-y-8 border-t-4 border-t-[#0052CC]">
                 <h3 className="text-[0.75rem] font-black text-[#172B4D] uppercase tracking-[0.25em] border-b border-[#EBECF0] pb-4">ORDER CONSOLIDATION</h3>
                 
                 <div className="space-y-3">
                    <span className="text-[0.6rem] font-black text-[#A5ADBA] uppercase tracking-[0.2em]">OPERATIONAL_LOAD</span>
                    <div className="flex justify-between items-center">
                       <span className="text-xl font-black text-[#172B4D] italic tracking-tighter uppercase">{cartItem.product.name}</span>
                       <span className="text-[0.65rem] font-black text-[#0052CC] uppercase tracking-widest">Qty: 01</span>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-[#EBECF0] space-y-3">
                    <div className="flex justify-between text-[0.7rem] font-bold text-[#5E6C84] uppercase tracking-widest">
                       <span>Sub Total Protocol</span>
                       <span className="mono-num font-black">{formatCurrency(cartItem.finalTotal)}</span>
                    </div>
                    <div className="flex justify-between text-[0.7rem] font-bold text-[#5E6C84] uppercase tracking-widest">
                       <span>Logic Surcharge</span>
                       <span className="mono-num font-black text-[#36B37E]">{deliveryMethod === 'pickup' ? 'NOMINAL' : formatCurrency(deliveryMethods.find(m => m.id === deliveryMethod).price)}</span>
                    </div>
                    <div className="pt-4 flex justify-between items-center text-[#172B4D]">
                       <span className="text-[0.75rem] font-black uppercase tracking-widest">NET COMMITTMENT</span>
                       <span className="text-2xl font-black italic tracking-tighter mono-num">₹{(finalTotal + (deliveryMethods.find(m => m.id === deliveryMethod)?.price || 0)).toLocaleString()}</span>
                    </div>
                 </div>

                 <button 
                  onClick={handleConfirm}
                  disabled={loading}
                  className="w-full h-14 bg-[#0052CC] text-white text-[0.65rem] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 hover:bg-[#0047B3] transition-all disabled:opacity-50 flex items-center justify-center"
                 >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'INITIALIZE FISCAL PAYMENT'}
                 </button>
                 
                 <button 
                  onClick={() => navigate('/customer/checkout/review')}
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

export default DeliveryPage;
