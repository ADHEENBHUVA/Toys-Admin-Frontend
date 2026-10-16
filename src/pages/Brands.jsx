import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../utils/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export const BRAND_SHAPES = [
    { id: 'squircle', name: 'Squircle', path: "M 20 6 L 80 6 C 92 6 95 12 95 24 L 95 76 C 95 88 92 94 80 94 L 20 94 C 8 94 5 88 5 76 L 5 24 C 5 12 8 6 20 6 Z", defaultBg: '#FFF0F5', defaultBorder: '#FFB6C1', emoji: '🧸' },
    { id: 'circle', name: 'Circle', path: "M 50 6 A 44 44 0 1 1 49.99 6 Z", defaultBg: '#F0FFFF', defaultBorder: '#87CEFA', emoji: '🚀' },
    { id: 'cloud', name: 'Cloud', path: "M 25 24 C 28 12 45 10 52 20 C 60 10 78 12 82 24 C 94 28 96 46 92 60 C 95 74 86 88 74 88 C 65 92 55 88 48 85 C 40 92 25 90 18 82 C 8 76 6 60 12 50 C 6 38 14 26 25 24 Z", defaultBg: '#F5FFFA', defaultBorder: '#98FB98', emoji: '☁️' },
    { id: 'pill', name: 'Pill', path: "M 28 10 L 72 10 C 90 10 95 26 95 50 C 95 74 90 90 72 90 L 28 90 C 10 90 5 74 5 50 C 5 26 10 10 28 10 Z", defaultBg: '#FFFACD', defaultBorder: '#F0E68C', emoji: '🧩' },
    { id: 'hexagon', name: 'Hexagon', path: "M 50 6 C 60 6 88 20 92 28 C 96 36 96 64 92 72 C 88 80 60 94 50 94 C 40 94 12 80 8 72 C 4 64 4 36 8 28 C 12 20 40 6 50 6 Z", defaultBg: '#F8F8FF', defaultBorder: '#DDA0DD', emoji: '🐣' },
    { id: 'blob', name: 'Blob', path: "M 50 8 C 80 6 94 24 92 50 C 90 76 78 92 50 92 C 22 92 8 76 8 50 C 8 24 24 10 50 8 Z", defaultBg: '#F0FFF0', defaultBorder: '#90EE90', emoji: '🦖' },
    { id: 'box', name: 'Box', path: "M 32 8 L 68 8 C 82 8 92 18 92 32 L 92 68 C 92 82 82 92 68 92 L 32 92 C 18 92 8 82 8 68 L 8 32 C 8 18 18 8 32 8 Z", defaultBg: '#E6E6FA', defaultBorder: '#BA55D3', emoji: '🦄' },
    { id: 'daisy', name: 'Daisy', path: "M 50 8 C 60 8 68 4 76 10 C 84 16 90 14 94 22 C 98 30 94 40 96 50 C 98 60 94 70 90 78 C 86 86 78 84 72 90 C 66 96 56 94 50 94 C 44 94 34 96 28 90 C 22 84 14 86 10 78 C 6 70 2 60 4 50 C 6 40 2 30 6 22 C 10 14 16 16 24 10 C 32 4 40 8 50 8 Z", defaultBg: '#FFE4E1', defaultBorder: '#F08080', emoji: '🌸' },
    { id: 'crest', name: 'Crest', path: "M 20 12 C 40 8 60 8 80 12 C 92 28 94 62 82 80 C 68 92 50 94 50 94 C 50 94 32 92 18 80 C 6 62 8 28 20 12 Z", defaultBg: '#E0FFFF', defaultBorder: '#00CED1', emoji: '🐬' },
    { id: 'clover', name: 'Clover', path: "M 50 14 C 55 6 68 6 74 14 C 84 14 92 24 90 34 C 96 42 96 56 88 64 C 88 74 78 82 68 80 C 60 88 44 88 36 80 C 26 82 14 74 14 64 C 6 56 6 42 12 34 C 10 24 18 14 28 14 C 34 6 46 6 50 14 Z", defaultBg: '#FFDAB9', defaultBorder: '#FF8C00', emoji: '🐝' }
];

export const COLOR_PALETTES = [
    { label: 'Pastel Pink', bg: '#FFF0F5', border: '#FFB6C1' },
    { label: 'Sky Blue', bg: '#F0FFFF', border: '#87CEFA' },
    { label: 'Mint Green', bg: '#F5FFFA', border: '#98FB98' },
    { label: 'Lemon Yellow', bg: '#FFFACD', border: '#F0E68C' },
    { label: 'Lavender', bg: '#F8F8FF', border: '#DDA0DD' },
    { label: 'Pastel Peach', bg: '#FFDAB9', border: '#FF8C00' },
    { label: 'Soft Coral', bg: '#FFE4E1', border: '#F08080' },
    { label: 'Aqua Cyan', bg: '#E0FFFF', border: '#00CED1' },
    { label: 'Pure White', bg: '#FFFFFF', border: '#CBD5E1' },
    { label: 'Warm Cream', bg: '#FFFDF0', border: '#EADBB6' }
];

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
        shape: 'squircle',
        bgColor: '#FFF0F5',
        borderColor: '#FFB6C1',
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
                setBrands(response.data || response);
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
            
            await fetchAPI(url, {
                method,
                body: JSON.stringify(formData)
            });
            
            setIsModalOpen(false);
            setFormData({ 
                name: '', 
                logo: '', 
                description: '', 
                website: '', 
                shape: 'squircle',
                bgColor: '#FFF0F5',
                borderColor: '#FFB6C1',
                status: 'Active' 
            });
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
            shape: brand.shape || 'squircle',
            bgColor: brand.bgColor || '#FFF0F5',
            borderColor: brand.borderColor || '#FFB6C1',
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

    // Find current active shape object for live preview
    const currentShape = BRAND_SHAPES.find(s => s.id === formData.shape) || BRAND_SHAPES[0];

    return (
        <div className="p-6 md:p-8 lg:p-10 font-sans min-h-full bg-gray-50/50 relative">
            <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Brands</h1>
                    <p className="text-gray-500 font-medium">Manage your product brands, custom shapes, and display colors for the store marquee.</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ 
                            name: '', 
                            logo: '', 
                            description: '', 
                            website: '', 
                            shape: 'squircle',
                            bgColor: '#FFF0F5',
                            borderColor: '#FFB6C1',
                            status: 'Active' 
                        });
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
                    {brands.map((brand, idx) => {
                        const brandShapeObj = BRAND_SHAPES.find(s => s.id === brand.shape) || BRAND_SHAPES[idx % BRAND_SHAPES.length];
                        const bg = brand.bgColor || brandShapeObj.defaultBg;
                        const border = brand.borderColor || brandShapeObj.defaultBorder;

                        return (
                            <div key={brand._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-4 items-center">
                                            {/* Brand Logo in its Shape Preview */}
                                            <div className="relative w-18 h-18 shrink-0 flex items-center justify-center p-2.5">
                                                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-2xs">
                                                    <path 
                                                        d={brandShapeObj.path} 
                                                        fill={bg} 
                                                        stroke={border} 
                                                        strokeWidth="2.5" 
                                                        strokeLinecap="round" 
                                                        strokeLinejoin="round" 
                                                    />
                                                </svg>
                                                <div className="relative z-10 w-full h-full flex items-center justify-center p-1">
                                                    {brand.logo ? (
                                                        <img src={brand.logo} alt={brand.name} className="max-w-[85%] max-h-[85%] object-contain" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                    ) : null}
                                                    <span className="text-xl font-black text-gray-400" style={{ display: brand.logo ? 'none' : 'flex' }}>{brand.name.charAt(0)}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{brand.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-gray-100 text-gray-600 capitalize">
                                                        Shape: {brandShapeObj.name}
                                                    </span>
                                                    <div className="flex items-center gap-1 border border-gray-200 px-1.5 py-0.5 rounded-md bg-white">
                                                        <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: bg }}></span>
                                                        <span className="w-2.5 h-2.5 rounded-full border border-gray-300" style={{ backgroundColor: border }}></span>
                                                    </div>
                                                </div>
                                                {brand.website && (
                                                    <a href={brand.website} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline block mt-1">{brand.website}</a>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg shrink-0 ${brand.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
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
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Brand' : 'Create New Brand'}</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Customize brand details, marquee shape, and vibrant background colors.</p>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)} 
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {/* Live Store Marquee Preview */}
                            <div className="bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50 p-4 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative w-32 h-32 shrink-0 flex items-center justify-center group">
                                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105">
                                        <path 
                                            d={currentShape.path} 
                                            fill={formData.bgColor} 
                                            stroke={formData.borderColor} 
                                            strokeWidth="2.5" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                        />
                                    </svg>
                                    <div className="relative z-10 w-full h-full flex items-center justify-center p-4">
                                        {formData.logo ? (
                                            <img src={formData.logo} alt="Preview" className="max-w-[85%] max-h-[75%] object-contain" />
                                        ) : (
                                            <span className="text-2xl font-black text-gray-400">{formData.name ? formData.name.charAt(0) : '?'}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full w-fit mb-1.5">
                                        Live Storefront Preview
                                    </span>
                                    <h4 className="text-base font-bold text-gray-900">{formData.name || 'Brand Name'}</h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Selected Shape: <strong className="text-gray-800">{currentShape.name}</strong>
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-xs font-medium text-gray-600">
                                        <span>Fill: <span className="font-mono font-bold">{formData.bgColor}</span></span>
                                        <span>•</span>
                                        <span>Border: <span className="font-mono font-bold">{formData.borderColor}</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Basic Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Brand Name *</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="e.g. LEGO, Barbie, Mattel"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                    <select 
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                                    >
                                        <option value="Active">Active (Visible on Storefront)</option>
                                        <option value="Inactive">Inactive (Hidden)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Brand Logo Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Brand Logo</label>
                                {!formData.logo ? (
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-indigo-200 border-dashed rounded-xl cursor-pointer bg-indigo-50/30 hover:bg-indigo-50/70 transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12M12 12v9" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16l-4-4-4 4" /></svg>
                                            <span className="text-sm font-bold text-gray-700">Click to upload brand logo image</span>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </label>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-20 h-20 rounded-xl border border-gray-200 overflow-hidden shadow-xs group bg-gray-50 flex items-center justify-center p-2">
                                            <img src={formData.logo} alt="Preview" className="w-full h-full object-contain" />
                                            <button type="button" onClick={removeImage} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md">
                                                ✕
                                            </button>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={removeImage} 
                                            className="text-xs font-bold text-red-600 hover:text-red-700 underline"
                                        >
                                            Change Logo
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Shape Selector (Interactive 10 Shapes) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select Marquee Shape *
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                                    {BRAND_SHAPES.map((shape) => {
                                        const isSelected = formData.shape === shape.id;
                                        return (
                                            <button
                                                key={shape.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        shape: shape.id,
                                                        // Automatically set matching default colors if user hasn't heavily customized
                                                        bgColor: shape.defaultBg,
                                                        borderColor: shape.defaultBorder
                                                    }));
                                                }}
                                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                                                    isSelected 
                                                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm scale-102 ring-2 ring-indigo-200' 
                                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="relative w-12 h-12 mb-1.5 flex items-center justify-center">
                                                    <svg viewBox="0 0 100 100" className="w-full h-full">
                                                        <path 
                                                            d={shape.path} 
                                                            fill={isSelected ? formData.bgColor : shape.defaultBg} 
                                                            stroke={isSelected ? formData.borderColor : shape.defaultBorder} 
                                                            strokeWidth="3" 
                                                        />
                                                    </svg>
                                                    <span className="absolute text-sm">{shape.emoji}</span>
                                                </div>
                                                <span className={`text-xs font-bold ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                                                    {shape.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Color Selector: 1-Click Palettes & Custom Color Pickers */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select Shape Color Palette
                                </label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {COLOR_PALETTES.map((palette, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                bgColor: palette.bg,
                                                borderColor: palette.border
                                            }))}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-400 bg-white shadow-2xs hover:scale-105 transition-all text-xs font-semibold text-gray-700"
                                        >
                                            <span 
                                                className="w-4 h-4 rounded-full border shadow-2xs" 
                                                style={{ backgroundColor: palette.bg, borderColor: palette.border }}
                                            />
                                            {palette.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Color Pickers */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Background Color (Fill)</label>
                                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
                                            <input 
                                                type="color" 
                                                value={formData.bgColor} 
                                                onChange={(e) => setFormData(prev => ({ ...prev, bgColor: e.target.value }))}
                                                className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                                            />
                                            <input 
                                                type="text" 
                                                value={formData.bgColor} 
                                                onChange={(e) => setFormData(prev => ({ ...prev, bgColor: e.target.value }))}
                                                className="text-xs font-mono font-bold text-gray-800 w-full focus:outline-none uppercase"
                                                maxLength={7}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">Border Color (Outline)</label>
                                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
                                            <input 
                                                type="color" 
                                                value={formData.borderColor} 
                                                onChange={(e) => setFormData(prev => ({ ...prev, borderColor: e.target.value }))}
                                                className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                                            />
                                            <input 
                                                type="text" 
                                                value={formData.borderColor} 
                                                onChange={(e) => setFormData(prev => ({ ...prev, borderColor: e.target.value }))}
                                                className="text-xs font-mono font-bold text-gray-800 w-full focus:outline-none uppercase"
                                                maxLength={7}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Website Link & Description */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Website URL (Optional)</label>
                                    <input 
                                        type="url" 
                                        value={formData.website}
                                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                                        placeholder="https://brandwebsite.com"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                                    <input 
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        placeholder="Brief description of this brand..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
                                    className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-600/20"
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
