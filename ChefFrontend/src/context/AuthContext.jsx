import React, { createContext, useContext, useState } from 'react';
import { googleLogin as googleLoginApi } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    return token ? { token } : null;
  });

  const login = (token) => {
    localStorage.setItem('token', token);
    setUser({ token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const googleLogin = async (idToken) => {
    try {
      const { token } = await googleLoginApi(idToken);
      login(token);
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token: user?.token || null,
      isLoggedIn: !!user,
      login,
      logout,
      googleLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
