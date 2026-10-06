import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import toast from 'react-hot-toast';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const response = await fetchAPI('/orders');
            if (response.success) {
                setOrders(response.data);
            }
        } catch (err) {
            console.error("Failed to fetch orders", err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const response = await fetchAPI(`/orders/${orderId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            if (response.success) {
                toast.success('Order status updated successfully');
                setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
            } else {
                toast.error('Failed to update status');
            }
        } catch (err) {
            console.error('Error updating status:', err);
            toast.error('Error updating status');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Processing':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Shipped':
            case 'Out for Delivery':
                return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Cancelled':
            case 'Failed':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'Refunded':
                return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'Returned':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'All' || order.orderStatus === filterStatus;
        const searchString = `${order._id} ${order.customer?.firstName || ''} ${order.customer?.lastName || ''} ${order.customer?.email || ''}`.toLowerCase();
        const matchesSearch = searchString.includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="p-6 md:p-8 lg:p-10 font-sans relative min-h-full bg-gray-50/50">
            {/* Header Section */}
            <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Orders</h1>
                    <p className="text-gray-500 font-medium">View and manage customer orders.</p>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-sm" 
                            placeholder="Search orders..." 
                        />
                    </div>
                    <div className="relative">
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filter {filterStatus !== 'All' && <span className="bg-blue-100 text-blue-700 text-xs py-0.5 px-2 rounded-full">{filterStatus}</span>}
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                                {['All', 'Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => { setFilterStatus(status); setIsFilterOpen(false); }}
                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${filterStatus === status ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Orders Table Container */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading orders...</div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">{error}</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No orders found matching your criteria.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Order ID</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Customer</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Date</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Items</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Amount</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.map((order) => {
                                    let customerName = 'Unknown Customer';
                                    if (order.customer) {
                                        if (order.customer.name) {
                                            customerName = order.customer.name;
                                        } else if (order.customer.firstName || order.customer.lastName) {
                                            customerName = `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim();
                                        } else {
                                            customerName = 'Unknown Customer';
                                        }
                                    }
                                    const customerEmail = order.customer ? order.customer.email : 'N/A';
                                    const initial = customerName !== 'Unknown Customer' ? customerName.charAt(0).toUpperCase() : '?';
                                    
                                    return (
                                        <tr key={order._id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap">
                                                #{order._id.substring(order._id.length - 6).toUpperCase()}
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm mr-3">
                                                        {initial}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">{customerName}</div>
                                                        <div className="text-xs text-gray-500">{customerEmail}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                                                {new Date(order.createdAt).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 whitespace-nowrap">
                                                {order.orderItems?.length || 0}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-semibold text-gray-800 whitespace-nowrap">
                                                ₹{order.totalAmount?.toFixed(2)}
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <select 
                                                    value={order.orderStatus}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border outline-none cursor-pointer appearance-none ${getStatusStyle(order.orderStatus)}`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Out for Delivery">Out for Delivery</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                    <option value="Returned">Returned</option>
                                                </select>
                                            </td>
                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <button className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors mr-2 inline-flex items-center justify-center group-hover:bg-white group-hover:shadow-sm" title="View Details">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <button className="text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 p-2 rounded-lg transition-colors inline-flex items-center justify-center group-hover:bg-white group-hover:shadow-sm" title="Delete">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
                
                {/* Pagination (Static for now) */}
                <div className="bg-white px-6 py-4 border-t border-gray-100 flex items-center justify-between sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-semibold text-gray-900">{filteredOrders.length > 0 ? 1 : 0}</span> to <span className="font-semibold text-gray-900">{filteredOrders.length}</span> of <span className="font-semibold text-gray-900">{filteredOrders.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors disabled:opacity-50">
                                    <span className="sr-only">Previous</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <button className="relative inline-flex items-center px-4 py-2 border border-gray-200 bg-blue-50 text-sm font-semibold text-blue-600 z-10">
                                    1
                                </button>
                                <button className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors disabled:opacity-50">
                                    <span className="sr-only">Next</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders;

