import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadReviews = async () => {
        try {
            const response = await fetchAPI('/reviews');
            if (response.success) {
                setReviews(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const handleStatusChange = async (id, status) => {
        try {
            const response = await fetchAPI(`/reviews/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
            if (response.success) {
                loadReviews();
            }
        } catch (error) {
            console.error(`Failed to update review status to ${status}`, error);
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
        ));
    };

    return (
        <div className="p-6 md:p-8 lg:p-10 font-sans min-h-full bg-gray-50/50">
            <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Product Reviews</h1>
                    <p className="text-gray-500 font-medium">Manage and moderate product ratings from verified buyers.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No reviews found.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Product</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Rating</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Review</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {reviews.map((rev) => {
                                    const productName = rev.product ? rev.product.name : 'Unknown Product';
                                    const customerName = rev.customer ? `${rev.customer.firstName} ${rev.customer.lastName}` : 'Anonymous';
                                    
                                    return (
                                        <tr key={rev._id} className="hover:bg-amber-50/30 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="text-sm font-bold text-gray-900">{productName}</div>
                                                <div className="text-xs text-gray-500">by {customerName} on {new Date(rev.createdAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap flex items-center mt-1">
                                                {renderStars(rev.rating)}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-700 max-w-xs truncate">
                                                {rev.reviewText}
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                                    rev.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    rev.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                    'bg-red-100 text-red-700 border-red-200'
                                                }`}>
                                                    {rev.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right whitespace-nowrap flex justify-end gap-2">
                                                {rev.status !== 'Approved' && (
                                                    <button onClick={() => handleStatusChange(rev._id, 'Approved')} className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                                                        Approve
                                                    </button>
                                                )}
                                                {rev.status !== 'Rejected' && (
                                                    <button onClick={() => handleStatusChange(rev._id, 'Rejected')} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                                                        Reject
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reviews;
