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
    const [editingId, setEditingId] = useState(null);
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    
    const parseLinkToIds = (link) => {
        if (!link) return [];
        if (link.startsWith('/product/')) return [link.replace('/product/', '')];
        if (link.startsWith('/products?ids=')) return link.replace('/products?ids=', '').split(',');
        return [];
    };
    
    const buildLinkFromIds = (ids) => {
        if (ids.length === 0) return '';
        if (ids.length === 1) return `/product/${ids[0]}`;
        return `/products?ids=${ids.join(',')}`;
    };
    
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
            const data = res.data.data || res.data.products || res.data;
            setProducts(Array.isArray(data) ? data : []);
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
            setMedia(Array.isArray(res.data) ? res.data : []);
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
                if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });

            if (editingId) {
                await axios.put(`${API_URL}/promomedia/${editingId}`, data, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Media updated successfully');
            } else {
                await axios.post(`${API_URL}/promomedia`, data, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('Media added successfully');
            }
            
            setIsModalOpen(false);
            setEditingId(null);
            fetchMedia();
            setFormData({ type: 'image', title: '', subtitle: '', link: '', order: 0, isActive: true, mediaFile: null });
            setSelectedProductIds([]);
            setProductSearchTerm('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save media');
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
                                <video src={item.mediaUrl?.startsWith('http') || item.mediaUrl?.startsWith('data:') ? item.mediaUrl : `http://localhost:5000${item.mediaUrl || ''}`} className="w-full h-full object-cover" controls muted />
                            ) : (
                                <img src={item.mediaUrl?.startsWith('http') || item.mediaUrl?.startsWith('data:') ? item.mediaUrl : `http://localhost:5000${item.mediaUrl || ''}`} alt={item.title} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button 
                                    onClick={() => {
                                        setFormData({
                                            type: item.type,
                                            title: item.title || '',
                                            subtitle: item.subtitle || '',
                                            link: item.link || '',
                                            order: item.order || 0,
                                            isActive: item.isActive,
                                            mediaFile: null
                                        });
                                        const ids = parseLinkToIds(item.link);
                                        setSelectedProductIds(ids);
                                        setEditingId(item._id);
                                        setIsModalOpen(true);
                                    }}
                                    className="p-2 bg-white/90 rounded-lg text-indigo-500 hover:bg-indigo-50"
                                >
                                    <Edit size={18} />
                                </button>
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
                        <h2 className="text-2xl font-black mb-6">{editingId ? 'Edit Promo Media' : 'Add New Promo Media'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Type</label>
                                <select 
                                    className="w-full border-slate-200 rounded-xl p-3"
                                    value={formData.type || 'image'}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                >
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Media File {editingId && <span className="text-slate-400 font-normal">(Leave empty to keep existing)</span>}</label>
                                <input 
                                    type="file" 
                                    required={!editingId}
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
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div className="relative z-40">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Select Products to Link</label>
                                
                                <input 
                                    type="text" 
                                    placeholder="Search products..."
                                    className="w-full border border-slate-200 rounded-xl p-3 mb-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                    value={productSearchTerm}
                                    onChange={(e) => setProductSearchTerm(e.target.value)}
                                />

                                <div className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50/50 max-h-60 overflow-y-auto shadow-inner">
                                    <div className="flex flex-col gap-2">
                                        {Array.isArray(products) && products.length > 0 ? products
                                            .filter(p => !productSearchTerm || p.name.toLowerCase().includes(productSearchTerm.toLowerCase()))
                                            .map((p, idx) => {
                                            const isChecked = selectedProductIds.includes(p._id);
                                            return (
                                                <label 
                                                    key={p._id || idx}
                                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isChecked ? 'bg-indigo-50 border border-indigo-200 shadow-sm' : 'bg-white border border-slate-200 hover:border-indigo-300 shadow-sm'}`}
                                                >
                                                    <input 
                                                        type="checkbox"
                                                        className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                            let newIds;
                                                            if (e.target.checked) {
                                                                newIds = [...selectedProductIds, p._id];
                                                            } else {
                                                                newIds = selectedProductIds.filter(id => id !== p._id);
                                                            }
                                                            setSelectedProductIds(newIds);
                                                            
                                                            const newFormData = { ...formData, link: buildLinkFromIds(newIds) };
                                                            if (newIds.length === 1 && !formData.title) {
                                                                newFormData.title = p.name;
                                                                newFormData.subtitle = `₹${p.price}`;
                                                            }
                                                            setFormData(newFormData);
                                                        }}
                                                    />
                                                    <span className={`text-sm ${isChecked ? 'font-bold text-indigo-900' : 'font-semibold text-slate-700'}`}>{p.name}</span>
                                                    <span className="text-xs font-bold text-slate-500 ml-auto bg-slate-100 px-2.5 py-1 rounded-md">₹{p.price}</span>
                                                </label>
                                            );
                                        }) : (
                                            <div className="text-sm text-slate-500 text-center py-4 font-medium">No products added yet.</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setFormData({ type: 'image', title: '', subtitle: '', link: '', order: 0, isActive: true, mediaFile: null });
                                        setProductSearchTerm('');
                                        setIsProductDropdownOpen(false);
                                    }} 
                                    className="flex-1 px-4 py-3 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
                                >
                                    Cancel
                                </button>
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
