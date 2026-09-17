import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const ShippingSettings = () => {
    const [settings, setSettings] = useState({
        baseShippingCharge: 50,
        isFreeShippingActive: true,
        freeShippingMinAmount: 1000,
        freeShippingMinItems: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/shipping`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data) {
                setSettings({
                    baseShippingCharge: data.baseShippingCharge || 0,
                    isFreeShippingActive: data.isFreeShippingActive ?? true,
                    freeShippingMinAmount: data.freeShippingMinAmount || 0,
                    freeShippingMinItems: data.freeShippingMinItems || 0
                });
            }
        } catch (error) {
            console.error("Error fetching shipping settings:", error);
            toast.error("Failed to load settings.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/shipping`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (data.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Shipping settings updated successfully!',
                    icon: 'success',
                    confirmButtonColor: '#C61A28',
                    confirmButtonText: 'Great!'
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: data.message || 'Failed to update settings',
                    icon: 'error',
                    confirmButtonColor: '#C61A28'
                });
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-[#C61A28] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Shipping Settings</h1>
                    <p className="text-slate-500 mt-1">Configure shipping charges and free shipping rules</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#C61A28] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#a11520] transition-colors shadow-lg shadow-red-200 flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Save Settings
                        </>
                    )}
                </button>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Base Configuration
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Base Shipping Charge (₹)</label>
                        <p className="text-xs text-slate-500 mb-3">This flat amount will be charged if free shipping conditions are not met.</p>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                            <input 
                                type="number" 
                                min="0"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-[#C61A28]/20 focus:border-[#C61A28] transition-all font-bold text-slate-700"
                                value={settings.baseShippingCharge === 0 ? '' : settings.baseShippingCharge}
                                placeholder="0"
                                onChange={(e) => setSettings({...settings, baseShippingCharge: e.target.value === '' ? 0 : Number(e.target.value)})}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="flex items-center justify-between mb-6 relative z-10">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                        Free Shipping Rules
                    </h2>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={settings.isFreeShippingActive}
                            onChange={(e) => setSettings({...settings, isFreeShippingActive: e.target.checked})}
                        />
                        <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                        <span className="ml-3 text-sm font-bold text-slate-700">{settings.isFreeShippingActive ? 'Active' : 'Inactive'}</span>
                    </label>
                </div>

                {settings.isFreeShippingActive && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 animate-fade-in-up">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Minimum Order Amount (₹)</label>
                            <p className="text-xs text-slate-500 mb-3">Orders over this amount will get free shipping. Set to 0 to ignore.</p>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input 
                                    type="number" 
                                    min="0"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-700"
                                    value={settings.freeShippingMinAmount === 0 ? '' : settings.freeShippingMinAmount}
                                    placeholder="0"
                                    onChange={(e) => setSettings({...settings, freeShippingMinAmount: e.target.value === '' ? 0 : Number(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Minimum Cart Items</label>
                            <p className="text-xs text-slate-500 mb-3">Orders with this many items or more get free shipping. Set to 0 to ignore.</p>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">📦</span>
                                <input 
                                    type="number" 
                                    min="0"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-slate-700"
                                    value={settings.freeShippingMinItems === 0 ? '' : settings.freeShippingMinItems}
                                    placeholder="0"
                                    onChange={(e) => setSettings({...settings, freeShippingMinItems: e.target.value === '' ? 0 : Number(e.target.value)})}
                                />
                            </div>
                        </div>
                    </div>
                )}
                
                {!settings.isFreeShippingActive && (
                    <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-sm font-medium border border-amber-200">
                        Free shipping rules are currently disabled. The base shipping charge will be applied to all orders regardless of amount or items.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShippingSettings;
