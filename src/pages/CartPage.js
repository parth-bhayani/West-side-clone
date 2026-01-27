import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CartPage.css';

const CartPage = () => {
    const { cart, updateQuantity, removeFromCart, loading } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/login?redirect=checkout');
        } else {
            navigate('/checkout');
        }
    };

    const shippingPrice = cart.totalPrice >= 999 ? 0 : 99;
    const taxPrice = Math.round(cart.totalPrice * 0.18);
    const totalPrice = cart.totalPrice + shippingPrice;

    if (cart.items.length === 0) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="empty-cart">
                        <FiShoppingBag className="empty-icon" />
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything to your cart yet.</p>
                        <Link to="/shop" className="btn btn-primary">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <div className="cart-header">
                    <h1>Shopping Cart</h1>
                    <p>{cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'}</p>
                </div>

                <div className="cart-content">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {cart.items.map((item) => {
                            const product = item.product;
                            const price = product.isOnSale && product.salePrice > 0
                                ? product.salePrice
                                : product.price;

                            return (
                                <div key={item._id} className="cart-item">
                                    <Link to={`/product/${product._id}`} className="item-image">
                                        <img
                                            src={product.images?.[0] || 'https://via.placeholder.com/150'}
                                            alt={product.name}
                                        />
                                    </Link>

                                    <div className="item-details">
                                        <Link to={`/product/${product._id}`} className="item-name">
                                            {product.name}
                                        </Link>
                                        <p className="item-brand">{product.brand}</p>

                                        {(item.size || item.color) && (
                                            <div className="item-options">
                                                {item.size && <span>Size: {item.size}</span>}
                                                {item.color && <span>Color: {item.color}</span>}
                                            </div>
                                        )}

                                        <div className="item-price">
                                            <span className="price">₹{price.toLocaleString()}</span>
                                            {product.isOnSale && product.salePrice > 0 && (
                                                <span className="original-price">
                                                    ₹{product.price.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="item-actions">
                                        <div className="quantity-control">
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || loading}
                                            >
                                                <FiMinus />
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                disabled={item.quantity >= product.stock || loading}
                                            >
                                                <FiPlus />
                                            </button>
                                        </div>

                                        <div className="item-total">
                                            ₹{(price * item.quantity).toLocaleString()}
                                        </div>

                                        <button
                                            className="remove-btn"
                                            onClick={() => removeFromCart(item._id)}
                                            disabled={loading}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="cart-summary">
                        <h3>Order Summary</h3>

                        <div className="summary-row">
                            <span>Subtotal ({cart.totalItems} items)</span>
                            <span>₹{cart.totalPrice.toLocaleString()}</span>
                        </div>

                        <div className="summary-row">
                            <span>Shipping</span>
                            <span className={shippingPrice === 0 ? 'free-shipping' : ''}>
                                {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                            </span>
                        </div>

                        {shippingPrice > 0 && (
                            <p className="shipping-note">
                                Add ₹{(999 - cart.totalPrice).toLocaleString()} more for free shipping
                            </p>
                        )}

                        <div className="summary-row total">
                            <span>Total</span>
                            <span>₹{totalPrice.toLocaleString()}</span>
                        </div>

                        <p className="tax-note">Inclusive of all taxes</p>

                        <button
                            className="btn btn-primary btn-block btn-lg"
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout
                        </button>

                        <Link to="/shop" className="continue-shopping">
                            <FiArrowLeft />
                            Continue Shopping
                        </Link>

                        {/* Promo Code */}
                        <div className="promo-section">
                            <h4>Have a promo code?</h4>
                            <div className="promo-input">
                                <input type="text" placeholder="Enter code" />
                                <button className="btn btn-outline">Apply</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
