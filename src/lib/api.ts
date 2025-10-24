import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL2 || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string, referralCode?: string) => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
      referralCode,
    });
    return response.data;
  },

  verifyEmail: async (email: string, otp: string) => {
    const response = await api.post('/auth/verify-email', { email, otp });
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },

  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/request-password-reset', { email });
    return response.data;
  },

  verifyResetOTP: async (email: string, otp: string) => {
    const response = await api.post('/auth/verify-reset-otp', { email, otp });
    return response.data;
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  },

  resendVerification: async (email: string) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  // Add this new endpoint
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const referralApi = {
  getStats: async (userId: string) => {
    const response = await api.get(`/referrals/stats/${userId}`);
    return response.data;
  },

  getDirectReferrals: async (userId: string, page: number = 1, limit: number = 10) => {
    const response = await api.get(`/referrals/direct/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  getReferralTree: async (userId: string) => {
    const response = await api.get(`/referrals/tree/${userId}`);
    return response.data;
  },

  getLeaderboard: async (page: number = 1, limit: number = 100, sortBy: 'points' | 'referrals' = 'points') => {
    const response = await api.get(`/referrals/leaderboard?page=${page}&limit=${limit}&sortBy=${sortBy}`);
    return response.data;
  },

  addReferrer: async (userId: string, referralCode: string) => {
    const response = await api.post(`/referrals/add-referrer/${userId}`, { referralCode });
    return response.data;
  },

  validateReferralCode: async (referralCode: string) => {
    const response = await api.get(`/referrals/validate/${referralCode}`);
    return response.data;
  },

  getUserByReferralCode: async (referralCode: string) => {
    const response = await api.get(`/referrals/user/code/${referralCode}`);
    return response.data;
  },

  refreshStats: async (userId: string) => {
    const response = await api.post(`/referrals/refresh-stats/${userId}`);
    return response.data;
  },
};

// Admin API calls
export const adminApi = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  generateTestData: async (userId: string, levels: number = 3, usersPerLevel: number = 2) => {
    const response = await api.post('/admin/generate-test-data', {
      userId,
      levels,
      usersPerLevel,
    });
    return response.data;
  },

  deleteTestData: async () => {
    const response = await api.delete('/admin/delete-test-data');
    return response.data;
  },

  refreshAllStats: async () => {
    const response = await api.post('/admin/refresh-all-stats');
    return response.data;
  },
};

