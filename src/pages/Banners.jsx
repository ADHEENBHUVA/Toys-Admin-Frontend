import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingBannerId, setEditingBannerId] = useState(null);
    const [viewingBanner, setViewingBanner] = useState(null);
    
    const [activeTab, setActiveTab] = useState('PC');
    
    // Form state
    const [formData, setFormData] = useState({
        image: '',
        title: '',
        subtitle: '',
        buttonText: '',
        buttonLink: '',
        platform: 'PC',
        status: 'Active'
    });

    const handleEdit = (banner) => {
        setFormData({
            image: banner.image || '',
            title: banner.title || '',
            subtitle: banner.subtitle || '',
            buttonText: banner.buttonText || '',
            buttonLink: banner.buttonLink || '',
            platform: banner.platform || 'PC',
            status: banner.status || 'Active'
        });
        setEditingBannerId(banner._id);
        setIsAdding(true);
    };

    const handleView = (banner) => {
        setViewingBanner(banner);
    };

    const [imageInputType, setImageInputType] = useState('upload'); // 'upload' or 'url'
    const [mobileImageInputType, setMobileImageInputType] = useState('upload');
    
    // Custom Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/banners`);
            const data = await res.json();
            setBanners(data);
        } catch (error) {
            showToast('Failed to fetch banners', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = editingBannerId 
                ? `http://localhost:5000/api/banners/${editingBannerId}` 
                : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/banners`;
            const method = editingBannerId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                showToast(`Banner ${editingBannerId ? 'updated' : 'added'} successfully!`, 'success');
                setIsAdding(false);
                setEditingBannerId(null);
                setFormData({ image: '', title: '', subtitle: '', buttonText: '', buttonLink: '', platform: activeTab, status: 'Active' });
                fetchBanners();
            } else {
                const data = await res.json();
                showToast(data.message || `Failed to ${editingBannerId ? 'update' : 'add'} banner`, 'error');
            }
        } catch (error) {
            showToast('An error occurred', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, delete it!',
            customClass: {
                popup: 'rounded-3xl',
                confirmButton: 'rounded-xl font-bold px-6 py-2.5',
                cancelButton: 'rounded-xl font-bold px-6 py-2.5'
            }
        });

        if (!result.isConfirmed) return;
        
        try {
            const res = await fetch(`http://localhost:5000/api/banners/${id}`, {
                method: 'DELETE'
            });
            
            if (res.ok) {
                showToast('Banner deleted', 'success');
                fetchBanners();
            } else {
                showToast('Failed to delete banner', 'error');
            }
        } catch (error) {
            showToast('An error occurred', 'error');
        }
    };

    const toggleStatus = async (banner) => {
        const newStatus = banner.status === 'Active' ? 'Inactive' : 'Active';
        try {
            const res = await fetch(`http://localhost:5000/api/banners/${banner._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (res.ok) {
                showToast(`Banner marked as ${newStatus}`, 'success');
                fetchBanners();
            }
        } catch (error) {
            showToast('An error occurred', 'error');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showToast('Please upload a valid image file', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1920;
                    const MAX_HEIGHT = 1080;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    setFormData({ ...formData, image: dataUrl });
                };
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) return <div className="p-8 font-bold text-gray-500">Loading Banners...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto relative">
            
            {/* Image Preview Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <img 
                            src={selectedImage} 
                            alt="Preview Modal" 
                            className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl bg-gray-900" 
                            onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="800" height="400" fill="%23111827"/><text x="50%" y="50%" font-family="sans-serif" font-weight="bold" font-size="24" fill="%23ef4444" text-anchor="middle" dominant-baseline="middle">ERROR: You pasted a website link instead of an image link!</text></svg>'; 
                            }} 
                        />
                    </div>
                </div>
            )}
            
            {/* View Banner Modal Popup */}
            {viewingBanner && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg relative border border-gray-100">
                        <button 
                            onClick={() => setViewingBanner(null)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <h2 className="text-2xl font-black text-gray-900 mb-6">Banner Details</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-bold text-gray-500">Title</h3>
                                <p className="text-lg font-bold text-gray-900">{viewingBanner.title || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-500">Target Link</h3>
                                <p className="text-md font-medium text-gray-900">{viewingBanner.buttonLink || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-500">Status</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block mt-1 ${viewingBanner.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {viewingBanner.status}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 mb-2">Image</h3>
                                <img src={viewingBanner.image} alt="Banner" className="w-full h-32 object-cover rounded-xl border border-gray-200 cursor-pointer" onClick={() => setSelectedImage(viewingBanner.image)} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Custom Beautiful Toast Notification */}
            {toast.show && (
                <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-300 animate-fade-in-down ${toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? (
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) : (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                    <span className="font-bold text-sm tracking-wide">{toast.message}</span>
                </div>
            )}

            <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hero Banners</h1>
                    <p className="text-gray-500 font-medium mt-1 mb-4">Manage the image slider on the customer homepage</p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setActiveTab('PC')}
                            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'PC' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            PC Banners
                        </button>
                        <button 
                            onClick={() => setActiveTab('Mobile')}
                            className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'Mobile' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            Mobile Banners
                        </button>
                    </div>
                </div>
                <button 
                    onClick={() => { setIsAdding(true); setEditingBannerId(null); setFormData({ image: '', title: '', buttonLink: '', platform: activeTab, status: 'Active' }); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-colors mb-2"
                >
                    + Add New Banner
                </button>
            </div>

            {/* Add Banner Modal Popup */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg relative border border-gray-100">
                        <button 
                            onClick={() => setIsAdding(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <h2 className="text-2xl font-black text-gray-900 mb-6">{editingBannerId ? 'Edit Banner' : 'Add New Banner'}</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <label className="block text-sm font-bold text-gray-700">Image Source *</label>
                                </div>
                                
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-indigo-500 transition-colors cursor-pointer relative overflow-hidden bg-gray-50 h-[150px]">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        required={!formData.image}
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {formData.image ? (
                                        <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-2">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                            </div>
                                            <span className="text-sm font-bold text-gray-600">Click to upload image</span>
                                        </>
                                    )}
                                </div>
                            </div>


                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Title (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Subtitle (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                        placeholder="Up to 50% Off"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Button Text (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={formData.buttonText}
                                        onChange={(e) => setFormData({...formData, buttonText: e.target.value})}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                        placeholder="Shop Now"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Target Link (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={formData.buttonLink}
                                        onChange={(e) => setFormData({...formData, buttonLink: e.target.value})}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                                        placeholder="/products?category=LEGO"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-bold transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold shadow-sm transition-colors">
                                    {editingBannerId ? 'Update Banner' : 'Save Banner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Banners Grid */}
            {banners.filter(b => b.platform === activeTab || (!b.platform && activeTab === 'PC')).length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No {activeTab} Banners Yet</h3>
                    <p className="text-gray-500 font-medium max-w-sm mb-8">You haven't uploaded any {activeTab} banners. Click the button above to add your first banner to the homepage slider.</p>
                    <button 
                        onClick={() => { setIsAdding(true); setEditingBannerId(null); setFormData({ image: '', title: '', buttonLink: '', platform: activeTab, status: 'Active' }); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        Upload First {activeTab} Banner
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {banners.filter(b => b.platform === activeTab || (!b.platform && activeTab === 'PC')).map((banner) => (
                        <div key={banner._id} className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 group flex flex-col hover:-translate-y-1">
                            {/* Image Section */}
                            <div className="relative h-48 bg-gray-100 overflow-hidden">
                                <img 
                                    src={banner.image} 
                                    alt="Banner" 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="%23f1f5f9"/><text x="50%" y="50%" font-family="sans-serif" font-weight="bold" font-size="16" fill="%2394a3b8" text-anchor="middle" dominant-baseline="middle">Invalid Image</text></svg>'; }} 
                                />
                                
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                                
                                {/* Status Badge */}
                                <button 
                                    onClick={() => toggleStatus(banner)}
                                    className={`absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md transition-all ${banner.status === 'Active' ? 'bg-green-500/90 text-white hover:bg-green-600' : 'bg-white/90 text-gray-700 hover:bg-white'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${banner.status === 'Active' ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></div>
                                        {banner.status}
                                    </div>
                                </button>
                                
                                {/* Expand Button */}
                                <button 
                                    onClick={() => setSelectedImage(banner.image)}
                                    className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                                    title="View Full Image"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                                </button>


                            </div>
                            
                            {/* Content Section */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-gray-900 mb-1.5 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={banner.title}>{banner.title || 'Untitled Banner'}</h3>
                                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2" title={banner.buttonLink}>
                                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                                        <span className="truncate">{banner.buttonLink || 'No link provided'}</span>
                                    </p>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex gap-2.5 mt-6 pt-5 border-t border-gray-100">
                                    <button 
                                        onClick={() => handleView(banner)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white py-2.5 rounded-xl font-bold text-sm transition-colors group/btn"
                                    >
                                        <svg className="w-4 h-4 opacity-70 group-hover/btn:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        View
                                    </button>
                                    <button 
                                        onClick={() => handleEdit(banner)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-900 text-gray-700 hover:text-white py-2.5 rounded-xl font-bold text-sm transition-colors group/btn"
                                    >
                                        <svg className="w-4 h-4 opacity-70 group-hover/btn:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(banner._id)}
                                        className="flex items-center justify-center w-11 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white py-2.5 rounded-xl transition-colors shrink-0"
                                        title="Delete Banner"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-4 text-right text-sm font-bold text-gray-400">
                Total Banners: {banners.length} / 20
            </div>
        </div>
    );
};

export default Banners;
