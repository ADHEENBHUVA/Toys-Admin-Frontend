import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const Brands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        description: '',
        website: '',
        status: 'Active'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => resolve(fileReader.result);
            fileReader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const base64Image = await convertToBase64(file);
            setFormData(prev => ({
                ...prev,
                logo: base64Image
            }));
        } catch (error) {
            console.error("Error converting image:", error);
            toast.error("Error uploading image");
        }
    };

    const removeImage = () => {
        setFormData(prev => ({
            ...prev,
            logo: ''
        }));
    };

    const loadBrands = async () => {
        try {
            setLoading(true);
            const response = await fetchAPI('/brands');
            if (response.success) {
                setBrands(response.data || response); // Depending on how fetchAPI wraps arrays
            } else if (Array.isArray(response)) {
                setBrands(response);
            }
        } catch (error) {
            console.error("Failed to fetch brands", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBrands();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;
        setIsSubmitting(true);
        try {
            const url = editingId ? `/brands/${editingId}` : '/brands';
            const method = editingId ? 'PUT' : 'POST';
            
            const res = await fetchAPI(url, {
                method,
                body: JSON.stringify(formData)
            });
            
            setIsModalOpen(false);
            setFormData({ name: '', logo: '', description: '', website: '', status: 'Active' });
            setEditingId(null);
            loadBrands();
            toast.success(editingId ? 'Brand updated successfully!' : 'Brand created successfully!');
        } catch (error) {
            console.error("Failed to save brand", error);
            toast.error("Failed to save brand");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (brand) => {
        setEditingId(brand._id);
        setFormData({
            name: brand.name || '',
            logo: brand.logo || '',
            description: brand.description || '',
            website: brand.website || '',
            status: brand.status || 'Active'
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
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
            await fetchAPI(`/brands/${id}`, { method: 'DELETE' });
            toast.success('Brand deleted successfully!');
            loadBrands();
        } catch (error) {
            console.error("Error deleting brand:", error);
            toast.error("Failed to delete brand");
        }
    };

    return (
        <div className="p-6 md:p-8 lg:p-10 font-sans min-h-full bg-gray-50/50 relative">
            <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Brands</h1>
                    <p className="text-gray-500 font-medium">Manage your product brands and manufacturers.</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', logo: '', description: '', website: '', status: 'Active' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    New Brand
                </button>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 py-12">Loading brands...</div>
            ) : brands.length === 0 ? (
                <div className="text-center text-gray-500 py-12">No brands found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {brands.map((brand) => (
                        <div key={brand._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center p-2">
                                            {brand.logo ? (
                                                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                            ) : null}
                                            <span className="text-xl font-black text-gray-300" style={{ display: brand.logo ? 'none' : 'flex' }}>{brand.name.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{brand.name}</h3>
                                            {brand.website && (
                                                <a href={brand.website} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline">{brand.website}</a>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${brand.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {brand.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2">{brand.description || 'No description available.'}</p>
                            </div>
                            <div className="mt-6 flex gap-2">
                                <button onClick={() => handleEditClick(brand)} className="flex-1 bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 py-2 rounded-lg text-sm font-semibold transition-colors">Edit</button>
                                <button onClick={() => handleDeleteClick(brand._id)} className="flex-1 bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-700 py-2 rounded-lg text-sm font-semibold transition-colors">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingId ? 'Edit Brand' : 'Create New Brand'}</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Brand Name *</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. LEGO"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Brand Logo (Optional)</label>
                                {!formData.logo ? (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-indigo-200 border-dashed rounded-xl cursor-pointer bg-indigo-50/30 hover:bg-indigo-50/70 transition-colors group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12M12 12v9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16l-4-4-4 4" /></svg>
                                            <p className="text-sm font-bold text-gray-600">Click to upload logo</p>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </label>
                                ) : (
                                    <div className="relative w-32 h-32 rounded-xl border border-gray-200 overflow-hidden shadow-sm group bg-gray-50 flex items-center justify-center p-2">
                                        <img src={formData.logo} alt="Preview" className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23f1f5f9"/><text x="50%" y="50%" font-family="sans-serif" font-weight="bold" font-size="12" fill="%23ef4444" text-anchor="middle" dominant-baseline="middle">Invalid Image</text></svg>'; }} />
                                        <button type="button" onClick={removeImage} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                <select 
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors appearance-none"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Brief description of this brand..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors resize-none h-20"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                    disabled={isSubmitting || !formData.name.trim()}
                                >
                                    {isSubmitting ? 'Saving...' : editingId ? 'Update Brand' : 'Create Brand'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Brands;
