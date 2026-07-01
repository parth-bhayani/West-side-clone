import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import './AuthPages.css';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState('email'); // 'email', 'otp', 'success'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [devOtp, setDevOtp] = useState('');

    const navigate = useNavigate();

    // Step 1: Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.post('/api/auth/forgot-password', { email });

            if (data.success) {
                setStep('otp');
                setSuccess(data.message);
                if (data.devOtp) setDevOtp(data.devOtp);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
        }
        setLoading(false);
    };

    // Step 2: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            setLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const { data } = await axios.post('/api/auth/reset-password', {
                email,
                otp,
                newPassword
            });

            if (data.success) {
                setStep('success');
                setSuccess(data.message);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
        }
        setLoading(false);
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const { data } = await axios.post('/api/auth/forgot-password', { email });
            if (data.success) {
                setSuccess(data.message);
                setOtp('');
                if (data.devOtp) setDevOtp(data.devOtp);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to resend OTP.');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    {/* Success State */}
                    {step === 'success' ? (
                        <>
                            <div className="auth-header">
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '50%',
                                    background: '#d4edda', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.5rem', color: '#28a745'
                                }}>
                                    <FiCheck />
                                </div>
                                <h1>Password Reset!</h1>
                                <p>Your password has been reset successfully. Redirecting to login...</p>
                            </div>
                            <Link to="/login" className="btn btn-primary btn-block btn-lg" style={{ textAlign: 'center', display: 'block' }}>
                                Go to Login
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="auth-header">
                                <h1>{step === 'email' ? 'Forgot Password?' : 'Reset Password'}</h1>
                                <p>{step === 'email'
                                    ? 'Enter your email to receive a reset OTP'
                                    : `Enter the OTP sent to ${email}`
                                }</p>
                            </div>

                            {error && <div className="message message-error">{error}</div>}
                            {success && <div className="message message-success">{success}</div>}

                            {/* Step 1: Email Input */}
                            {step === 'email' && (
                                <form onSubmit={handleSendOTP} className="auth-form">
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <div className="input-icon">
                                            <FiMail />
                                            <input
                                                type="email"
                                                className="form-input"
                                                placeholder="Enter your registered email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                                        {loading ? 'Sending OTP...' : 'Send Reset OTP'}
                                    </button>
                                </form>
                            )}

                            {/* Step 2: OTP + New Password */}
                            {step === 'otp' && (
                                <form onSubmit={handleResetPassword} className="auth-form">
                                    <button type="button" className="back-btn" onClick={() => { setStep('email'); setError(''); setSuccess(''); }}>
                                        <FiArrowLeft /> Change Email
                                    </button>

                                    <div className="otp-info">
                                        <p>OTP sent to <strong>{email}</strong></p>
                                        {devOtp && (
                                            <div className="dev-otp">
                                                <p>🔧 Dev Mode OTP: <span className="otp-code">{devOtp}</span></p>
                                            </div>
                                        )}
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

                                    <div className="form-group">
                                        <label className="form-label">New Password</label>
                                        <div className="input-icon">
                                            <FiLock />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                className="form-input"
                                                placeholder="Enter new password (min 6 chars)"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                required
                                                minLength={6}
                                            />
                                            <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Confirm Password</label>
                                        <div className="input-icon">
                                            <FiLock />
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                className="form-input"
                                                placeholder="Confirm new password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                minLength={6}
                                            />
                                            <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>

                                    <button type="button" className="resend-btn" onClick={handleResendOTP} disabled={loading}>
                                        Didn't receive OTP? Resend
                                    </button>
                                </form>
                            )}

                            <div className="auth-footer">
                                <p>Remember your password? <Link to="/login">Sign In</Link></p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
