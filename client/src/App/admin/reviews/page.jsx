import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../../../lib/api';
import { Star, Trash2, MessageSquare, User, Package, Calendar } from 'lucide-react';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsAPI.getAllReviews();
      setReviews(data);
    } catch (err) {
      setError('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await reviewsAPI.deleteReview(reviewId);
      setReviews(reviews.filter(r => r._id !== reviewId));
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">LOADING_MODERATION_LEDGER...</div>;

  return (
    <div className="space-y-8 animate-entrance">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight italic">Feedback_Moderation</h1>
          <p className="text-slate-500 font-medium">Review and manage platform testimonials</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl">
           <span className="text-[0.65rem] font-black text-blue-600 uppercase tracking-widest">TOTAL_REVIEWS: {reviews.length}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-widest">
           {error}
        </div>
      )}

      <div className="grid gap-6">
        {reviews.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl space-y-4">
             <MessageSquare className="w-12 h-12 text-slate-300" />
             <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">NO_REVIEWS_PENDING_MODERATION</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev._id} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Product Info */}
                <div className="lg:w-1/4 space-y-3">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Package className="w-4 h-4" />
                    <span className="text-[0.65rem] font-black uppercase tracking-widest">Product_Asset</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 uppercase italic truncate">{rev.product?.name}</h3>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-slate-100'}`} />
                    ))}
                  </div>
                </div>

                {/* Review Body */}
                <div className="lg:w-2/4 border-l border-slate-100 lg:pl-8 space-y-4">
                   <div className="flex items-center gap-2 text-emerald-600">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-[0.65rem] font-black uppercase tracking-widest">Feedback_Content</span>
                   </div>
                   <p className="text-slate-600 font-semibold italic text-sm leading-relaxed">
                     "{rev.comment}"
                   </p>
                </div>

                {/* Author Info */}
                <div className="lg:w-1/4 border-l border-slate-100 lg:pl-8 space-y-4 relative">
                   <div className="flex items-center gap-2 text-slate-400">
                      <User className="w-4 h-4" />
                      <span className="text-[0.65rem] font-black uppercase tracking-widest">Submitted_By</span>
                   </div>
                   <div>
                     <p className="text-sm font-black text-slate-800 uppercase">{rev.user?.name}</p>
                     <p className="text-[0.65rem] font-bold text-slate-400 truncate">{rev.user?.email}</p>
                   </div>
                   <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[0.55rem] font-bold uppercase">{new Date(rev.createdAt).toLocaleDateString()}</span>
                   </div>
                   
                   {/* Actions */}
                   <button 
                    onClick={() => handleDelete(rev._id)}
                    className="absolute top-0 right-0 p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                   >
                     <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReviewsPage;
