import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiEye } from 'react-icons/fi';
import './AdminPages.css';

const OrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => { fetchOrders(); }, [page, statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/orders?page=${page}&status=${statusFilter}&limit=10`);
            setOrders(data.orders);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`/api/orders/${id}/status`, { status });
            fetchOrders();
        } catch (error) {
            alert('Error updating status');
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Orders</h1>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input" style={{ width: 'auto' }}>
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {loading ? (
                <div className="loader"><div className="spinner"></div></div>
            ) : (
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td><strong>#{order._id.slice(-6).toUpperCase()}</strong></td>
                                    <td>{order.user?.name}<br /><small>{order.user?.email}</small></td>
                                    <td>{order.orderItems?.length} items</td>
                                    <td>₹{order.totalPrice?.toLocaleString()}</td>
                                    <td>
                                        <select value={order.status} onChange={e => updateStatus(order._id, e.target.value)} className={`status-select ${order.status}`}>
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td><button className="edit-btn"><FiEye /></button></td>
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

export default OrderList;
