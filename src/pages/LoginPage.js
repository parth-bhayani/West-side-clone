import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './AuthPages.css';

const LoginPage = () => {
    // Login method toggle
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'otp'

    // Email login states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Email OTP login states
    const [otpEmail, setOtpEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpStep, setOtpStep] = useState('email'); // 'email' or 'otp'

    // Common states
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    // Email login handler
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData?.role === 'admin') {
                setError('Admin users should use the Admin Login page. Redirecting...');
                localStorage.removeItem('user');
                setTimeout(() => {
                    navigate('/admin/login');
                }, 1500);
            } else {
                navigate(redirect === 'checkout' ? '/checkout' : redirect);
            }
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    // Send OTP via Email
    const handleSendOTP = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!otpEmail || !otpEmail.includes('@')) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.post('/api/auth/send-otp', { email: otpEmail });

            if (data.success) {
                setOtpStep('otp');
                setSuccess('OTP sent to your email! Check your inbox.');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            setError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
        }
        setLoading(false);
    };

    // Verify OTP handler
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.post('/api/auth/verify-otp', { email: otpEmail, otp });

            // Store user data
            localStorage.setItem('user', JSON.stringify(data));
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            setSuccess('Login successful! Redirecting...');
            setTimeout(() => {
                navigate(redirect === 'checkout' ? '/checkout' : redirect);
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setError(error.response?.data?.message || 'Invalid OTP. Please try again.');
        }
        setLoading(false);
    };

    // Reset to email input
    const handleBackToEmail = () => {
        setOtpStep('email');
        setOtp('');
        setError('');
        setSuccess('');
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to continue shopping</p>
                    </div>

                    {/* Login Method Toggle */}
                    <div className="login-method-toggle">
                        <button
                            type="button"
                            className={`toggle-btn ${loginMethod === 'email' ? 'active' : ''}`}
                            onClick={() => {
                                setLoginMethod('email');
                                setError('');
                                setSuccess('');
                            }}
                        >
                            <FiLock /> Password
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${loginMethod === 'otp' ? 'active' : ''}`}
                            onClick={() => {
                                setLoginMethod('otp');
                                setError('');
                                setSuccess('');
                            }}
                        >
                            <FiMail /> Email OTP
                        </button>
                    </div>

                    {error && <div className="message message-error">{error}</div>}
                    {success && <div className="message message-success">{success}</div>}

                    {/* Email + Password Login Form */}
                    {loginMethod === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="auth-form">
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
                    )}

                    {/* Email OTP Login Form */}
                    {loginMethod === 'otp' && (
                        <>
                            {otpStep === 'email' ? (
                                <form onSubmit={handleSendOTP} className="auth-form">
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <div className="input-icon">
                                            <FiMail />
                                            <input
                                                type="email"
                                                className="form-input"
                                                placeholder="Enter your email"
                                                value={otpEmail}
                                                onChange={(e) => setOtpEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <small className="input-hint">We'll send you a one-time password via email</small>
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                                        {loading ? 'Sending OTP...' : 'Send OTP'}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOTP} className="auth-form">
                                    <button type="button" className="back-btn" onClick={handleBackToEmail}>
                                        <FiArrowLeft /> Change Email
                                    </button>

                                    <div className="otp-info">
                                        <p>OTP sent to <strong>{otpEmail}</strong></p>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Enter OTP</label>
                                        <div className="otp-input-container">
                                            <input
                                                type="text"
                                                className="form-input otp-input"
                                                placeholder="Enter 6-digit OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                maxLength={6}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                                        {loading ? 'Verifying...' : 'Verify & Login'}
                                    </button>

                                    <button
                                        type="button"
                                        className="resend-btn"
                                        onClick={handleSendOTP}
                                        disabled={loading}
                                    >
                                        Didn't receive OTP? Resend
                                    </button>
                                </form>
                            )}
                        </>
                    )}

                    <div className="auth-footer">
                        <p>Don't have an account? <Link to="/register">Create Account</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
