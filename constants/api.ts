import Constants from 'expo-constants'

export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5001'

export const endpoints = {
  // Auth
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    studentRegister: '/api/auth/student/register',
    studentLogin: '/api/auth/student/login',
    studentMe: '/api/auth/student/me',
    studentProfile: '/api/auth/student/profile',
  },

  // Public content
  sliders: {
    list: '/api/sliders',
  },

  announcements: {
    list: '/api/announcements',
    get: (id: string | number) => `/api/announcements/${id}`,
  },

  modules: {
    list: '/api/modules',
    get: (id: string | number) => `/api/modules/${id}`,
    download: (id: string | number) => `/api/modules/${id}/download`,
  },

  files: {
    list: '/api/files',
    get: (id: string | number) => `/api/files/${id}`,
    verifyPassword: (id: string | number) => `/api/files/${id}/verify-password`,
    download: (id: string | number) => `/api/files/${id}/download`,
  },

  nilai: {
    list: '/api/nilai',
    get: (id: string | number) => `/api/nilai/${id}`,
    verifyPassword: (id: string | number) => `/api/nilai/${id}/verify-password`,
    download: (id: string | number) => `/api/nilai/${id}/download`,
  },

  groups: {
    list: '/api/groups',
    get: (id: string | number) => `/api/groups/${id}`,
    download: (id: string | number) => `/api/groups/${id}/download`,
  },

  search: {
    global: '/api/search',
  },

  contact: {
    create: '/api/contact',
  },

  // Mobile-specific
  devices: {
    register: '/api/devices',
    unregister: (token: string) => `/api/devices/${token}`,
  },
} as const
