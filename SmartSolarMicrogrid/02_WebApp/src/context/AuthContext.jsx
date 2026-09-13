import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on page refresh
    const savedToken = localStorage.getItem('smartsolar_token');
    const savedUser = localStorage.getItem('smartsolar_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('smartsolar_token');
        localStorage.removeItem('smartsolar_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authApi.login({ username, password });
      const data = response.data;

      const userProfile = {
        nic: data.nic,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        status: data.status,
        phone: data.phone,
        address: data.address,
        solarCapacityKWh: data.solarCapacityKWh,
      };

      setToken(data.token);
      setUser(userProfile);

      localStorage.setItem('smartsolar_token', data.token);
      localStorage.setItem('smartsolar_user', JSON.stringify(userProfile));

      return { success: true, data: userProfile };
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartsolar_token');
    localStorage.removeItem('smartsolar_user');
  };

  const isBackoffice = user?.role?.toLowerCase() === 'backoffice';
  const isGridOperator = user?.role?.toLowerCase() === 'gridoperator';
  const isProsumer = user?.role?.toLowerCase() === 'prosumer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!token,
        isBackoffice,
        isGridOperator,
        isProsumer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
