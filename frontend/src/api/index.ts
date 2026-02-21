import axios from 'axios';
import type { 
  CreateInsightRequest
} from '../types';

const API_URL = '/api';

// 获取token
const getToken = () => localStorage.getItem('token');

// 创建axios实例
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器添加token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== 认证相关 ====================
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
};

// ==================== 八字相关 ====================
export const baziApi = {
  calculate: (data: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute?: number;
  }) => api.post('/bazi/calculate', data),
  
  getMyBazi: () => api.get('/bazi/my'),
};

// ==================== 修炼相关 ====================
export const cultivationApi = {
  getStatus: () => api.get('/cultivation/status'),
  start: () => api.post('/cultivation/start'),
  stop: (data: { minutes: number; expGained: number }) =>
    api.post('/cultivation/stop', data),
};

// ==================== 天时相关 ====================
export const celestialApi = {
  getNow: (lat?: number, lon?: number) =>
    api.get('/celestial/now', { params: { lat, lon } }),
  getMoon: () => api.get('/celestial/moon'),
};

// ==================== 对话相关 ====================
export const chatApi = {
  getHistory: (limit?: number) =>
    api.get('/chat/history', { params: { limit } }),
  sendMessage: (message: string) =>
    api.post('/chat/send', { message }),
};

// ==================== 箴言相关 ====================
export const wisdomApi = {
  /**
   * 获取今日箴言
   * GET /api/wisdom/daily
   */
  getDailyWisdom: () =>
    api.get('/wisdom/daily'),
  
  /**
   * 获取每日总结
   * GET /api/wisdom/daily-summary
   */
  getDailySummary: () =>
    api.get('/wisdom/daily-summary'),
  
  /**
   * 创建感悟
   * POST /api/wisdom/insight
   */
  createInsight: (data: CreateInsightRequest) =>
    api.post('/wisdom/insight', data),
  
  /**
   * 获取感悟列表
   * GET /api/wisdom/insights/:wisdomId
   */
  getInsights: (wisdomId: string) =>
    api.get(`/wisdom/insights/${wisdomId}`),
  
  /**
   * 删除感悟
   * DELETE /api/wisdom/insight/:id
   */
  deleteInsight: (insightId: string) =>
    api.delete(`/wisdom/insight/${insightId}`),
  
  /**
   * 获取箴言历史
   * GET /api/wisdom/history
   */
  getWisdomHistory: (page?: number, limit?: number) =>
    api.get('/wisdom/history', { params: { page, limit } }),
};

export default api;
