import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FiGrid, FiBox, FiShoppingCart, FiUsers, FiTag, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/admin/login');
        }
    }, [isAdmin, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { path: '/admin', icon: <FiGrid />, label: 'Dashboard', exact: true },
        { path: '/admin/products', icon: <FiBox />, label: 'Products' },
        { path: '/admin/orders', icon: <FiShoppingCart />, label: 'Orders' },
        { path: '/admin/users', icon: <FiUsers />, label: 'Users' },
        { path: '/admin/categories', icon: <FiTag />, label: 'Categories' },
    ];

    const isActive = (path, exact) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    if (!isAdmin) return null;

    return (
        <div className="admin-layout">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>

            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Link to="/" className="admin-logo">WESTSIDE</Link>
                    <span className="admin-badge">Admin</span>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-user">
                        <div className="user-avatar">{user?.name?.charAt(0)}</div>
                        <div className="user-info">
                            <p className="user-name">{user?.name}</p>
                            <p className="user-email">{user?.email}</p>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut /> Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
