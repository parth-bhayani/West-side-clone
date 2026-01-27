import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import './AdminPages.css';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '', description: '', price: '', salePrice: '', category: '', subCategory: '',
        images: '', sizes: '', colors: '', stock: '', brand: 'Westside', gender: 'Unisex',
        isFeatured: false, isOnSale: false
    });

    useEffect(() => {
        fetchCategories();
        if (isEdit) fetchProduct();
    }, [id]);

    const fetchCategories = async () => {
        const { data } = await axios.get('/api/categories');
        setCategories(data);
    };

    const fetchProduct = async () => {
        try {
            const { data } = await axios.get(`/api/products/${id}`);
            setForm({
                name: data.name, description: data.description, price: data.price, salePrice: data.salePrice || '',
                category: data.category?._id || '', subCategory: data.subCategory || '',
                images: data.images?.join(', ') || '', sizes: data.sizes?.join(', ') || '',
                colors: data.colors?.map(c => `${c.name}:${c.hex}`).join(', ') || '',
                stock: data.stock, brand: data.brand, gender: data.gender,
                isFeatured: data.isFeatured, isOnSale: data.isOnSale
            });
        } catch (error) {
            alert('Product not found');
            navigate('/admin/products');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...form,
                price: Number(form.price),
                salePrice: form.salePrice ? Number(form.salePrice) : 0,
                stock: Number(form.stock),
                images: form.images.split(',').map(s => s.trim()).filter(Boolean),
                sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
                colors: form.colors.split(',').map(c => { const [name, hex] = c.split(':'); return { name: name?.trim(), hex: hex?.trim() }; }).filter(c => c.name && c.hex)
            };
            if (isEdit) {
                await axios.put(`/api/products/${id}`, payload);
            } else {
                await axios.post('/api/products', payload);
            }
            navigate('/admin/products');
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
                <button onClick={() => navigate('/admin/products')} className="btn btn-outline"><FiArrowLeft /> Back</button>
            </div>

            <form onSubmit={handleSubmit} className="form-card">
                <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>

                <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea className="form-input" rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Price (₹) *</label>
                        <input type="number" className="form-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Sale Price (₹)</label>
                        <input type="number" className="form-input" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Category *</label>
                        <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                            <option value="">Select Category</option>
                            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select className="form-input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                            <option value="Women">Women</option>
                            <option value="Men">Men</option>
                            <option value="Kids">Kids</option>
                            <option value="Unisex">Unisex</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Stock *</label>
                        <input type="number" className="form-input" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Brand</label>
                        <input className="form-input" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Image URLs (comma separated)</label>
                    <input className="form-input" value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" />
                </div>

                <div className="form-group">
                    <label className="form-label">Sizes (comma separated)</label>
                    <input className="form-input" value={form.sizes} onChange={e => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, XL" />
                </div>

                <div className="form-group">
                    <label className="form-label">Colors (name:hex, comma separated)</label>
                    <input className="form-input" value={form.colors} onChange={e => setForm({ ...form, colors: e.target.value })} placeholder="Red:#FF0000, Blue:#0000FF" />
                </div>

                <div className="form-group">
                    <label className="form-label">Options</label>
                    <div className="checkbox-group">
                        <label><input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} /> Featured Product</label>
                        <label><input type="checkbox" checked={form.isOnSale} onChange={e => setForm({ ...form, isOnSale: e.target.checked })} /> On Sale</label>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}><FiSave /> {loading ? 'Saving...' : 'Save Product'}</button>
                    <button type="button" onClick={() => navigate('/admin/products')} className="btn btn-outline">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
