import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import './AdminPages.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => { fetchProducts(); }, [page, search]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/products?page=${page}&search=${search}&limit=10`);
            setProducts(data.products);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this product?')) {
            try {
                await axios.delete(`/api/products/${id}`);
                fetchProducts();
            } catch (error) {
                alert('Error deleting product');
            }
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Products</h1>
                <Link to="/admin/products/new" className="btn btn-primary"><FiPlus /> Add Product</Link>
            </div>

            <div className="search-bar">
                <FiSearch />
                <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {loading ? (
                <div className="loader"><div className="spinner"></div></div>
            ) : (
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td><img src={product.images?.[0] || 'https://via.placeholder.com/50'} alt="" className="table-img" /></td>
                                    <td><strong>{product.name}</strong><br /><small>{product.brand}</small></td>
                                    <td>{product.category?.name}</td>
                                    <td>₹{product.price?.toLocaleString()}{product.isOnSale && <span className="sale-price"><br />₹{product.salePrice?.toLocaleString()}</span>}</td>
                                    <td className={product.stock < 10 ? 'low-stock' : ''}>{product.stock}</td>
                                    <td>{product.isFeatured && <span className="badge-sm featured">Featured</span>}{product.isOnSale && <span className="badge-sm sale">Sale</span>}</td>
                                    <td className="actions">
                                        <Link to={`/admin/products/${product._id}`} className="edit-btn"><FiEdit2 /></Link>
                                        <button onClick={() => handleDelete(product._id)} className="delete-btn"><FiTrash2 /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
                </div>
            )}
        </div>
    );
};

export default ProductList;
