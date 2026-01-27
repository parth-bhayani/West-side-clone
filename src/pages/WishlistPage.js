import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiHeart, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './WishlistPage.css';

const WishlistPage = () => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchWishlist = async () => {
            try {
                const { data } = await axios.get('/api/wishlist');
                setWishlist(data || []);
            } catch (error) {
                console.error('Error fetching wishlist:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchWishlist();
        }
    }, [isAuthenticated, authLoading, navigate]);

    const removeFromWishlist = async (id) => {
        try {
            await axios.delete(`/api/wishlist/${id}`);
            setWishlist(prev => prev.filter(item => item._id !== id));
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    if (authLoading || loading) {
        return <div className="loader"><div className="spinner"></div></div>;
    }

    return (
        <div className="wishlist-page">
            <div className="container">
                <div className="wishlist-header">
                    <h1>My Wishlist</h1>
                    <p>{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
                </div>

                {wishlist.length === 0 ? (
                    <div className="empty-wishlist">
                        <div className="empty-icon"><FiHeart /></div>
                        <h2>Your wishlist is empty</h2>
                        <p>Save items you love to your wishlist. Review them anytime and easily move them to the bag.</p>
                        <Link to="/shop" className="btn btn-primary btn-lg">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="wishlist-grid">
                        {wishlist.map(product => (
                            <div key={product._id} className="wishlist-item">
                                <Link to={`/product/${product._id}`} className="wishlist-image">
                                    <img src={product.images[0]} alt={product.name} />
                                </Link>
                                <button
                                    className="remove-btn"
                                    onClick={() => removeFromWishlist(product._id)}
                                    title="Remove from wishlist"
                                >
                                    <FiTrash2 />
                                </button>
                                <div className="wishlist-content">
                                    <Link to={`/product/${product._id}`}>
                                        <h3>{product.name}</h3>
                                    </Link>
                                    <div className="wishlist-price">₹{product.price}</div>
                                    <div className="wishlist-actions">
                                        <Link to={`/product/${product._id}`} className="btn btn-primary btn-block">
                                            <FiShoppingBag /> View Product
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

export default WishlistPage;
