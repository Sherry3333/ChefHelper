import React, { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosInstance';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/user/profile');
        setUser(res.data);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;
  if (!user) return null;

  return (
    <div className="profile-page-container">
      <h2>Profile</h2>
      <div><b>Email:</b> {user.email}</div>
      {user.username && <div><b>Username:</b> {user.username}</div>}
      {/* more fields */}
    </div>
  );
} 