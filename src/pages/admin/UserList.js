import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './AdminPages.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => { fetchUsers(); }, [page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/admin/users?page=${page}&limit=10`);
            setUsers(data.users);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this user?')) {
            try {
                await axios.delete(`/api/admin/users/${id}`);
                fetchUsers();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting user');
            }
        }
    };

    const handleRoleChange = async (id, role) => {
        try {
            await axios.put(`/api/admin/users/${id}`, { role });
            fetchUsers();
        } catch (error) {
            alert('Error updating user');
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Users</h1>
            </div>

            {loading ? (
                <div className="loader"><div className="spinner"></div></div>
            ) : (
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td><strong>{user.name}</strong></td>
                                    <td>{user.email}</td>
                                    <td>
                                        <select
                                            value={user.role}
                                            onChange={e => handleRoleChange(user._id, e.target.value)}
                                            className={`role-select ${user.role}`}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="actions">
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="delete-btn"
                                            disabled={user.role === 'admin'}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="pagination">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
                </div>
            )}
        </div>
    );
};

export default UserList;
