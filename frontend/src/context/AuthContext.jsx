import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/check', {
        withCredentials: true,
      });
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await axios.post('/api/auth/login', credentials, {
      withCredentials: true,
    });
    setUser(response.data.user);
    return response.data;
  };

  const signup = async (userData) => {
    const response = await axios.post('/api/auth/signup', userData, {
      withCredentials: true,
    });
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await axios.post('/api/auth/logout', {}, {
      withCredentials: true,
    });
    setUser(null);
  };

  const updateProfile = async (userData) => {
    const response = await axios.put('/api/auth/update-profile', userData, {
      withCredentials: true,
    });
    setUser(response.data.user);
    return response.data;
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};