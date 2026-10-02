import React, { useEffect, useState, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [adminProfile, setAdminProfile] = useState({
        firstName: 'Admin',
        lastName: '',
        email: '',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2670&auto=format&fit=crop'
    });

    const routeTitles = {
        '/': 'Overview',
        '/products': 'Products',
        '/orders': 'Orders',
        '/customers': 'Customers',
        '/categories': 'Categories',
        '/brands': 'Brands',
        '/statistics': 'Statistics',
        '/feedbacks': 'Feedbacks',
        '/reviews': 'Reviews',
        '/coupons': 'Coupons',
        '/shipping': 'Shipping Settings',
        '/social': 'Social Settings',
        '/discount-settings': 'Discount Settings',
        '/profile': 'My Profile'
    };

    const currentTitle = routeTitles[location.pathname] || 'Dashboard';

    useEffect(() => {
        const loginTimestamp = localStorage.getItem('adminLoginTimestamp');
        if (!loginTimestamp) {
            navigate('/login');
            return;
        }

        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        if (now - parseInt(loginTimestamp, 10) > THIRTY_DAYS) {
            localStorage.removeItem('adminLoginTimestamp');
            navigate('/login');
            return;
        }

        // Fetch admin profile
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (!token) return;
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (data.success && data.admin) {
                    setAdminProfile({
                        firstName: data.admin.firstName || 'Admin',
                        lastName: data.admin.lastName || '',
                        email: data.admin.email || '',
                        profileImage: data.admin.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2670&auto=format&fit=crop'
                    });
                }
            } catch (err) {
                console.error("Failed to fetch admin profile", err);
            }
        };

        fetchProfile();

        // Listen for profile updates
        const handleProfileUpdate = (e) => {
            const updated = e.detail;
            setAdminProfile({
                firstName: updated.firstName || 'Admin',
                lastName: updated.lastName || '',
                email: updated.email || '',
                profileImage: updated.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2670&auto=format&fit=crop'
            });
        };

        window.addEventListener('adminProfileUpdated', handleProfileUpdate);

        // Click outside handler for profile dropdown
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('adminProfileUpdated', handleProfileUpdate);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [navigate, location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('adminLoginTimestamp');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-[#f4f7f9] font-sans overflow-hidden">
            {/* Sidebar (Clean & Premium) */}
            <div className="w-[280px] bg-white flex flex-col hidden md:flex relative z-20 border-r border-gray-100 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                {/* Logo Area */}
                <div className="h-[64px] px-8 flex items-center gap-4 border-b border-gray-100">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span className="text-white font-black text-xl relative z-10">T</span>
                    </div>
                    <span className="text-2xl font-extrabold tracking-tight text-gray-900">Toys<span className="text-indigo-600">.</span></span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 pt-6 pb-20 space-y-1 overflow-y-auto custom-scrollbar">
                    <div className="px-4 mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest">Main Menu</div>

                    <NavLink to="/" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                </div>
                                Dashboard
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/products" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                                </div>
                                Products
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/orders" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                </div>
                                Orders
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/customers" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5V16a3 3 0 00-5-1.5M9 20H4a2 2 0 01-2-2v-3a2 2 0 012-2h1.5m10.5 0a3 3 0 01-5-1.5M10.5 12a3 3 0 11-6 0 3 3 0 016 0zm10 0a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                Customers
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/categories" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                </div>
                                Categories
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/brands" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                Brands
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/banners" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                Banners
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/shipping" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                Shipping
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/subscribers" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                Subscribers
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/social" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                </div>
                                Social Settings
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/discount-settings" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                </div>
                                Discount Settings
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/statistics" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                                </div>
                                Statistics
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/feedbacks" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                                </div>
                                Feedback
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/reviews" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                </div>
                                Reviews
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/testimonials" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                </div>
                                Testimonials
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/coupons" className={({ isActive }) => `flex items-center gap-4 px-4 py-2.5 rounded-2xl font-bold transition-all relative overflow-hidden group ${isActive ? 'bg-indigo-50/50 text-indigo-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full"></div>}
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'bg-white shadow-sm text-indigo-600' : 'bg-gray-50 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                Coupons
                            </>
                        )}
                    </NavLink>
                </nav>

                {/* Logout */}
                <div className="p-6 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-2xl font-bold transition-all group">
                        <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-white group-hover:shadow-sm transition-all group-hover:scale-110">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        </div>
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Header - Glassmorphic */}
                <header className="h-[64px] bg-white/60 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0 border-white/50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </button>
                        <div className="hidden sm:block">
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{currentTitle}</h2>
                            <p className="text-sm font-medium text-gray-500 mt-0.5">Manage your store effectively.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Search Bar */}
                        <div className="hidden md:flex relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-64 bg-gray-50 border border-gray-200 text-sm rounded-2xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-gray-800 placeholder-gray-400"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all relative">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        {/* Profile */}
                        <div className="relative" ref={dropdownRef}>
                            <div 
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-3 pl-4 md:pl-6 border-l border-gray-200 cursor-pointer"
                            >
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] hover:shadow-lg hover:shadow-indigo-500/30 transition-shadow">
                                    <div className="w-full h-full bg-white rounded-[10px] overflow-hidden border border-white flex items-center justify-center font-bold text-indigo-600 bg-slate-50">
                                        {adminProfile.profileImage ? (
                                            <img src={adminProfile.profileImage} alt="Admin" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{adminProfile.firstName.charAt(0)}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="hidden lg:block">
                                    <p className="text-sm font-extrabold text-gray-900 leading-tight">
                                        {adminProfile.firstName} {adminProfile.lastName ? adminProfile.lastName.charAt(0) + '.' : ''}
                                    </p>
                                    <p className="text-xs font-bold text-gray-500">Super Admin</p>
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                    <div className="py-2">
                                        <button 
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                navigate('/profile');
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 font-bold hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-2 transition-colors border-b border-gray-50"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            My Profile
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                handleLogout();
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 font-bold hover:bg-red-50 flex items-center gap-2 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f4f7f9] relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
