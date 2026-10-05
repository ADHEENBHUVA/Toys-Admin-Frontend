import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Star, Save, Image as ImageIcon } from 'lucide-react';
import { fetchAPI } from '../utils/api';

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        text: '',
        rating: 5,
        avatar: '',
        isActive: true
    });
    const [imagePreview, setImagePreview] = useState('');

    const fetchTestimonials = async () => {
        try {
            const res = await fetchAPI('/testimonials');
            if (res.success) {
                setTestimonials(res.data);
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setFormData({ ...formData, avatar: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await fetchAPI(`/testimonials/${editingId}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
            } else {
                await fetchAPI('/testimonials', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });
            }
            fetchTestimonials();
            closeModal();
        } catch (error) {
            console.error('Error saving testimonial:', error);
            alert('Failed to save testimonial');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this website review?')) {
            try {
                await fetchAPI(`/testimonials/${id}`, { method: 'DELETE' });
                fetchTestimonials();
            } catch (error) {
                console.error('Error deleting testimonial:', error);
            }
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await fetchAPI(`/testimonials/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ isActive: !currentStatus })
            });
            fetchTestimonials();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const openModal = (testimonial = null) => {
        if (testimonial) {
            setFormData({
                name: testimonial.name,
                location: testimonial.location,
                text: testimonial.text,
                rating: testimonial.rating,
                avatar: testimonial.avatar,
                isActive: testimonial.isActive
            });
            setImagePreview(testimonial.avatar);
            setEditingId(testimonial._id);
        } else {
            setFormData({ name: '', location: '', text: '', rating: 5, avatar: '', isActive: true });
            setImagePreview('');
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Website Reviews</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage customer testimonials shown on the homepage</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Review
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((test) => (
                        <div key={test._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative group">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(test)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(test._id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-4">
                                <img src={test.avatar} alt={test.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                <div>
                                    <h3 className="font-semibold text-gray-800">{test.name}</h3>
                                    <p className="text-xs text-gray-500">{test.location}</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < test.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
                                ))}
                            </div>
                            
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">{test.text}</p>
                            
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-xs text-gray-500">
                                    {new Date(test.createdAt).toLocaleDateString('en-GB')}
                                </span>
                                <button 
                                    onClick={() => toggleStatus(test._id, test.isActive)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                        test.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {test.isActive ? 'Active' : 'Hidden'}
                                </button>
                            </div>
                        </div>
                    ))}
                    {testimonials.length === 0 && (
                        <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                            <p className="text-gray-500 mt-1">Add your first website review to show on the dashboard.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {editingId ? 'Edit Review' : 'Add Website Review'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-6">
                                    <div className="shrink-0 relative group cursor-pointer">
                                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                        <label className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                            <span className="text-white text-xs">Upload</span>
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                                            <input 
                                                type="text" 
                                                required 
                                                value={formData.name} 
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                                placeholder="e.g. Emily R."
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location / Brand</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={formData.location} 
                                            onChange={e => setFormData({...formData, location: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            placeholder="e.g. Austin, TX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                        <select 
                                            value={formData.rating} 
                                            onChange={e => setFormData({...formData, rating: Number(e.target.value)})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        >
                                            <option value="5">5 Stars</option>
                                            <option value="4">4 Stars</option>
                                            <option value="3">3 Stars</option>
                                            <option value="2">2 Stars</option>
                                            <option value="1">1 Star</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Review Description</label>
                                    <textarea 
                                        required 
                                        rows="4"
                                        value={formData.text} 
                                        onChange={e => setFormData({...formData, text: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                                        placeholder="Write the customer's review here..."
                                    ></textarea>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({...formData, isActive: e.target.checked})}
                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="isActive" className="text-sm text-gray-700">Show this review on website</label>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                    <Save className="w-4 h-4" />
                                    Save Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Testimonials;

