/**
 * Centralized Axios client for making API requests 
 * with consistent configuration across the application
 */
import axios from 'axios';

// Create a custom Axios instance with default configuration
const apiClient = axios.create({
  baseURL: '/',  // Base URL is relative to the current domain
  withCredentials: true,  // Always include credentials (cookies) with requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,  // 10 second timeout
});

// Add request interceptor for additional processing if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add custom headers for our Next.js API routes to indicate
    // this is a client-side request from our own application
    config.headers['x-client-auth'] = 'internal-request';
    config.headers['x-request-origin'] = 'client-side';
    
    // Add a timestamp for debugging request sequences
    config.headers['x-request-time'] = new Date().toISOString();
    
    // Ensure credentials are always sent with requests (cookies)
    config.withCredentials = true;
    
    // Log the request details
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling common response patterns
apiClient.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx will trigger this function
    return response;
  },
  (error) => {
    // Any status codes outside the range of 2xx will trigger this function
    
    // Handle common error cases
    if (error.response) {
      // Server responded with a status code outside of 2xx
      if (error.response.status === 401) {
        console.log('Authentication error - user not logged in');
        // You could redirect to login page here if needed
      } else if (error.response.status === 403) {
        console.log('Authorization error - insufficient permissions');
      }
    } else if (error.request) {
      // Request was made but no response was received
      console.log('Network error - no response received');
    } else {
      // Something happened in setting up the request that triggered an error
      console.log('Request configuration error');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
