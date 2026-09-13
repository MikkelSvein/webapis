import axios from 'axios';

const API_BASE_URL = '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { email: string; name: string; password: string; referralCode?: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  getProfile: () =>
    api.get('/api/auth/profile'),
  updateProfile: (data: { name?: string; email?: string }) =>
    api.put('/api/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/api/auth/change-password', data),
};

export const bondsAPI = {
  getCatalog: () =>
    api.get('/api/bonds/catalog'),
  purchase: (data: { bondType: string; paymentMethod: string }) =>
    api.post('/api/bonds/purchase', data),
  getMyBonds: () =>
    api.get('/api/bonds/my-bonds'),
  getBondById: (id: number) =>
    api.get(`/api/bonds/${id}`),
  getBondQR: (id: number) =>
    api.get(`/api/bonds/${id}/qr`),
  redeemBond: (id: number) =>
    api.post(`/api/bonds/${id}/redeem`),
};

export const paymentsAPI = {
  simulatePayment: (data: { bondType: string; paymentMethod: string }) =>
    api.post('/api/payments/simulate', data),
  getPaymentStatus: (id: number) =>
    api.get(`/api/payments/${id}/status`),
};

export const referralsAPI = {
  getMyCode: () =>
    api.get('/api/referrals/my-code'),
  getStats: () =>
    api.get('/api/referrals/stats'),
  applyCode: (code: string) =>
    api.post('/api/referrals/apply', { code }),
  getCommissions: () =>
    api.get('/api/referrals/commissions'),
};

export default api;
