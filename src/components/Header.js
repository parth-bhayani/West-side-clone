import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiHeart, FiShoppingBag, FiUser, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate('/');
    };

    const categories = [
        { name: 'Women', path: '/shop?gender=Women', subcategories: ['Dresses', 'Tops', 'Ethnic Wear', 'Jeans', 'Accessories'] },
        { name: 'Men', path: '/shop?gender=Men', subcategories: ['Shirts', 'T-Shirts', 'Trousers', 'Blazers', 'Accessories'] },
        { name: 'Kids', path: '/shop?gender=Kids', subcategories: ['Girls', 'Boys', 'Infants'] },
        { name: 'Sale', path: '/shop?sale=true', subcategories: [] }
    ];

    return (
        <header className="header">
            {/* Top Bar */}
            <div className="header-top">
                <div className="container">
                    <div className="header-top-content">
                        <span>Free Shipping on orders above ₹999</span>
                        <div className="header-top-links">
                            <Link to="/about">About Us</Link>
                            <Link to="/contact">Contact</Link>
                            <Link to="/stores">Store Locator</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="header-main">
                <div className="container">
                    <div className="header-content">
                        {/* Mobile Menu Toggle */}
                        <button
                            className="mobile-menu-toggle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <FiX /> : <FiMenu />}
                        </button>

                        {/* Logo */}
                        <Link to="/" className="logo">
                            <span className="logo-text">WESTSIDE</span>
                        </Link>

                        {/* Navigation */}
                        <nav className={`nav ${mobileMenuOpen ? 'nav-open' : ''}`}>
                            <ul className="nav-list">
                                {categories.map((cat) => (
                                    <li key={cat.name} className="nav-item">
                                        <Link to={cat.path} className="nav-link">
                                            {cat.name}
                                            {cat.subcategories.length > 0 && <FiChevronDown />}
                                        </Link>
                                        {cat.subcategories.length > 0 && (
                                            <ul className="dropdown">
                                                {cat.subcategories.map((sub) => (
                                                    <li key={sub}>
                                                        <Link to={`/shop?gender=${cat.name}&subcategory=${sub}`}>
                                                            {sub}
                                                        </Link>
                                                    </li>
                                                ))}
                                                <li className="dropdown-view-all">
                                                    <Link to={cat.path}>View All {cat.name}</Link>
                                                </li>
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* Header Actions */}
                        <div className="header-actions">
                            {/* Search */}
                            <div className={`search-container ${searchOpen ? 'search-open' : ''}`}>
                                <button
                                    className="header-action-btn"
                                    onClick={() => setSearchOpen(!searchOpen)}
                                >
                                    <FiSearch />
                                </button>
                                {searchOpen && (
                                    <form className="search-form" onSubmit={handleSearch}>
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                        <button type="submit">
                                            <FiSearch />
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Wishlist */}
                            <Link to="/wishlist" className="header-action-btn">
                                <FiHeart />
                            </Link>

                            {/* Cart */}
                            <Link to="/cart" className="header-action-btn cart-btn">
                                <FiShoppingBag />
                                {cart.totalItems > 0 && (
                                    <span className="cart-count">{cart.totalItems}</span>
                                )}
                            </Link>

                            {/* User */}
                            <div className="user-menu-container">
                                <button
                                    className="header-action-btn"
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                >
                                    <FiUser />
                                </button>
                                {userMenuOpen && (
                                    <div className="user-menu">
                                        {isAuthenticated ? (
                                            <>
                                                <div className="user-menu-header">
                                                    <p>Hello, {user?.name}</p>
                                                </div>
                                                <Link to="/profile" onClick={() => setUserMenuOpen(false)}>
                                                    My Profile
                                                </Link>
                                                <Link to="/orders" onClick={() => setUserMenuOpen(false)}>
                                                    My Orders
                                                </Link>
                                                <Link to="/wishlist" onClick={() => setUserMenuOpen(false)}>
                                                    Wishlist
                                                </Link>
                                                {isAdmin && (
                                                    <Link to="/admin" onClick={() => setUserMenuOpen(false)}>
                                                        Admin Dashboard
                                                    </Link>
                                                )}
                                                <button onClick={handleLogout} className="logout-btn">
                                                    Logout
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <Link to="/login" onClick={() => setUserMenuOpen(false)}>
                                                    Sign In
                                                </Link>
                                                <Link to="/register" onClick={() => setUserMenuOpen(false)}>
                                                    Create Account
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
