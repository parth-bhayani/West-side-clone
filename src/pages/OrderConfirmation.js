import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiMapPin, FiCreditCard, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(`/api/orders/${id}`);
                setOrder(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load order details');
            }
            setLoading(false);
        };

        fetchOrder();
    }, [id, isAuthenticated, navigate]);

    if (loading) {
        return (
            <div className="order-confirmation">
                <div className="container">
                    <div className="loading-state">Loading order details...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-confirmation">
                <div className="container">
                    <div className="error-state">
                        <p>{error}</p>
                        <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="order-confirmation">
            <div className="container">
                <div className="confirmation-header">
                    <div className="success-icon">
                        <FiCheckCircle />
                    </div>
                    <h1>Order Confirmed!</h1>
                    <p>Thank you for your order. Your order has been placed successfully.</p>
                    <p className="order-id">Order ID: <strong>{order._id}</strong></p>
                </div>

                <div className="confirmation-content">
                    {/* Order Items */}
                    <div className="confirmation-section">
                        <h2><FiPackage /> Order Items</h2>
                        <div className="order-items">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="order-item">
                                    <img
                                        src={item.image || 'https://via.placeholder.com/80'}
                                        alt={item.name}
                                    />
                                    <div className="item-info">
                                        <p className="item-name">{item.name}</p>
                                        <p className="item-details">
                                            {item.size && `Size: ${item.size}`}
                                            {item.size && item.color && ' | '}
                                            {item.color && `Color: ${item.color}`}
                                        </p>
                                        <p className="item-qty">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="item-price">₹{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="confirmation-section">
                        <h2><FiMapPin /> Shipping Address</h2>
                        <div className="address-box">
                            <p className="name">{order.shippingAddress.name}</p>
                            <p>{order.shippingAddress.street}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                            <p>Phone: {order.shippingAddress.phone}</p>
                        </div>
                    </div>

                    {/* Payment & Summary */}
                    <div className="confirmation-section">
                        <h2><FiCreditCard /> Payment Summary</h2>
                        <div className="payment-summary">
                            <div className="summary-row">
                                <span>Payment Method</span>
                                <span className="payment-method">
                                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                </span>
                            </div>
                            <div className="summary-row">
                                <span>Items Total</span>
                                <span>₹{order.itemsPrice.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className={order.shippingPrice === 0 ? 'free' : ''}>
                                    {order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}
                                </span>
                            </div>
                            <div className="summary-row total">
                                <span>Total Amount</span>
                                <span>₹{order.totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Status */}
                    <div className="order-status-section">
                        <div className="status-badge pending">
                            Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                        <p className="status-message">
                            We'll send you an email when your order ships.
                        </p>
                    </div>
                </div>

                <div className="confirmation-actions">
                    <Link to="/shop" className="btn btn-primary">
                        <FiShoppingBag /> Continue Shopping
                    </Link>
                    <Link to="/" className="btn btn-outline">
                        <FiArrowLeft /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
