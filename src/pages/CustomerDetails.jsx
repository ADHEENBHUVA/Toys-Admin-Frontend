import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAPI } from '../utils/api';

const CustomerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadCustomer = async () => {
            try {
                setLoading(true);
                const response = await fetchAPI(`/customers/${id}`);
                if (response.success) {
                    setCustomer(response.data);
                } else {
                    setError('Customer not found');
                }
            } catch (err) {
                console.error("Failed to fetch customer", err);
                setError('Failed to load customer details');
            } finally {
                setLoading(false);
            }
        };

        loadCustomer();
    }, [id]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700 border-green-200';
            case 'Inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'Suspended': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center h-full">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !customer) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl inline-block font-bold">
                    {error || 'Customer not found'}
                </div>
                <div className="mt-4">
                    <button onClick={() => navigate('/customers')} className="text-blue-600 font-bold hover:underline">
                        &larr; Back to Customers
                    </button>
                </div>
            </div>
        );
    }

    const initial = customer.firstName ? customer.firstName.charAt(0).toUpperCase() : customer.email.charAt(0).toUpperCase();
    const fullName = customer.firstName ? `${customer.firstName} ${customer.lastName || ''}` : 'Google/Social User';

    return (
        <div className="p-6 md:p-8 lg:p-10 font-sans min-h-full bg-gray-50/50">
            {/* Header & Back Button */}
            <div className="mb-6 flex items-center gap-4">
                <button 
                    onClick={() => navigate('/customers')}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-sm border border-gray-100 hover:text-blue-600 hover:border-blue-200 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Customer Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
                        
                        {/* Decorative background shape */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-blue-500 to-blue-700 opacity-10"></div>
                        
                        <div className="relative z-10 w-28 h-28 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-white mb-4">
                            {customer.picture ? (
                                <img src={customer.picture} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                                    {initial}
                                </div>
                            )}
                        </div>
                        
                        <h2 className="text-2xl font-black text-gray-900 mb-1">{fullName}</h2>
                        <p className="text-gray-500 font-medium mb-4">{customer.email}</p>
                        
                        <span className={`px-4 py-1.5 inline-flex text-sm font-bold rounded-full border mb-6 ${getStatusStyle(customer.accountStatus)}`}>
                            {customer.accountStatus || 'Active'}
                        </span>
                        
                        <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Login Method</span>
                                <span className="text-sm font-bold text-gray-700 bg-white px-2 py-1 rounded shadow-sm border border-gray-100">
                                    {customer.provider ? customer.provider.toUpperCase() : 'Email'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Joined Date</span>
                                <span className="text-sm font-bold text-gray-700">
                                    {new Date(customer.createdAt).toLocaleDateString('en-GB')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details & Stats */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                            </div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
                            <h3 className="text-3xl font-black text-gray-900">{customer.totalOrders || 0}</h3>
                        </div>
                        
                        <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Spent</p>
                            <h3 className="text-3xl font-black text-gray-900">₹{(customer.totalSpending || 0).toFixed(2)}</h3>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
                        <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                            Contact Details
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</span>
                                <span className="font-semibold text-gray-900">{customer.phone || 'Not provided'}</span>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Firebase UID</span>
                                <span className="font-semibold text-gray-900 text-xs break-all">{customer.firebaseUid || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetails;

