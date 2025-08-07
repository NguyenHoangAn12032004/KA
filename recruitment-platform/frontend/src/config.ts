export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export const API_BASE_URL = API_URL; 

// Socket configuration
export const SOCKET_CONFIG = {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
};

// Application settings
export const APP_CONFIG = {
  pageSize: 10,
  paginationOptions: [5, 10, 25, 50],
  autoRefreshInterval: 30000, // 30 seconds
  toastDuration: 5000, // 5 seconds
  maxNotifications: 5,
  debounceDelay: 500 // 500ms for search inputs
};

// Feature flags
export const FEATURES = {
  enableRealtime: true,
  enableNotifications: true,
  enableDarkMode: true,
  enableExports: true,
  enableBulkActions: true
};