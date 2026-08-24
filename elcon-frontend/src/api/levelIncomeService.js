import axios from 'axios';
import { getToken } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const getLevelIncomeReports = async (params) => {
  const token = getToken();
  const response = await axios.get(`${API_URL}/level-income/reports`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
};
