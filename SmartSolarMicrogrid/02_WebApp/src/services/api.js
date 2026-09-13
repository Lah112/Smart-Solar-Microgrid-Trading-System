import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartsolar_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token and redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('smartsolar_token');
        localStorage.removeItem('smartsolar_user');
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  registerProsumer: (data) => api.post('/auth/register-prosumer', data),
  getProfile: () => api.get('/auth/profile'),
};

export const usersApi = {
  getAll: (role, status) => api.get('/users', { params: { role, status } }),
  getByNic: (nic) => api.get(`/users/${nic}`),
  createStaff: (data) => api.post('/users/staff', data),
  updateProfile: (nic, data) => api.put(`/users/${nic}/profile`, data),
  deactivate: (nic) => api.put(`/users/${nic}/deactivate`),
  reactivate: (nic) => api.put(`/users/${nic}/reactivate`),
  getPendingActivations: () => api.get('/users/pending-activations'),
  approveActivation: (nic) => api.put(`/users/${nic}/approve`),
};

export const stationsApi = {
  getAll: (activeOnly) => api.get('/stations', { params: { activeOnly } }),
  getById: (id) => api.get(`/stations/${id}`),
  getByCode: (code) => api.get(`/stations/code/${code}`),
  getNearby: (latitude, longitude, radiusKm) => api.get('/stations/nearby', { params: { latitude, longitude, radiusKm } }),
  create: (data) => api.post('/stations', data),
  update: (id, data) => api.put(`/stations/${id}`, data),
  deactivate: (id) => api.put(`/stations/${id}/deactivate`),
  reactivate: (id) => api.put(`/stations/${id}/reactivate`),
  updateBatterySlots: (id, availableSlots) => api.put(`/stations/${id}/battery-slots`, null, { params: { availableSlots } }),
};

export const bookingSlotsApi = {
  getSlots: (stationId, date) => api.get('/bookingslots', { params: { stationId, date } }),
  create: (data) => api.post('/bookingslots', data),
  update: (id, data) => api.put(`/bookingslots/${id}`, data),
  delete: (id) => api.delete(`/bookingslots/${id}`),
};

export const reservationsApi = {
  getAll: (params) => api.get('/reservations', { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  getProsumerHistory: (nic, status) => api.get(`/reservations/prosumer/${nic}`, { params: { status } }),
  create: (data) => api.post('/reservations', data),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  cancel: (id, data) => api.put(`/reservations/${id}/cancel`, data),
  approve: (id) => api.put(`/reservations/${id}/approve`),
  verifyQr: (data) => api.post('/reservations/verify-qr', data),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
