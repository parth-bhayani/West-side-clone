import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPackage, FiChevronRight, FiShoppingBag, FiClock } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './MyOrders.css';

const MyOrders = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const { data } = await axios.get('/api/orders/myorders');
                setOrders(data);
            } catch (err) {
                setError('Failed to fetch orders. Please try again.');
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated, authLoading, navigate]);

    if (authLoading || loading) {
        return (
            <div className="my-orders-page">
                <div className="container">
                    <div className="loader"><div className="spinner"></div></div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-orders-page">
            <div className="container">
                <div className="page-header">
                    <h1>My Orders</h1>
                </div>

                {error && <div className="error-message">{error}</div>}

                {orders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="icon"><FiPackage /></div>
                        <h2>No orders yet</h2>
                        <p>Looks like you haven't placed any orders yet.</p>
                        <Link to="/shop" className="btn btn-primary">
                            <FiShoppingBag /> Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order._id} className="order-card">
                                <div className="order-header">
                                    <div className="order-id-date">
                                        <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                                        <span className="order-date">
                                            <FiClock /> {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="order-status">
                                        <span className={`status-badge ${order.status}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="order-body">
                                    <div className="order-preview-items">
                                        {order.orderItems.slice(0, 4).map((item, index) => (
                                            <div key={index} className="preview-item">
                                                <img
                                                    src={item.image || 'https://via.placeholder.com/70'}
                                                    alt={item.name}
                                                />
                                                {index === 3 && order.orderItems.length > 4 && (
                                                    <div className="more-items">+{order.orderItems.length - 4}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-summary">
                                        <span className="total-amount">₹{order.totalPrice.toLocaleString()}</span>
                                        <Link to={`/order-confirmation/${order._id}`} className="view-details-btn">
                                            View Details <FiChevronRight />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
