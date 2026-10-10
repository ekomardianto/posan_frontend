import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredUserSession,
  setStoredUserSession,
  getAuthToken,
  loginWithEmail as authLoginWithEmail,
  logoutUser,
  fetchCurrentUser,
} from '../services/authService.js';
import { defaultAdminProfile } from '../constants/appConstants.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const defaultMerchantState = {
    id: 'posan-cafe-main',
    name: 'POSAN Cafe',
    address: defaultAdminProfile.fullLocation || 'Dumai, Riau',
    phone: defaultAdminProfile.phone || '081234567890',
    operational_hours: '08:00 - 22:00 WIB (Senin - Minggu)',
  };

  const [user, setUser] = useState(() => getStoredUserSession());
  const [merchant, setMerchant] = useState(() => {
    const stored = getStoredUserSession();
    if (stored?.merchant) {
      return {
        id: stored.merchant.id || stored.merchantId || 1,
        name: stored.merchant.name || stored.branch || 'POSAN Cafe',
        address: stored.merchant.address || defaultAdminProfile.fullLocation,
        phone: stored.merchant.phone || defaultAdminProfile.phone,
        operational_hours: stored.merchant.operational_hours || '08:00 - 22:00 WIB (Senin - Minggu)',
      };
    }
    return defaultMerchantState;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const token = getAuthToken();
      const stored = getStoredUserSession();

      if (token) {
        if (stored && isMounted) {
          setUser(stored);
          if (stored.merchant) {
            setMerchant({
              id: stored.merchant.id || stored.merchantId || 1,
              name: stored.merchant.name || stored.branch || 'POSAN Cafe',
              address: stored.merchant.address || defaultAdminProfile.fullLocation,
              phone: stored.merchant.phone || defaultAdminProfile.phone,
              operational_hours: stored.merchant.operational_hours || '08:00 - 22:00 WIB (Senin - Minggu)',
            });
          }
        }

        try {
          const freshUser = await fetchCurrentUser();
          if (freshUser && isMounted) {
            setUser(freshUser);
            if (freshUser.merchant) {
              setMerchant({
                id: freshUser.merchant.id || freshUser.merchantId || 1,
                name: freshUser.merchant.name || freshUser.branch || 'POSAN Cafe',
                address: freshUser.merchant.address || defaultAdminProfile.fullLocation,
                phone: freshUser.merchant.phone || defaultAdminProfile.phone,
                operational_hours: freshUser.merchant.operational_hours || '08:00 - 22:00 WIB (Senin - Minggu)',
              });
            }
          } else if (!freshUser && !stored && isMounted) {
            setUser(null);
            setMerchant(defaultMerchantState);
          }
        } catch (err) {
          console.warn('Init auth error:', err);
        }
      } else {
        if (isMounted) {
          setUser(null);
          setMerchant(defaultMerchantState);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password, remember = true) => {
    setStoredUserSession(null);
    const res = await authLoginWithEmail(email, password, remember);
    if (res.success && res.user) {
      setUser(res.user);
      if (res.user.merchant) {
        setMerchant({
          id: res.user.merchant.id || res.user.merchantId || 1,
          name: res.user.merchant.name || res.user.branch || 'POSAN Cafe',
          address: res.user.merchant.address || defaultAdminProfile.fullLocation,
          phone: res.user.merchant.phone || defaultAdminProfile.phone,
          operational_hours: res.user.merchant.operational_hours || '08:00 - 22:00 WIB (Senin - Minggu)',
        });
      }
    }
    return res;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setMerchant(defaultMerchantState);
  };

  const updateUser = (newData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newData };
      setStoredUserSession(updated);
      return updated;
    });
  };

  const updateMerchant = (newMerchantData) => {
    setMerchant((prev) => ({ ...prev, ...newMerchantData }));
    if (newMerchantData.name) {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, branch: newMerchantData.name };
        setStoredUserSession(updated);
        return updated;
      });
    }
    return { success: true, data: newMerchantData };
  };

  const rawRole = (user?.rawRole || user?.role || '').toLowerCase();
  const isSuperAdmin = rawRole === 'super_admin' || rawRole === 'superadmin';
  const isAdmin = rawRole === 'admin';
  const isCashier = rawRole === 'kasir' || rawRole === 'cashier';
  const isBarista = rawRole === 'barista';
  const isKitchen = rawRole === 'kitchen';

  const value = {
    user,
    profile: user,
    role: rawRole,
    rawRole,
    isSuperAdmin,
    isAdmin,
    isCashier,
    isBarista,
    isKitchen,
    merchant,
    isAuthenticated: Boolean(user && getAuthToken()),
    isLoading,
    login,
    logout,
    updateUser,
    updateMerchant,
    refreshProfile: async () => {
      const fresh = await fetchCurrentUser();
      if (fresh) setUser(fresh);
      return fresh;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
