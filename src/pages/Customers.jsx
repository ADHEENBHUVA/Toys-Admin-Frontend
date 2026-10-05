import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        accountStatus: 'Active'
    });

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const response = await fetchAPI('/customers');
            if (response.success) {
                setCustomers(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch customers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetchAPI('/customers', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            if (res.success) {
                setIsModalOpen(false);
                setFormData({ firstName: '', lastName: '', email: '', phone: '', accountStatus: 'Active' });
                loadCustomers();
                toast.success('Customer created successfully!');
            } else {
                toast.error(res.message || "Failed to create customer");
            }
        } catch (error) {
            console.error("Failed to create customer", error);
            toast.error("Failed to create customer");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700 border-green-200';
            case 'Inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'Suspended': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="p-6 md:p-8 lg:p-10 font-sans relative min-h-full bg-gray-50/50">
            <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Customers</h1>
                    <p className="text-gray-500 font-medium">Manage your active customers and view their history.</p>
                </div>
                <div className="flex gap-3 items-center">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Customer
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading customers...</div>
                    ) : customers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No customers found.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Customer</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Contact</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Orders</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Total Spent</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {customers.map((customer) => {
                                    const fullName = customer.name || (customer.firstName ? `${customer.firstName} ${customer.lastName || ''}` : 'Google/Social User');
                                    const initial = customer.name ? customer.name.charAt(0).toUpperCase() : (customer.firstName ? customer.firstName.charAt(0).toUpperCase() : customer.email.charAt(0).toUpperCase());
                                    
                                    return (
                                        <tr key={customer._id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm mr-3">
                                                        {initial}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{fullName}</div>
                                                        <div className="text-xs text-gray-500">Joined {new Date(customer.createdAt).toLocaleDateString('en-GB')}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                                                {customer.email}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                                                {customer.totalOrders || 0}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-semibold text-gray-800 whitespace-nowrap">
                                                ₹{(customer.totalSpending || 0).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusStyle(customer.accountStatus)}`}>
                                                    {customer.accountStatus}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <Link to={`/customers/${customer._id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors inline-flex items-center justify-center group-hover:bg-white group-hover:shadow-sm">
                                                    View Profile
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            
            {/* Add Customer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 transform transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900">Add New Customer</h2>
                                <p className="text-sm font-medium text-gray-500 mt-1">Create a new customer profile manually.</p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateCustomer} className="flex flex-col gap-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest pl-1 mb-2">First Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        placeholder="John"
                                        className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest pl-1 mb-2">Last Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        placeholder="Doe"
                                        className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest pl-1 mb-2">Email Address</label>
                                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} pattern="[^@\s]+@[^@\s]+\.[^@\s]+" title="Please enter a valid email address with @ and ." 
                                    placeholder="john.doe@example.com"
                                    className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest pl-1 mb-2">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest pl-1 mb-2">Account Status</label>
                                    <select 
                                        value={formData.accountStatus}
                                        onChange={(e) => setFormData({...formData, accountStatus: e.target.value})}
                                        className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm appearance-none"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                                    disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.email}
                                >
                                    {isSubmitting ? (
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Creating...</>
                                    ) : 'Create Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;

