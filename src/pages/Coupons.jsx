import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'Percentage',
        discountValue: '',
        usageLimit: '',
        expiryDate: '',
        status: 'Active'
    });

    useEffect(() => {
        const loadCoupons = async () => {
            try {
                const response = await fetchAPI('/coupons');
                if (response.success) {
                    setCoupons(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch coupons", error);
            } finally {
                setLoading(false);
            }
        };
        loadCoupons();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetchAPI('/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.success) {
                setCoupons([response.data, ...coupons]);
                setIsModalOpen(false);
                setFormData({
                    code: '',
                    discountType: 'Percentage',
                    discountValue: '',
                    usageLimit: '',
                    expiryDate: '',
                    status: 'Active'
                });
                toast.success('Coupon created successfully!');
            } else {
                toast.error(response.message || 'Failed to create coupon');
            }
        } catch (error) {
            console.error('Error creating coupon:', error);
            toast.error('An error occurred');
        }
    };

    return (
        <div className="p-6 md:p-8 lg:p-10 font-sans min-h-full bg-gray-50/50">
            <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Coupons & Promos</h1>
                    <p className="text-gray-500 font-medium">Create and distribute discount codes and seasonal promos.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-rose-700 transition-colors shadow-sm shadow-rose-600/20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Coupon
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading coupons...</div>
                    ) : coupons.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No coupons found.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Code</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Discount</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Usage</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Expiry</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {coupons.map((coupon) => (
                                    <tr key={coupon._id} className="hover:bg-rose-50/30 transition-colors group">
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="inline-flex items-center px-3 py-1 rounded border border-rose-200 bg-rose-50 text-rose-700 font-mono font-bold text-sm tracking-widest">
                                                {coupon.code}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">{coupon.discountType}</div>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-extrabold text-gray-900 whitespace-nowrap">
                                            {coupon.discountType === 'Percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {coupon.usedCount || 0} / {coupon.usageLimit > 0 ? coupon.usageLimit : '∞'}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                                            {new Date(coupon.expiryDate).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                                                coupon.status === 'Active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                                {coupon.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right whitespace-nowrap">
                                            <button className="text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 p-2 rounded-lg transition-colors inline-flex items-center justify-center mr-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            </button>
                                            <button className="text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition-colors inline-flex items-center justify-center">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Create Coupon Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    <div 
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsModalOpen(false)}
                    ></div>

                    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Create Coupon</h3>
                                <p className="text-sm font-medium text-gray-500 mt-1">Add a new discount code for your store.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shadow-sm border border-gray-200">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto flex-1">
                            <form id="create-coupon-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Coupon Code</label>
                                    <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. SUMMER50" className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 uppercase" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Type</label>
                                        <select required value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})} className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500">
                                            <option value="Percentage">Percentage</option>
                                            <option value="Fixed Amount">Fixed Amount</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Value</label>
                                        <input required type="number" min="0" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: e.target.value})} placeholder="0" className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Usage Limit</label>
                                        <input type="number" min="0" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} placeholder="e.g. 100" className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Status</label>
                                        <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500">
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Expiry Date</label>
                                    <input required type="date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" />
                                </div>
                            </form>
                        </div>
                        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-3xl">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors">Cancel</button>
                            <button type="submit" form="create-coupon-form" className="px-8 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20 hover:bg-rose-700 active:scale-95 transition-all">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Coupons;
