const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/admin';

class AdminApiService {
  
  // Helper pour gérer les requêtes
  async request(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la requête');
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ==================== PRODUCTS ====================
  async getProducts(filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/products${query}`);
  }

  async getProductStats() {
    return this.request('/products/stats');
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  async createProduct(formData) {
    return this.request('/products', {
      method: 'POST',
      body: formData,
      headers: {}, // Laisser le browser gérer Content-Type pour FormData
    });
  }

  async updateProduct(id, formData) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: formData,
      headers: {},
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== ORDERS ====================
  async getOrders(filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/orders${query}`);
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // ==================== USERS ====================
  async getUsers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/users${query}`);
  }

  async getUsersAnalytics() {
    return this.request('/users/analytics');
  }

  async getUserDetails(id) {
    return this.request(`/${id}`);
  }

  async toggleUserStatus(id) {
    return this.request(`/${id}/status`, {
      method: 'PUT',
    });
  }

  async deleteUser(id) {
    return this.request(`/usersdelete/${id}`, {
      method: 'DELETE',
    });
  }

  async exportUsers() {
    return this.request('/export/users');
  }

  // ==================== COMMENTS ====================
  async getAllComments() {
    return this.request('/');
  }

  async getCommentStats() {
    return this.request('/stats');
  }

  async getProductComments(productId) {
    return this.request(`/product/${productId}`);
  }

  async deleteComment(commentId) {
    return this.request(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }
}

export const adminApi = new AdminApiService();