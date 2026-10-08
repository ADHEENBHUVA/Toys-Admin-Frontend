import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus, Image as ImageIcon, Video, Trash2, Edit, AlertTriangle, X } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const PromoMediaManager = () => {
    const [media, setMedia] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    
    const [formData, setFormData] = useState({
        type: 'image',
        title: '',
        subtitle: '',
        link: '',
        order: 0,
        isActive: true,
        mediaFile: null
    });
    
    useEffect(() => {
        fetchMedia();
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(res.data.products || res.data);
        } catch (error) {
            console.error('Failed to fetch products');
        }
    };

    const fetchMedia = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/promomedia`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMedia(res.data);
        } catch (error) {
            toast.error('Failed to fetch media');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            });

            await axios.post(`${API_URL}/promomedia`, data, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            toast.success('Media added successfully');
            setIsModalOpen(false);
            fetchMedia();
            setFormData({ type: 'image', title: '', subtitle: '', link: '', order: 0, isActive: true, mediaFile: null });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add media');
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/promomedia/${deleteConfirmId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Media deleted successfully');
            setDeleteConfirmId(null);
            fetchMedia();
        } catch (error) {
            toast.error('Failed to delete media');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800">Promo Media (Videos & Images)</h1>
                    <p className="text-slate-500 mt-1">Manage promotional videos and gallery images for the homepage</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
                >
                    <Plus size={20} /> Add New Media
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {media.map(item => (
                    <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                        <div className="aspect-video bg-slate-100 relative">
                            {item.type === 'video' ? (
                                <video src={item.mediaUrl.startsWith('http') || item.mediaUrl.startsWith('data:') ? item.mediaUrl : `http://localhost:5000${item.mediaUrl}`} className="w-full h-full object-cover" controls muted />
                            ) : (
                                <img src={item.mediaUrl.startsWith('http') || item.mediaUrl.startsWith('data:') ? item.mediaUrl : `http://localhost:5000${item.mediaUrl}`} alt={item.title} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button onClick={() => setDeleteConfirmId(item._id)} className="p-2 bg-white/90 rounded-lg text-red-500 hover:bg-red-50">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-2">
                                {item.type === 'video' ? <Video size={14} /> : <ImageIcon size={14} />}
                                {item.type}
                            </div>
                            <h3 className="font-bold text-slate-800 truncate">{item.title || 'Untitled'}</h3>
                            <p className="text-sm text-slate-500 truncate">{item.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl p-8">
                        <h2 className="text-2xl font-black mb-6">Add New Promo Media</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
                                <select 
                                    className="w-full border-slate-200 rounded-xl p-3"
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Media File</label>
                                <input 
                                    type="file" 
                                    required
                                    accept={formData.type === 'video' ? 'video/*' : 'image/*'}
                                    className="w-full border border-slate-200 rounded-xl p-3"
                                    onChange={(e) => setFormData({...formData, mediaFile: e.target.files[0]})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Title (Optional)</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-slate-200 rounded-xl p-3"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Link to Product</label>
                                <select 
                                    className="w-full border border-slate-200 rounded-xl p-3"
                                    value={formData.link ? formData.link.replace('/product/', '') : ''}
                                    onChange={(e) => {
                                        const selectedProduct = products.find(p => p._id === e.target.value);
                                        if (selectedProduct) {
                                            setFormData({
                                                ...formData, 
                                                link: `/product/${selectedProduct._id}`,
                                                title: selectedProduct.name,
                                                subtitle: `Club: ₹${selectedProduct.clubPrice || selectedProduct.price}`
                                            });
                                        } else {
                                            setFormData({...formData, link: ''});
                                        }
                                    }}
                                >
                                    <option value="">-- No Product / Custom Link --</option>
                                    {products && products.map(p => (
                                        <option key={p._id} value={p._id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700">Upload Media</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl scale-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="text-red-500 w-6 h-6" />
                            </div>
                            <button onClick={() => setDeleteConfirmId(null)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">Delete Media?</h3>
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                            Are you sure you want to delete this promotional media? This action cannot be undone and it will be removed from the customer website immediately.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-3 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                                Cancel
                            </button>
                            <button onClick={confirmDelete} className="flex-1 px-4 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all hover:shadow-red-500/50">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromoMediaManager;
