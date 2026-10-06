import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import { ChevronDown, ChevronRight, Folder, FolderOpen, Calendar, MessageSquare } from 'lucide-react';

const Feedbacks = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Accordion states
    const [expandedFolders, setExpandedFolders] = useState({});

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

    // Reset pagination on tab change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const toggleFolder = (folderId) => {
        setExpandedFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }));
    };

    const isTodayOrYesterday = (dateString) => {
        const d = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        return d.toDateString() === today.toDateString() || d.toDateString() === yesterday.toDateString();
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Process data based on active tab
    let displayItems = [];

    if (activeTab === 'New') {
        // Only Today and Yesterday
        displayItems = feedbacks
            .filter(fb => isTodayOrYesterday(fb.createdAt))
            .map(fb => ({ type: 'feedback', data: fb }));
    } else if (activeTab === 'Resolved') {
        displayItems = feedbacks
            .filter(fb => fb.status === 'Resolved')
            .map(fb => ({ type: 'feedback', data: fb }));
    } else {
        // 'All' Tab - Grouping Logic
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        const topLevelEntries = [];
        const pastMonthsMap = {}; 
        const pastYearsMap = {};

        feedbacks.forEach(fb => {
            const d = new Date(fb.createdAt);
            const y = d.getFullYear();
            const m = d.getMonth();
            
            if (y === currentYear && m === currentMonth) {
                // Current month -> top level
                topLevelEntries.push({ type: 'feedback', data: fb, date: d });
            } else if (y === currentYear) {
                // Past month of current year -> Month Folder
                const key = `${y}-${m}`;
                if (!pastMonthsMap[key]) {
                    pastMonthsMap[key] = { type: 'monthFolder', id: key, year: y, month: m, feedbacks: [], date: new Date(y, m, 1) };
                }
                pastMonthsMap[key].feedbacks.push(fb);
            } else {
                // Past year -> Year Folder
                const yKey = `${y}`;
                if (!pastYearsMap[yKey]) {
                    pastYearsMap[yKey] = { type: 'yearFolder', id: yKey, year: y, months: {}, date: new Date(y, 0, 1) };
                }
                
                const mKey = `${y}-${m}`;
                if (!pastYearsMap[yKey].months[mKey]) {
                    pastYearsMap[yKey].months[mKey] = { month: m, feedbacks: [] };
                }
                pastYearsMap[yKey].months[mKey].feedbacks.push(fb);
            }
        });

        Object.values(pastMonthsMap).forEach(folder => topLevelEntries.push(folder));
        Object.values(pastYearsMap).forEach(folder => {
            // Convert months object to array and sort descending
            folder.monthList = Object.values(folder.months).sort((a, b) => b.month - a.month);
            topLevelEntries.push(folder);
        });

        // Sort descending by date
        topLevelEntries.sort((a, b) => b.date - a.date);
        displayItems = topLevelEntries;
    }

    // Pagination Logic
    const totalPages = Math.ceil(displayItems.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = displayItems.slice(startIndex, startIndex + itemsPerPage);

    // Counts for tabs
    const newCount = feedbacks.filter(fb => isTodayOrYesterday(fb.createdAt)).length;
    const resolvedCount = feedbacks.filter(fb => fb.status === 'Resolved').length;

    // Render a single feedback item
    const renderFeedback = (fb, isNested = false) => (
        <div key={fb._id} className={`p-5 ${isNested ? 'border-b border-gray-100 last:border-0 hover:bg-white' : 'border border-gray-100 mb-3 rounded-xl hover:shadow-md'} transition-all bg-white cursor-pointer group ${fb.status === 'New' && !isNested ? 'border-emerald-200 bg-emerald-50/30' : ''}`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                        {fb.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h4 className={`text-sm ${fb.status === 'New' ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{fb.name}</h4>
                        <p className="text-xs text-gray-500">
                            {fb.email} {fb.phone ? `| ${fb.phone}` : ''} <br/>
                            {new Date(fb.createdAt).toLocaleString()}
                        </p>
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
    );

    return (
        <div className="p-6 md:p-8 lg:p-10 font-sans min-h-full bg-gray-50/50">
            <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Feedback & Support</h1>
                    <p className="text-gray-500 font-medium">Review support tickets organized by date.</p>
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
                        New ({newCount})
                    </button>
                    <button 
                        onClick={() => setActiveTab('Resolved')}
                        className={`px-4 py-2 font-semibold rounded-lg transition-all ${activeTab === 'Resolved' ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100' : 'text-gray-500 hover:text-gray-700 border border-transparent'}`}
                    >
                        Resolved ({resolvedCount})
                    </button>
                </div>
                
                <div className="p-6">
                    {loading ? (
                        <div className="py-12 text-center text-gray-500">Loading feedbacks...</div>
                    ) : displayItems.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} feedback available.</div>
                    ) : (
                        <div className="space-y-4">
                            {currentItems.map((item, index) => {
                                if (item.type === 'feedback') {
                                    return renderFeedback(item.data);
                                }
                                
                                if (item.type === 'monthFolder') {
                                    const isExpanded = expandedFolders[item.id];
                                    return (
                                        <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/30">
                                            <div 
                                                className="flex items-center justify-between p-4 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => toggleFolder(item.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {isExpanded ? <FolderOpen className="text-blue-500 w-5 h-5" /> : <Folder className="text-blue-500 w-5 h-5" />}
                                                    <span className="font-bold text-gray-800">{monthNames[item.month]} {item.year}</span>
                                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-semibold">{item.feedbacks.length} Items</span>
                                                </div>
                                                {isExpanded ? <ChevronDown className="text-gray-400 w-5 h-5" /> : <ChevronRight className="text-gray-400 w-5 h-5" />}
                                            </div>
                                            {isExpanded && (
                                                <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-3">
                                                    {item.feedbacks.map(fb => renderFeedback(fb, false))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                if (item.type === 'yearFolder') {
                                    const isExpanded = expandedFolders[item.id];
                                    return (
                                        <div key={item.id} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/30">
                                            <div 
                                                className="flex items-center justify-between p-4 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
                                                onClick={() => toggleFolder(item.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="text-purple-600 w-5 h-5" />
                                                    <span className="font-bold text-gray-800 text-lg">Year {item.year}</span>
                                                    <span className="bg-white text-gray-600 text-xs px-2 py-0.5 rounded-full shadow-sm font-semibold">{item.monthList.reduce((acc, m) => acc + m.feedbacks.length, 0)} Items</span>
                                                </div>
                                                {isExpanded ? <ChevronDown className="text-gray-500 w-5 h-5" /> : <ChevronRight className="text-gray-500 w-5 h-5" />}
                                            </div>
                                            {isExpanded && (
                                                <div className="p-4 border-t border-gray-200 space-y-4">
                                                    {item.monthList.map(mData => {
                                                        const mFolderId = `${item.id}-${mData.month}`;
                                                        const mExpanded = expandedFolders[mFolderId];
                                                        return (
                                                            <div key={mFolderId} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                                <div 
                                                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                                                    onClick={() => toggleFolder(mFolderId)}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        {mExpanded ? <FolderOpen className="text-blue-400 w-4 h-4" /> : <Folder className="text-blue-400 w-4 h-4" />}
                                                                        <span className="font-semibold text-gray-700">{monthNames[mData.month]}</span>
                                                                        <span className="text-gray-400 text-xs">({mData.feedbacks.length})</span>
                                                                    </div>
                                                                    {mExpanded ? <ChevronDown className="text-gray-400 w-4 h-4" /> : <ChevronRight className="text-gray-400 w-4 h-4" />}
                                                                </div>
                                                                {mExpanded && (
                                                                    <div className="p-3 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-3">
                                                                        {mData.feedbacks.map(fb => renderFeedback(fb, false))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <span className="text-sm text-gray-500 font-medium">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, displayItems.length)} of {displayItems.length} entries
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <div className="flex gap-1">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-md font-semibold text-sm transition-colors ${currentPage === i + 1 ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 rounded-md border border-gray-200 bg-white text-gray-600 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Feedbacks;
