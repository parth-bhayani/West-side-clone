import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiEdit2, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, updateProfile, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
        }
    });

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: {
                    street: user.address?.street || '',
                    city: user.address?.city || '',
                    state: user.address?.state || '',
                    pincode: user.address?.pincode || '',
                    country: user.address?.country || 'India'
                }
            });
        }
    }, [user, isAuthenticated, loading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        const result = await updateProfile(formData);

        if (result.success) {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false);
            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } else {
            setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
        }
    };

    if (loading) {
        return <div className="loader"><div className="spinner"></div></div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>My Profile</h1>
                    <p>Manage your account settings</p>
                </div>

                <div className="profile-content">
                    <div className="profile-card">
                        {message.text && (
                            <div className={`message-box ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="profile-avatar-section">
                            <div className="avatar-placeholder">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="profile-name">{user?.name}</div>
                            <div className="profile-email">{user?.email}</div>
                        </div>

                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-group">
                                <label><FiUser /> Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><FiMail /> Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing} // Often good to keep email disabled or require verification
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><FiPhone /> Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label><FiMapPin /> Street Address</label>
                                <input
                                    type="text"
                                    name="address.street"
                                    value={formData.address.street}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="form-input"
                                    placeholder="House No., Street Name"
                                />
                            </div>

                            <div className="form-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    name="address.city"
                                    value={formData.address.city}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>State</label>
                                <input
                                    type="text"
                                    name="address.state"
                                    value={formData.address.state}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Pincode</label>
                                <input
                                    type="text"
                                    name="address.pincode"
                                    value={formData.address.pincode}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Country</label>
                                <input
                                    type="text"
                                    name="address.country"
                                    value={formData.address.country}
                                    disabled={true}
                                    className="form-input"
                                />
                            </div>

                            <div className="profile-actions">
                                {isEditing ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                // Reset form
                                                setFormData({
                                                    name: user.name || '',
                                                    email: user.email || '',
                                                    phone: user.phone || '',
                                                    address: {
                                                        street: user.address?.street || '',
                                                        city: user.address?.city || '',
                                                        state: user.address?.state || '',
                                                        pincode: user.address?.pincode || '',
                                                        country: user.address?.country || 'India'
                                                    }
                                                });
                                            }}
                                            className="btn btn-secondary"
                                        >
                                            <FiX /> Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            <FiSave /> Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="btn btn-primary"
                                    >
                                        <FiEdit2 /> Edit Profile
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
