import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, isAdmin, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // If already logged in as admin, redirect to dashboard
    useEffect(() => {
        if (isAuthenticated && isAdmin) {
            navigate('/admin');
        }
    }, [isAuthenticated, isAdmin, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            // Check if logged in user is admin
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData?.role === 'admin') {
                navigate('/admin');
            } else {
                // Not an admin - show error and logout
                setError('Access denied. This login is for administrators only.');
                localStorage.removeItem('user');
                window.location.reload();
            }
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-container">
                <div className="admin-login-card">
                    <div className="admin-login-header">
                        <div className="admin-icon">
                            <FiShield />
                        </div>
                        <h1>Admin Login</h1>
                        <p>Sign in to access the admin dashboard</p>
                    </div>

                    {error && <div className="admin-message admin-message-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="admin-login-form">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Admin Email</label>
                            <div className="admin-input-icon">
                                <FiMail />
                                <input
                                    type="email"
                                    className="admin-form-input"
                                    placeholder="Enter admin email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Password</label>
                            <div className="admin-input-icon">
                                <FiLock />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="admin-form-input"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="admin-toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="admin-login-btn" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In to Admin'}
                        </button>
                    </form>

                    {/* <div className="admin-demo-credentials">
                        <p><strong>Admin Credentials:</strong></p>
                        <p>Email: admin@westside.com</p>
                        <p>Password: admin123</p>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
