// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// Auth types
export interface User {
  id: string | number
  email: string
  full_name: string
  role: 'admin' | 'student'
}

export interface Student {
  id: string
  email: string
  full_name: string
  nim?: string
  cohort?: string
  faculty?: string
  avatar_url?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface StudentRegisterRequest {
  email: string
  password: string
  full_name: string
  nim?: string
  cohort?: string
  faculty?: string
}

export interface LoginResponse {
  user: User
  token: string
}

// Content types
export interface Slider {
  id: string | number
  title: string
  image_path: string
  alt_text: string
  order_index: number
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string | number
  title: string
  content: string
  attachments: string[]
  is_important?: boolean
  published_at: string
  created_at: string
  updated_at: string
}

export interface Module {
  id: string | number
  title: string
  file_path: string
  description: string
  visibility: 'public' | 'private'
  file_size?: number
  file_type?: string
  download_count?: number
  created_at: string
  updated_at: string
}

export interface FileItem {
  id: string | number
  name: string
  storage_path: string
  description: string
  visibility: 'public' | 'private'
  has_password: boolean
  created_by: string | number
  created_at: string
  updated_at: string
  file_type?: string
  file_size?: number
}

export interface NilaiFile {
  id: string | number
  class: string
  storage_path: string
  cohort: string
  has_password: boolean
  created_at: string
  updated_at: string
  file_type?: string
  file_size?: number
  name?: string
}

export interface Group {
  id: string | number
  name: string
  description: string
  storage_path: string
  cohort: string
  visibility: 'public' | 'private'
  has_password: boolean
  file_size?: number
  file_type?: string
  download_count?: number
  created_at: string
  updated_at: string
}

export interface ContactMessage {
  id: string | number
  name: string
  email: string
  subject: string
  message: string
  status: 'new' | 'read' | 'archived'
  created_at: string
}

export interface SearchResult {
  id: string | number
  type: 'announcement' | 'module' | 'file'
  title: string
  excerpt: string
  url: string
  created_at: string
}

// Mobile-specific types
export interface PushToken {
  id: string
  user_id: string
  user_type: 'admin' | 'student'
  push_token: string
  platform: 'ios' | 'android'
}

export interface OfflineFile {
  id: string
  name: string
  localPath: string
  type: 'module' | 'file' | 'nilai' | 'group'
  downloadedAt: string
  size: number
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system'

// Notification types
export interface AppNotification {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}
