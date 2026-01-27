import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import './AdminPages.css';

const CategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', image: '' });

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`/api/categories/${editingId}`, form);
            } else {
                await axios.post('/api/categories', form);
            }
            fetchCategories();
            resetForm();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving category');
        }
    };

    const handleEdit = (category) => {
        setForm({ name: category.name, description: category.description || '', image: category.image || '' });
        setEditingId(category._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this category?')) {
            try {
                await axios.delete(`/api/categories/${id}`);
                fetchCategories();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting category');
            }
        }
    };

    const resetForm = () => {
        setForm({ name: '', description: '', image: '' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Categories</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    {showForm ? <><FiX /> Cancel</> : <><FiPlus /> Add Category</>}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="form-card" style={{ marginBottom: '1.5rem' }}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Category Name *</label>
                            <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Image URL</label>
                            <input className="form-input" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-input" rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary"><FiSave /> {editingId ? 'Update' : 'Create'} Category</button>
                        <button type="button" onClick={resetForm} className="btn btn-outline">Cancel</button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="loader"><div className="spinner"></div></div>
            ) : (
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Products</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(category => (
                                <tr key={category._id}>
                                    <td><img src={category.image || 'https://via.placeholder.com/50'} alt="" className="table-img" /></td>
                                    <td><strong>{category.name}</strong></td>
                                    <td>{category.description || '-'}</td>
                                    <td>{category.productCount || 0}</td>
                                    <td className="actions">
                                        <button onClick={() => handleEdit(category)} className="edit-btn"><FiEdit2 /></button>
                                        <button onClick={() => handleDelete(category._id)} className="delete-btn"><FiTrash2 /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CategoryList;
