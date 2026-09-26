import axios from 'axios';
import { getToken } from '../utils/auth';

const isProd = import.meta.env.MODE === 'production';
const defaultApiUrl = isProd ? '/api' : 'http://localhost:5000/api';
const API_URL = import.meta.env.VITE_API_URL || defaultApiUrl;

export const getLevelIncomeReports = async (params) => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/level-income/reports`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};
