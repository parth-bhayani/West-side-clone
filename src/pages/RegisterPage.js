import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        const result = await register(formData.name, formData.email, formData.password, formData.phone);

        if (result.success) {
            navigate('/');
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
                        <h1>Create Account</h1>
                        <p>Join us for exclusive offers</p>
                    </div>

                    {error && <div className="message message-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div className="input-icon">
                                <FiUser />
                                <input type="text" name="name" className="form-input" placeholder="Enter your name" value={formData.name} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="input-icon">
                                <FiMail />
                                <input type="email" name="email" className="form-input" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Phone Number</label>
                            <div className="input-icon">
                                <FiPhone />
                                <input type="tel" name="phone" className="form-input" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-icon">
                                <FiLock />
                                <input type={showPassword ? 'text' : 'password'} name="password" className="form-input" placeholder="Create password" value={formData.password} onChange={handleChange} required />
                                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <div className="input-icon">
                                <FiLock />
                                <input type={showPassword ? 'text' : 'password'} name="confirmPassword" className="form-input" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} required />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login">Sign In</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
