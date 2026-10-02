import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Tag } from 'lucide-react';

const DiscountSettings = () => {
    const [discountDisplayType, setDiscountDisplayType] = useState('amount');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setDiscountDisplayType(data.discountDisplayType || 'amount');
            } else {
                toast.error('Failed to load settings');
            }
        } catch (error) {
            toast.error('Error connecting to server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/settings/discount`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ discountDisplayType })
            });
            
            const data = await response.json();
            if (response.ok) {
                toast.success('Discount settings saved successfully');
            } else {
                toast.error(data.message || 'Failed to save settings');
            }
        } catch (error) {
            toast.error('Error connecting to server');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl">
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <Tag size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Discount Display Settings</h2>
                        <p className="text-sm text-gray-500 font-medium mt-1">Choose how discounts are shown to customers on the website</p>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Radio Group */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Display Mode</label>
                        
                        <div 
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${discountDisplayType === 'amount' ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-200 hover:border-indigo-200'}`}
                            onClick={() => setDiscountDisplayType('amount')}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${discountDisplayType === 'amount' ? 'border-indigo-600' : 'border-gray-300'}`}>
                                {discountDisplayType === 'amount' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-[15px]">Show Amount (Rupees)</h3>
                                <p className="text-sm text-gray-500 mt-0.5">Example: Save ₹250</p>
                            </div>
                        </div>

                        <div 
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${discountDisplayType === 'percentage' ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-200 hover:border-indigo-200'}`}
                            onClick={() => setDiscountDisplayType('percentage')}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${discountDisplayType === 'percentage' ? 'border-indigo-600' : 'border-gray-300'}`}>
                                {discountDisplayType === 'percentage' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-[15px]">Show Percentage (Takavari)</h3>
                                <p className="text-sm text-gray-500 mt-0.5">Example: 20% OFF</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiscountSettings;
