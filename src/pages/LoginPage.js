import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            // Check if logged in user is admin - redirect them to admin login
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData?.role === 'admin') {
                // Admin users should use the admin login page
                setError('Admin users should use the Admin Login page. Redirecting...');
                localStorage.removeItem('user');
                setTimeout(() => {
                    navigate('/admin/login');
                }, 1500);
            } else {
                // Regular user - redirect to intended page or home
                navigate(redirect === 'checkout' ? '/checkout' : redirect);
            }
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to continue shopping</p>
                    </div>

                    {error && <div className="message message-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="input-icon">
                                <FiMail />
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-icon">
                                <FiLock />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input type="checkbox" /> Remember me
                            </label>
                            <Link to="/forgot-password" className="forgot-link">
                                Forgot Password?
                            </Link>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Don't have an account? <Link to="/register">Create Account</Link></p>
                    </div>

                    {/* <div className="demo-credentials">
                        <p><strong>Demo User Credentials:</strong></p>
                        <p>Email: john@example.com / Password: password123</p>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
