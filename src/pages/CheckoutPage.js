import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiPhone, FiUser, FiCreditCard, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const { cart, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        phone: user?.phone || '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        paymentMethod: 'cod'
    });

    // Redirect if not authenticated
    if (!isAuthenticated) {
        navigate('/login?redirect=checkout');
        return null;
    }

    // Redirect if cart is empty
    if (cart.items.length === 0) {
        navigate('/cart');
        return null;
    }

    const shippingPrice = cart.totalPrice >= 999 ? 0 : 99;
    const taxPrice = Math.round(cart.totalPrice * 0.18);
    const totalPrice = cart.totalPrice + shippingPrice;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const orderData = {
                orderItems: cart.items.map(item => ({
                    product: item.product._id,
                    name: item.product.name,
                    image: item.product.images?.[0] || '',
                    price: item.product.isOnSale && item.product.salePrice > 0
                        ? item.product.salePrice
                        : item.product.price,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color
                })),
                shippingAddress: {
                    name: formData.fullName,
                    phone: formData.phone,
                    street: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    country: 'India'
                },
                paymentMethod: formData.paymentMethod,
                itemsPrice: cart.totalPrice,
                taxPrice: taxPrice,
                shippingPrice: shippingPrice,
                totalPrice: totalPrice
            };

            const { data } = await axios.post('/api/orders', orderData);

            // Clear cart after successful order
            if (clearCart) {
                clearCart();
            }

            // Navigate to order confirmation page
            navigate(`/order-confirmation/${data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="checkout-page">
            <div className="container">
                <h1 className="checkout-title">Checkout</h1>

                {error && <div className="checkout-error">{error}</div>}

                <div className="checkout-content">
                    {/* Shipping Form */}
                    <div className="checkout-form-section">
                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <h2><FiMapPin /> Shipping Address</h2>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <div className="input-icon">
                                            <FiUser />
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                placeholder="Enter full name"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <div className="input-icon">
                                            <FiPhone />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Enter phone number"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter your full address"
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            placeholder="City"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>State</label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            placeholder="State"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Pincode</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            placeholder="Pincode"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h2><FiCreditCard /> Payment Method</h2>

                                <div className="payment-options">
                                    <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={handleChange}
                                        />
                                        <span className="option-content">
                                            <span className="option-title">Cash on Delivery</span>
                                            <span className="option-desc">Pay when you receive your order</span>
                                        </span>
                                        {formData.paymentMethod === 'cod' && <FiCheck className="check-icon" />}
                                    </label>

                                    <label className={`payment-option ${formData.paymentMethod === 'online' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="online"
                                            checked={formData.paymentMethod === 'online'}
                                            onChange={handleChange}
                                        />
                                        <span className="option-content">
                                            <span className="option-title">Online Payment</span>
                                            <span className="option-desc">Pay with UPI, Card, or Net Banking</span>
                                        </span>
                                        {formData.paymentMethod === 'online' && <FiCheck className="check-icon" />}
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block btn-lg place-order-btn"
                                disabled={loading}
                            >
                                {loading ? 'Placing Order...' : `Place Order - ₹${totalPrice.toLocaleString()}`}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="checkout-summary">
                        <h2>Order Summary</h2>

                        <div className="summary-items">
                            {cart.items.map((item) => {
                                const product = item.product;
                                const price = product.isOnSale && product.salePrice > 0
                                    ? product.salePrice
                                    : product.price;

                                return (
                                    <div key={item._id} className="summary-item">
                                        <img
                                            src={product.images?.[0] || 'https://via.placeholder.com/60'}
                                            alt={product.name}
                                        />
                                        <div className="item-info">
                                            <p className="item-name">{product.name}</p>
                                            <p className="item-details">
                                                {item.size && `Size: ${item.size}`}
                                                {item.size && item.color && ' | '}
                                                {item.color && `Color: ${item.color}`}
                                            </p>
                                            <p className="item-qty">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="item-price">₹{(price * item.quantity).toLocaleString()}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Subtotal ({cart.totalItems} items)</span>
                                <span>₹{cart.totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className={shippingPrice === 0 ? 'free' : ''}>
                                    {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                                </span>
                            </div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₹{totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
