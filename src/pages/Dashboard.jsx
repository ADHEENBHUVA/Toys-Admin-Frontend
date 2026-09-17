import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAPI } from '../utils/api'; 

const Dashboard = () => {
    const [data, setData] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeCustomers: 0,
        increases: { products: '0%', orders: '0%', revenue: '0%', customers: '0%' },
        recentSales: [],
        chartData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const response = await fetchAPI('/dashboard/stats');
                if (response.success) {
                    setData(response.data);
                }
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    const formatRupee = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-IN').format(num);
    };

    const timeAgo = (dateInput) => {
        if (!dateInput) return '';
        const now = new Date();
        const past = new Date(dateInput);
        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    const isIncreasePositive = (incStr) => incStr && incStr.startsWith('+');

    const stats = [
        {
            title: 'Total Products',
            value: formatNumber(data.totalProducts),
            increase: data.increases?.products || '0%', 
            icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            ),
            gradient: 'from-blue-600 to-indigo-600',
            bgGlow: 'bg-blue-500/20'
        },
        {
            title: 'Total Orders',
            value: formatNumber(data.totalOrders),
            increase: data.increases?.orders || '0%',
            icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            ),
            gradient: 'from-purple-600 to-fuchsia-600',
            bgGlow: 'bg-purple-500/20'
        },
        {
            title: 'Total Revenue',
            value: formatRupee(data.totalRevenue),
            increase: data.increases?.revenue || '0%',
            icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ),
            gradient: 'from-emerald-500 to-teal-500',
            bgGlow: 'bg-emerald-500/20'
        },
        {
            title: 'Active Customers',
            value: formatNumber(data.activeCustomers),
            increase: data.increases?.customers || '0%',
            icon: (
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5V16a3 3 0 00-5-1.5M9 20H4a2 2 0 01-2-2v-3a2 2 0 012-2h1.5m10.5 0a3 3 0 01-5-1.5M10.5 12a3 3 0 11-6 0 3 3 0 016 0zm10 0a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            ),
            gradient: 'from-amber-500 to-orange-500',
            bgGlow: 'bg-amber-500/20'
        }
    ];

    // Chart scaling logic
    const maxChartValue = Math.max(...data.chartData, 1); // Avoid division by 0
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (loading) {
        return (
            <div className="p-6 md:p-10 w-full animate-pulse">
                <div className="h-10 bg-gray-200 rounded w-64 mb-10"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-40 bg-gray-200 rounded-3xl"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-96 bg-gray-200 rounded-3xl"></div>
                    <div className="h-96 bg-gray-200 rounded-3xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 lg:p-10 font-sans relative min-h-full">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-200/50 via-purple-100/30 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
            
            <div className="relative z-10">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Dashboard Overview</h1>
                        <p className="text-slate-500 font-medium text-lg">Welcome back, here's what's happening with your store today.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/products" className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            New Product
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="group bg-white p-7 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-48">
                            
                            {/* Decorative Background Glow */}
                            <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${stat.bgGlow}`}></div>

                            <div className="relative z-10 flex justify-between items-start">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${stat.gradient} shadow-lg transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                                    {stat.icon}
                                </div>
                                <span className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-xl ${isIncreasePositive(stat.increase) ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-red-600 bg-red-50 border border-red-100'}`}>
                                    {isIncreasePositive(stat.increase) ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                    )}
                                    {stat.increase}
                                </span>
                            </div>

                            <div className="relative z-10 mt-4">
                                <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">{stat.title}</h3>
                                <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Chart */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden flex flex-col min-h-[450px]">
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h3 className="text-2xl font-extrabold text-slate-800">Revenue Analytics</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Monthly performance breakdown</p>
                            </div>
                            <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block px-4 py-2.5 outline-none cursor-pointer transition-colors hover:bg-slate-100">
                                <option>This Year</option>
                            </select>
                        </div>

                        {/* Animated CSS Chart */}
                        <div className="flex-1 w-full bg-slate-50/50 rounded-2xl p-6 pb-2 flex flex-col justify-end relative mt-2 border border-slate-100">
                            {/* Horizontal Grid lines */}
                            <div className="absolute inset-0 p-6 pb-8 flex flex-col justify-between pointer-events-none">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-full border-t border-slate-200 border-dashed opacity-50"></div>
                                ))}
                            </div>

                            {/* Chart Bars */}
                            <div className="w-full h-full min-h-[260px] flex items-end justify-between gap-2 sm:gap-4 z-10 pt-8 px-2">
                                {data.chartData.map((val, i) => {
                                    const heightPercent = (val / maxChartValue) * 100;
                                    return (
                                        <div key={i} className="flex flex-col items-center flex-1 group/bar h-full justify-end relative">
                                            {/* Tooltip */}
                                            <div className="absolute -top-10 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                                {formatRupee(val)}
                                            </div>

                                            {/* Bar Container */}
                                            <div className="w-full h-full relative flex items-end justify-center pb-2">
                                                <div
                                                    className="w-full max-w-[3rem] bg-indigo-100 rounded-xl transition-all duration-500 ease-out group-hover/bar:bg-indigo-500 relative cursor-pointer"
                                                    style={{ height: `${heightPercent}%`, minHeight: heightPercent > 0 ? '10%' : '2px' }}
                                                >
                                                    {/* Glow effect on hover */}
                                                    <div className="absolute inset-0 bg-indigo-400 rounded-xl blur-md opacity-0 group-hover/bar:opacity-40 transition-opacity"></div>
                                                </div>
                                            </div>
                                            {/* Label */}
                                            <span className="text-xs font-bold text-slate-400 shrink-0 mt-2 uppercase tracking-wider group-hover/bar:text-indigo-600 transition-colors">
                                                {months[i]}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Side Sidebar - Recent Orders */}
                    <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col min-h-[450px]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-extrabold text-slate-800">Recent Sales</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Latest transactions</p>
                            </div>
                            <Link to="/orders" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">View All</Link>
                        </div>

                        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                            {data.recentSales && data.recentSales.length > 0 ? (
                                data.recentSales.map((order) => (
                                    <div key={order.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-slate-100 group">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-lg flex-shrink-0 group-hover:scale-110 transition-transform shadow-inner border border-indigo-100/50">
                                            {order.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-extrabold text-slate-800 truncate">{order.name}</h4>
                                            <p className="text-xs font-bold text-slate-400 truncate">{timeAgo(order.time)}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-black text-slate-800">{formatRupee(order.price)}</p>
                                            <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-md inline-block mt-1.5 ${order.color}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500">No recent sales yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
