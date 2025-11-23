'use client'
import { adminApi } from '@/services/adminApi';
import {  useContext, useState, useCallback, useEffect, createContext } from 'react';


const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  // États pour les données
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [productStats, setProductStats] = useState(null);
  const [usersAnalytics, setUsersAnalytics] = useState(null);

  // États de pagination
  const [productsPagination, setProductsPagination] = useState(null);
  const [ordersPagination, setOrdersPagination] = useState(null);
  const [usersPagination, setUsersPagination] = useState(null);

  // États de chargement
  const [loading, setLoading] = useState({
    products: false,
    orders: false,
    users: false,
    stats: false,
  });

  // États d'erreur
  const [error, setError] = useState({
    products: null,
    orders: null,
    users: null,
    stats: null,
  });

  // Helper pour gérer les erreurs
  const handleError = (key, err) => {
    setError(prev => ({ ...prev, [key]: err.message }));
    console.error(`${key} error:`, err);
  };

  // ==================== PRODUCTS ====================
  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      setLoading(prev => ({ ...prev, products: true }));
      setError(prev => ({ ...prev, products: null }));
      
      const response = await adminApi.getProducts(filters);
      setProducts(response.data.products || []);
      setProductsPagination(response.data.pagination);
      
      return response;
    } catch (err) {
      handleError('products', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  }, []);

  const fetchProductStats = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      setError(prev => ({ ...prev, stats: null }));
      
      const response = await adminApi.getProductStats();
      setProductStats(response.data);
      
      return response;
    } catch (err) {
      handleError('stats', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, []);

  // ==================== ORDERS ====================
  const fetchOrders = useCallback(async (filters = {}) => {
    try {
      setLoading(prev => ({ ...prev, orders: true }));
      setError(prev => ({ ...prev, orders: null }));
      
      const response = await adminApi.getOrders(filters);
      setOrders(response.data.orders || []);
      setOrdersPagination(response.data.pagination);
      
      return response;
    } catch (err) {
      handleError('orders', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      const response = await adminApi.updateOrderStatus(orderId, status);
      
      // Mettre à jour la commande dans l'état local
      setOrders(prev => 
        prev.map(order => 
          order._id === orderId ? { ...order, status } : order
        )
      );
      
      return response;
    } catch (err) {
      handleError('orders', err);
      throw err;
    }
  }, []);

  // ==================== USERS ====================
  const fetchUsers = useCallback(async (filters = {}) => {
    try {
      setLoading(prev => ({ ...prev, users: true }));
      setError(prev => ({ ...prev, users: null }));
      
      const response = await adminApi.getUsers(filters);
      setUsers(response.data.users || []);
      setUsersPagination(response.data.pagination);
      
      return response;
    } catch (err) {
      handleError('users', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, []);

  const fetchUsersAnalytics = useCallback(async () => {
    try {
      const response = await adminApi.getUsersAnalytics();
      setUsersAnalytics(response.data);
      return response;
    } catch (err) {
      handleError('users', err);
      throw err;
    }
  }, []);

  // ==================== DASHBOARD DATA ====================
  const fetchDashboardData = useCallback(async () => {
    try {
      // Charger toutes les données du dashboard en parallèle
      await Promise.all([
        fetchProducts({ limit: 100 }),
        fetchOrders({ limit: 100 }),
        fetchUsers({ limit: 100 }),
        fetchProductStats(),
      ]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }, [fetchProducts, fetchOrders, fetchUsers, fetchProductStats]);

  // Données calculées pour le dashboard
  const dashboardStats = {
    totalProducts: productStats?.general?.totalProducts || products.length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    totalOrders: orders.length,
    totalUsers: users.length,
    averageOrderValue: orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length 
      : 0,
    totalStock: productStats?.general?.totalStock || 0,
  };

  const value = {
    // Données
    products,
    orders,
    users,
    productStats,
    usersAnalytics,
    dashboardStats,
    
    // Pagination
    productsPagination,
    ordersPagination,
    usersPagination,
    
    // États
    loading,
    error,
    
    // Fonctions
    fetchProducts,
    fetchProductStats,
    fetchOrders,
    updateOrderStatus,
    fetchUsers,
    fetchUsersAnalytics,
    fetchDashboardData,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin doit être utilisé dans un AdminProvider');
  }
  return context;
}