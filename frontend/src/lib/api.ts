import axios, { AxiosError, AxiosResponse } from 'axios';

// Define the Base Response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Define Pagination structure
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Define Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
});

// Request Interceptor (Optional: e.g., for logging or attaching tokens if using headers)
apiClient.interceptors.request.use(
  (config) => {
    // You can attach tokens from local storage here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (Optional: e.g., for global error handling)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle specific status codes globally
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      console.warn('Unauthorized access. Redirecting to login...');
    }
    return Promise.reject(error);
  }
);

// Helper function to extract data from the response
export const fetcher = async <T>(url: string): Promise<T> => {
    const response = await apiClient.get<ApiResponse<T>>(url);
    return response.data.data;
};
