import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';

const Feedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        const loadFeedbacks = async () => {
            try {
                const response = await fetchAPI('/feedbacks');
                if (response.success) {
                    setFeedbacks(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch feedbacks", error);
            } finally {
                setLoading(false);
            }
        };
        loadFeedbacks();
    }, []);

    const unreadCount = feedbacks.filter(fb => fb.status === 'New').length;
    const resolvedCount = feedbacks.filter(fb => fb.status === 'Resolved').length;

    const filteredFeedbacks = feedbacks.filter(fb => {
        if (activeTab === 'All') return true;
        return fb.status === activeTab;
    });

    return (
        <div className="p-6 md:p-8 lg:p-10 font-sans min-h-full bg-gray-50/50">
            <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Feedback & Support</h1>
                    <p className="text-gray-500 font-medium">Review support tickets and direct customer feedback.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gray-50/50 p-4 flex gap-4">
                    <button 
                        onClick={() => setActiveTab('All')}
                        className={`px-4 py-2 font-semibold rounded-lg transition-all ${activeTab === 'All' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-gray-500 hover:text-gray-700 border border-transparent'}`}
                    >
                        All ({feedbacks.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('New')}
                        className={`px-4 py-2 font-semibold rounded-lg transition-all ${activeTab === 'New' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-gray-500 hover:text-gray-700 border border-transparent'}`}
                    >
                        New ({unreadCount})
                    </button>
                    <button 
                        onClick={() => setActiveTab('Resolved')}
                        className={`px-4 py-2 font-semibold rounded-lg transition-all ${activeTab === 'Resolved' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-gray-500 hover:text-gray-700 border border-transparent'}`}
                    >
                        Resolved ({resolvedCount})
                    </button>
                </div>
                
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading feedbacks...</div>
                ) : filteredFeedbacks.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} feedback available.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredFeedbacks.map(fb => (
                            <div key={fb._id} className={`p-6 hover:bg-emerald-50/30 transition-colors cursor-pointer group ${fb.status === 'New' ? 'bg-emerald-50/10' : ''}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                                            {fb.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className={`text-sm ${fb.status === 'New' ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{fb.name}</h4>
                                            <p className="text-xs text-gray-500">{new Date(fb.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${fb.status === 'New' ? 'bg-emerald-100 text-emerald-700' : fb.status === 'Resolved' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                                        {fb.status}
                                    </span>
                                </div>
                                <div className="ml-13">
                                    <h5 className={`text-base mb-1 ${fb.status === 'New' ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>{fb.subject}</h5>
                                    <p className="text-gray-600 text-sm line-clamp-2">{fb.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feedbacks;
