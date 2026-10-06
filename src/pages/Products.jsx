import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const Products = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterCategory, setFilterCategory] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Dynamic Data State
    const [products, setProducts] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [brandOptions, setBrandOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        category: '',
        subCategory: '',
        price: '',
        stockQuantity: '',
        description: '',
        images: [],
        ageGroup: [],
        discountDisplayType: 'percentage',
        isReturnable: false,
        returnDays: 0
    });
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Pagination/Data stats
    const [totalProducts, setTotalProducts] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const loadProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAPI('/products');
            if (data.success) {
                setProducts(data.data);
                setTotalProducts(data.count);
            }
        } catch (err) {
            setError('Failed to fetch products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const loadCategoriesAndBrands = async () => {
            try {
                const [catRes, brandRes] = await Promise.all([
                    fetchAPI('/categories'),
                    fetchAPI('/brands')
                ]);
                if (catRes.success) setCategoryOptions(catRes.data);
                
                // Brands might be { success: true, data: [...] } or just an array
                if (brandRes.success) {
                    setBrandOptions(brandRes.data || brandRes);
                } else if (Array.isArray(brandRes)) {
                    setBrandOptions(brandRes);
                }
            } catch (err) {
                console.error("Failed to fetch data:", err);
            }
        };
        
        loadCategoriesAndBrands();
        loadProducts();
    }, []);

    // Reset pagination to page 1 whenever the search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
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
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality JPEG
                    resolve(dataUrl);
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            const base64Images = await Promise.all(files.map(file => compressImage(file)));
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...base64Images]
            }));
        } catch (error) {
            console.error("Error converting images:", error);
            toast.error("Error uploading images");
        }
    };

    const removeImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = editingId ? `/products/${editingId}` : '/products';
            const method = editingId ? 'PUT' : 'POST';

            const dataToSend = { ...formData };
            if (!dataToSend.subCategory) {
                delete dataToSend.subCategory; // Avoid casting error if empty
            }
            if (!dataToSend.brand) {
                delete dataToSend.brand;
            }

            const response = await fetchAPI(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            });

            if (response.success) {
                // Reset form
                setFormData({ name: '', brand: '', category: '', subCategory: '', originalPrice: '', price: '', stockQuantity: '', description: '', images: [], ageGroup: [], discountDisplayType: 'percentage', isReturnable: false, returnDays: 0 });
                setEditingId(null);
                setIsModalOpen(false);
                // Refresh table
                loadProducts();
                toast.success(editingId ? 'Product updated successfully!' : 'Product created successfully!');
            } else {
                toast.error(response.message || `Failed to ${editingId ? 'update' : 'create'} product`);
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditClick = async (product) => {
        setIsSaving(true);
        try {
            const response = await fetchAPI(`/products/${product._id}`);
            if (response.success) {
                const fullProduct = response.data;
                setFormData({
                    name: fullProduct.name || '',
                    brand: fullProduct.brand?._id || fullProduct.brand || '',
                    category: fullProduct.category || '',
                    subCategory: fullProduct.subCategory?._id || fullProduct.subCategory || '',
                    originalPrice: fullProduct.originalPrice || '',
                    price: fullProduct.price || '',
                    stockQuantity: fullProduct.stockQuantity || 0,
                    description: fullProduct.description || '',
                    images: fullProduct.images || [],
                    ageGroup: fullProduct.ageGroup || [],
                    discountDisplayType: fullProduct.discountDisplayType || 'percentage',
                    isReturnable: fullProduct.isReturnable || false,
                    returnDays: fullProduct.returnDays || 0
                });
                setEditingId(fullProduct._id);
                setIsModalOpen(true);
            } else {
                toast.error("Failed to load product details");
            }
        } catch (error) {
            console.error("Error loading product details:", error);
            toast.error("Error loading product details");
        } finally {
            setIsSaving(false);
        }
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
            const response = await fetchAPI(`/products/${id}`, { method: 'DELETE' });
            if (response.success) {
                toast.success('Product deleted successfully!');
                loadProducts();
            } else {
                toast.error(response.message || "Failed to delete product");
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Failed to delete product");
        }
    };

    const openAddModal = () => {
        setFormData({ name: '', brand: '', category: '', subCategory: '', originalPrice: '', price: '', stockQuantity: '', description: '', images: [], ageGroup: [], discountDisplayType: 'percentage', isReturnable: false, returnDays: 0 });
        setEditingId(null);
        setIsModalOpen(true);
    };

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchesCategory = filterCategory === 'All' || (p.category && p.category.trim().toLowerCase() === filterCategory.trim().toLowerCase());
        const searchString = `${p.name || ''} ${p._id || ''} ${p.sku || ''} ${p.category || ''}`.toLowerCase();
        const matchesSearch = searchString.includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTableData = filteredProducts.slice(startIndex, endIndex);

    return (
        <div className="p-6 md:p-8 lg:p-10 font-sans relative min-h-full">
            {/* Header Area */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Products</h1>
                    <p className="text-gray-500 font-medium">Manage your toy catalog, pricing, and live inventory.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                            Filter {filterCategory !== 'All' && <span className="bg-indigo-100 text-indigo-700 text-xs py-0.5 px-2 rounded-full font-semibold">{filterCategory}</span>}
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 max-h-60 overflow-y-auto">
                                <button
                                    onClick={() => { setFilterCategory('All'); setIsFilterOpen(false); }}
                                    className={`block w-full text-left px-4 py-2 text-sm transition-colors ${filterCategory === 'All' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    All Categories
                                </button>
                                {categoryOptions.map(cat => (
                                    <button
                                        key={cat._id}
                                        onClick={() => { setFilterCategory(cat.name); setIsFilterOpen(false); }}
                                        className={`block w-full text-left px-4 py-2 text-sm transition-colors ${filterCategory === cat.name ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={openAddModal}
                        className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Add Product
                    </button>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                {/* Search Bar */}
                <div className="p-6 border-b border-gray-100 bg-white/50">
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search products by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50/50 border border-gray-200 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-gray-800 placeholder-gray-400"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto relative min-h-[300px]">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="mt-3 text-sm font-bold text-gray-500">Loading catalog...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                            <div className="text-center p-6 bg-red-50 border border-red-100 rounded-2xl">
                                <p className="text-red-500 font-bold mb-2">{error}</p>
                                <button onClick={loadProducts} className="text-sm px-4 py-2 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors">Try Again</button>
                            </div>
                        </div>
                    )}

                    {!loading && !error && filteredProducts.length === 0 && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center py-12">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-gray-400">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
                            <p className="text-sm font-medium text-gray-500 max-w-sm text-center">It looks like your catalog is empty or no products match your search.</p>
                        </div>
                    )}

                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentTableData.map((product) => {
                                let rowBg = 'bg-red-50/70 hover:bg-red-100/60'; // Out of Stock
                                if (product.stockQuantity >= 10) rowBg = 'bg-green-50/70 hover:bg-green-100/60'; // In Stock
                                else if (product.stockQuantity >= 5) rowBg = 'bg-yellow-50/70 hover:bg-yellow-100/60'; // Low Stock
                                else if (product.stockQuantity > 0) rowBg = 'bg-orange-50/70 hover:bg-orange-100/60'; // Very Low
                                
                                return (
                                <tr key={product._id} className={`${rowBg} transition-colors group border-b border-white/50`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm shrink-0 flex items-center justify-center text-gray-300">
                                                {product.images && product.images[0] ? (
                                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{product.name}</div>
                                                <div className="text-sm font-medium text-gray-400 mt-0.5">ID: {product._id.substring(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 font-bold text-xs rounded-lg">{product.category || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-extrabold text-gray-900">₹{product.price}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {product.stockQuantity >= 10 ? (
                                                <><span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span><span className="text-sm font-bold text-green-700">In Stock</span></>
                                            ) : product.stockQuantity >= 5 ? (
                                                <><span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></span><span className="text-sm font-bold text-yellow-700">Low Stock</span></>
                                            ) : product.stockQuantity > 0 ? (
                                                <><span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></span><span className="text-sm font-bold text-orange-700">Very Low</span></>
                                            ) : (
                                                <><span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span><span className="text-sm font-bold text-red-700">Out of Stock</span></>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-700">{product.stockQuantity || 0} items</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleEditClick(product)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button onClick={() => handleDeleteClick(product._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-white/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm font-medium text-gray-500">
                            Showing <span className="font-extrabold text-gray-900">{startIndex + 1}</span> to <span className="font-extrabold text-gray-900">{Math.min(endIndex, filteredProducts.length)}</span> of <span className="font-extrabold text-gray-900">{filteredProducts.length}</span> products
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                                Previous
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-colors ${currentPage === i + 1
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                        aria-hidden="true"
                    ></div>

                    {/* Modal Content */}
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden transform transition-all border border-gray-100 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
                                <p className="text-sm font-medium text-gray-500 mt-1">Fill in the details to {editingId ? 'update this toy in' : 'publish a new toy to'} your catalog.</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto flex-1">
                            <form id="add-product-form" onSubmit={handleSubmit} className="space-y-6">

                                {/* Image Upload Component */}
                                <div>
                                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-indigo-200 border-dashed rounded-2xl cursor-pointer bg-indigo-50/30 hover:bg-indigo-50/70 transition-colors group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="w-12 h-12 mb-3 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12M12 12v9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16l-4-4-4 4" /></svg>
                                            </div>
                                            <p className="mb-1 text-sm font-bold text-gray-600">Click to upload multiple images</p>
                                            <p className="text-xs text-gray-500 font-medium">SVG, PNG, JPG</p>
                                        </div>
                                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </label>

                                    {/* Image Previews */}
                                    {formData.images.length > 0 && (
                                        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                                            {formData.images.map((imgSrc, idx) => (
                                                <div key={idx} className="relative w-20 h-20 shrink-0 rounded-xl border border-gray-200 overflow-hidden shadow-sm group">
                                                    <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Product Name</label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Classic Wooden Train" className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Category</label>
                                        <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value, subCategory: '' })} className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm appearance-none font-medium">
                                            <option value="">Select Category</option>
                                            {categoryOptions.map(cat => (
                                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Sub Category</label>
                                        <select value={formData.subCategory} onChange={e => setFormData({ ...formData, subCategory: e.target.value })} className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm appearance-none font-medium">
                                            <option value="">All Sub Categories</option>
                                            {categoryOptions.find(c => c.name === formData.category)?.subCategories?.map(sub => (
                                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Brand</label>
                                        <select value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm appearance-none font-medium">
                                            <option value="">Select Brand (Optional)</option>
                                            {brandOptions.map(brand => (
                                                <option key={brand._id} value={brand._id}>{brand.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Original Price (₹)</label>
                                        <input type="number" min="0" value={formData.originalPrice} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} placeholder="0.00" className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Discount Display</label>
                                        <select value={formData.discountDisplayType} onChange={e => setFormData({ ...formData, discountDisplayType: e.target.value })} className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm appearance-none font-medium">
                                            <option value="percentage">Percentage (e.g., 30% OFF)</option>
                                            <option value="amount">Amount (e.g., Save ₹500)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Current Price (₹)</label>
                                        <input required type="number" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Initial Stock</label>
                                        <input required type="number" min="0" value={formData.stockQuantity} onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })} placeholder="0" className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm" />
                                    </div>
                                    <div className="space-y-2 flex items-center pt-8">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" checked={formData.isReturnable} onChange={e => setFormData({ ...formData, isReturnable: e.target.checked, returnDays: e.target.checked ? 7 : 0 })} className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
                                            <span className="text-sm font-bold text-gray-900">Is Returnable?</span>
                                        </label>
                                    </div>
                                    {formData.isReturnable && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Return Window (Days)</label>
                                            <input required type="number" min="1" value={formData.returnDays} onChange={e => setFormData({ ...formData, returnDays: parseInt(e.target.value) || 0 })} placeholder="7" className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between pl-1">
                                        <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Age Groups</label>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const allAges = ['0-6 Months', '6-12 Months', '1-2 Years', '3-5 Years', '6-8 Years', '9-12 Years', '12+ Years'];
                                                if (formData.ageGroup.length === allAges.length) {
                                                    setFormData({ ...formData, ageGroup: [] });
                                                } else {
                                                    setFormData({ ...formData, ageGroup: allAges });
                                                }
                                            }}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                                        >
                                            {formData.ageGroup?.length === 7 ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50/80 border border-gray-200 rounded-xl p-4">
                                        {['0-6 Months', '6-12 Months', '1-2 Years', '3-5 Years', '6-8 Years', '9-12 Years', '12+ Years'].map(age => (
                                            <label key={age} className="flex items-center gap-2 cursor-pointer group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={formData.ageGroup?.includes(age)}
                                                    onChange={(e) => {
                                                        const current = formData.ageGroup || [];
                                                        if (e.target.checked) {
                                                            setFormData({ ...formData, ageGroup: [...current, age] });
                                                        } else {
                                                            setFormData({ ...formData, ageGroup: current.filter(a => a !== age) });
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                                                />
                                                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">{age}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-widest pl-1">Product Description</label>
                                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" placeholder="Brief description of the toy..." className="w-full bg-gray-50/80 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-sm resize-none"></textarea>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 rounded-b-3xl">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="add-product-form"
                                disabled={isSaving}
                                className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
                                ) : "Save Product"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
