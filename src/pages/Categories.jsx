import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import Swal from 'sweetalert2';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newCatName, setNewCatName] = useState('');
    const [newCatDesc, setNewCatDesc] = useState('');
    const [newCatImage, setNewCatImage] = useState('');
    const [newCatStatus, setNewCatStatus] = useState('Active');
    const [subCategories, setSubCategories] = useState([]);
    const [subCatInput, setSubCatInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];

    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await fetchAPI('/categories');
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;
        setIsSubmitting(true);
        try {
            const url = editingId ? `/categories/${editingId}` : '/categories';
            const method = editingId ? 'PUT' : 'POST';
            
            const formData = new FormData();
            formData.append('name', newCatName);
            formData.append('description', newCatDesc);
            formData.append('status', newCatStatus);
            formData.append('subCategories', JSON.stringify(subCategories));
            if (newCatImage instanceof File) {
                formData.append('image', newCatImage);
            } else if (newCatImage) {
                formData.append('image', newCatImage);
            }
            
            // Using fetch directly since fetchAPI might not support FormData correctly
            const token = localStorage.getItem('adminToken');
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${url}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            
            if (data.success) {
                setIsModalOpen(false);
                setNewCatName('');
                setNewCatDesc('');
                setNewCatImage('');
                setNewCatStatus('Active');
                setSubCategories([]);
                setSubCatInput('');
                setEditingId(null);
                loadCategories();
                
                Swal.fire({
                    title: 'Success!',
                    text: `Category ${editingId ? 'updated' : 'created'} successfully!`,
                    icon: 'success',
                    confirmButtonColor: '#4f46e5'
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: data.message || "Failed to save category",
                    icon: 'error',
                    confirmButtonColor: '#4f46e5'
                });
            }
        } catch (error) {
            console.error("Failed to save category", error);
            Swal.fire({
                title: 'Error!',
                text: "Failed to save category",
                icon: 'error',
                confirmButtonColor: '#4f46e5'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (cat) => {
        setEditingId(cat._id);
        setNewCatName(cat.name || '');
        setNewCatDesc(cat.description || '');
        setNewCatImage(cat.image || '');
        setNewCatStatus(cat.status || 'Active');
        setSubCategories(cat.subCategories || []);
        setIsModalOpen(true);
    };

    const handleAddSubCategory = (e) => {
        e.preventDefault();
        if (subCatInput.trim()) {
            setSubCategories([...subCategories, { name: subCatInput.trim() }]);
            setSubCatInput('');
        }
    };

    const handleRemoveSubCategory = (index) => {
        setSubCategories(subCategories.filter((_, i) => i !== index));
    };

    const handleDeleteClick = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!'
        });
        
        if (!result.isConfirmed) return;
        
        try {
            const response = await fetchAPI(`/categories/${id}`, { method: 'DELETE' });
            if (response.success) {
                loadCategories();
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The category has been deleted.',
                    icon: 'success',
                    confirmButtonColor: '#4f46e5'
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: response.message || "Failed to delete category",
                    icon: 'error',
                    confirmButtonColor: '#4f46e5'
                });
            }
        } catch (error) {
            console.error("Error deleting category:", error);
            Swal.fire({
                title: 'Error!',
                text: "Failed to delete category",
                icon: 'error',
                confirmButtonColor: '#4f46e5'
            });
        }
    };

    return (
        <div className="p-6 md:p-8 lg:p-10 font-sans min-h-full bg-gray-50/50 relative">
            <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Categories</h1>
                    <p className="text-gray-500 font-medium">Manage your product hierarchies and catalog tagging.</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setNewCatName('');
                        setNewCatDesc('');
                        setNewCatImage('');
                        setNewCatStatus('Active');
                        setSubCategories([]);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    New Category
                </button>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 py-12">Loading categories...</div>
            ) : categories.length === 0 ? (
                <div className="text-center text-gray-500 py-12">No categories found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {categories.map((cat, index) => {
                        const colorClass = colors[index % colors.length];
                        return (
                            <div key={cat._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${colorClass} opacity-80`}></div>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        {cat.image && <img src={cat.image} alt={cat.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />}
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{cat.name}</h3>
                                            <p className="text-sm text-gray-500 font-medium">{cat.productCount || 0} Products</p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${cat.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {cat.status}
                                    </span>
                                </div>
                                <div className="mt-6 flex gap-2">
                                    <button onClick={() => handleEditClick(cat)} className="flex-1 bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 py-2 rounded-lg text-sm font-semibold transition-colors">Edit</button>
                                    <button onClick={() => handleDeleteClick(cat._id)} className="flex-1 bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-700 py-2 rounded-lg text-sm font-semibold transition-colors">Delete</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingId ? 'Edit Category' : 'Create New Category'}</h2>
                        <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name</label>
                                <input 
                                    type="text" 
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    placeholder="e.g. Action Figures"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Category Image Upload</label>
                                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors relative">
                                    {newCatImage ? (
                                        <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 flex items-center justify-center mb-3">
                                            {typeof newCatImage === 'string' ? (
                                                <img src={newCatImage} alt="Category Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={URL.createObjectURL(newCatImage)} alt="Category Preview" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-400 mb-3 shadow-sm">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                        </div>
                                    )}
                                    <label className="cursor-pointer bg-white px-4 py-2 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                        {newCatImage ? 'Change Image' : 'Select Image'}
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setNewCatImage(e.target.files[0]);
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                <select 
                                    value={newCatStatus}
                                    onChange={(e) => setNewCatStatus(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors appearance-none"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                                <textarea 
                                    value={newCatDesc}
                                    onChange={(e) => setNewCatDesc(e.target.value)}
                                    placeholder="Brief description of this category..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors resize-none h-24"
                                />
                            </div>
                            
                            {/* Sub Categories Section */}
                            <div className="pt-2 border-t border-gray-100">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Sub Categories</label>
                                <div className="flex gap-2 mb-3">
                                    <input 
                                        type="text" 
                                        value={subCatInput}
                                        onChange={(e) => setSubCatInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddSubCategory(e);
                                            }
                                        }}
                                        placeholder="Add a sub-category..."
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors text-sm"
                                    />
                                    <button 
                                        type="button"
                                        onClick={handleAddSubCategory}
                                        className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors text-sm whitespace-nowrap"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {subCategories.map((sc, index) => (
                                        <div key={index} className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                                            <span>{sc.name}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveSubCategory(index)}
                                                className="text-gray-400 hover:text-red-500 focus:outline-none ml-1"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                    {subCategories.length === 0 && <span className="text-xs text-gray-400 italic">No sub-categories added yet.</span>}
                                </div>
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
                                    disabled={isSubmitting || !newCatName.trim()}
                                >
                                    {isSubmitting ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
