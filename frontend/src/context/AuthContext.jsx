import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Student Session State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lwr_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.token && parsed.role === 'ROLE_STUDENT') return parsed;
      } catch (e) {
        localStorage.removeItem('lwr_user');
      }
    }
    return null;
  });

  // Admin Session State
  const [adminUser, setAdminUser] = useState(() => {
    const savedAdmin = localStorage.getItem('lwr_admin_user');
    if (savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin);
        if (parsed && parsed.token && parsed.role === 'ROLE_ADMIN') return parsed;
      } catch (e) {
        localStorage.removeItem('lwr_admin_user');
      }
    }
    return null;
  });

  const [savedResources, setSavedResources] = useState(() => {
    const saved = localStorage.getItem('lwr_saved_resources');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync Student user to localStorage
  useEffect(() => {
    if (user && user.token) {
      localStorage.setItem('lwr_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lwr_user');
    }
  }, [user]);

  // Sync Admin user to localStorage
  useEffect(() => {
    if (adminUser && adminUser.token) {
      localStorage.setItem('lwr_admin_user', JSON.stringify(adminUser));
    } else {
      localStorage.removeItem('lwr_admin_user');
    }
  }, [adminUser]);

  useEffect(() => {
    localStorage.setItem('lwr_saved_resources', JSON.stringify(savedResources));
  }, [savedResources]);

  // Student Login Function (Step 1: Credentials check)
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const authenticatedUser = {
          token: data.token,
          id: data.userId,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          accountStatus: 'ACTIVE',
          emailVerified: true,
          mobileVerified: true,
          profileCompleted: true
        };
        setUser(authenticatedUser);
        return { success: true, role: data.role, user: authenticatedUser };
      }

      if (response.ok && data.requiresLoginOtp) {
        return {
          requiresLoginOtp: true,
          userId: data.userId,
          email: data.email,
          maskedEmail: data.maskedEmail,
          message: data.message
        };
      }

      if (response.status === 403 && data.nextStep) {
        return {
          success: false,
          requiresOnboarding: true,
          nextStep: data.nextStep,
          userId: data.userId,
          email: data.email,
          mobileNumber: data.mobileNumber,
          message: data.message || 'Verification required before proceeding.'
        };
      }

      return {
        success: false,
        error: data.error || data.message || 'Invalid email or password.'
      };
    } catch (e) {
      return {
        success: false,
        error: 'Unable to connect to backend server. Please try again.'
      };
    }
  };

  // Student Verify Login OTP (Step 2: OTP verification)
  const verifyLoginOtp = async (userId, otp) => {
    try {
      const response = await fetch('/api/auth/verify-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId.toString(), otp })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const authenticatedUser = {
          token: data.token,
          id: data.userId,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          accountStatus: 'ACTIVE',
          emailVerified: true,
          mobileVerified: true,
          profileCompleted: true
        };
        setUser(authenticatedUser);
        return { success: true, role: data.role, user: authenticatedUser };
      }

      return {
        success: false,
        error: data.error || 'Invalid verification code.'
      };
    } catch (e) {
      return {
        success: false,
        error: 'Unable to verify login OTP. Please try again.'
      };
    }
  };

  // Resend Login OTP
  const sendLoginOtp = async (userId) => {
    try {
      const response = await fetch('/api/auth/send-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      if (response.ok) {
        return { success: true, message: data.message, maskedEmail: data.maskedEmail };
      }
      return { success: false, error: data.error || 'Unable to resend login code.' };
    } catch (e) {
      return { success: false, error: 'Unable to send login OTP code.' };
    }
  };

  // Dedicated Admin Login Function
  const adminLogin = async (email, password) => {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.token && data.role === 'ROLE_ADMIN') {
        const authenticatedAdmin = {
          token: data.token,
          id: data.userId,
          email: data.email,
          fullName: data.fullName,
          role: 'ROLE_ADMIN',
          accountStatus: 'ACTIVE'
        };
        setAdminUser(authenticatedAdmin);
        return { success: true, role: 'ROLE_ADMIN', admin: authenticatedAdmin };
      }

      if (response.status === 403) {
        return {
          success: false,
          error: data.error || 'Admin access required. Student accounts cannot log in here.'
        };
      }

      return {
        success: false,
        error: data.error || data.message || 'Invalid admin credentials.'
      };
    } catch (e) {
      return {
        success: false,
        error: 'Unable to connect to backend server. Please try again.'
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lwr_user');
  };

  const adminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('lwr_admin_user');
  };

  const toggleSaveResource = (resource) => {
    setSavedResources((prev) => {
      const exists = prev.some((item) => item.id === resource.id && item.type === resource.type);
      if (exists) {
        return prev.filter((item) => !(item.id === resource.id && item.type === resource.type));
      } else {
        return [...prev, resource];
      }
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      adminUser, 
      setAdminUser, 
      login, 
      verifyLoginOtp,
      sendLoginOtp,
      adminLogin, 
      logout, 
      adminLogout, 
      savedResources, 
      toggleSaveResource 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
