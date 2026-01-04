import * as SecureStore from 'expo-secure-store'
import { API_BASE_URL } from '@/constants/api'
import type { ApiResponse } from '@/types'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('auth_token')
    } catch {
      return null
    }
  }

  async setAuthToken(token: string): Promise<void> {
    await SecureStore.setItemAsync('auth_token', token)
  }

  async clearAuthToken(): Promise<void> {
    await SecureStore.deleteItemAsync('auth_token')
    await SecureStore.deleteItemAsync('user_data')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const token = await this.getAuthToken()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
    }

    try {
      const response = await fetch(url, config)

      let data: ApiResponse<T>
      const contentType = response.headers.get('content-type')

      if (contentType && contentType.includes('application/json')) {
        const text = await response.text()
        data = text ? JSON.parse(text) : { data: null as T, success: true }
      } else {
        const text = await response.text()
        data = {
          data: null as T,
          message: text || `HTTP error: ${response.status}`,
          success: false,
        }
      }

      if (!response.ok) {
        // Handle auth errors
        if (response.status === 401 || response.status === 403) {
          await this.clearAuthToken()
        }
        throw new Error(data.message || `HTTP error: ${response.status}`)
      }

      return data
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network')) {
        throw new Error('Network error. Please check your internet connection.')
      }
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async uploadFile<T>(
    endpoint: string,
    file: { uri: string; name: string; type: string },
    additionalData?: Record<string, string>,
    method: 'POST' | 'PUT' = 'POST'
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const token = await this.getAuthToken()

    const formData = new FormData()
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const headers: Record<string, string> = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: formData,
      })

      let data: ApiResponse<T>
      const contentType = response.headers.get('content-type')

      if (contentType && contentType.includes('application/json')) {
        const text = await response.text()
        data = text ? JSON.parse(text) : { data: null as T, success: true }
      } else {
        const text = await response.text()
        data = {
          data: null as T,
          message: text || `HTTP error: ${response.status}`,
          success: false,
        }
      }

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await this.clearAuthToken()
        }
        throw new Error(data.message || `HTTP error: ${response.status}`)
      }

      return data
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Network')) {
        throw new Error('Network error. Please check your internet connection.')
      }
      throw error
    }
  }

  async getWithQuery<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): Promise<ApiResponse<T>> {
    let queryString = ''
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      queryString = searchParams.toString()
    }
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request<T>(fullEndpoint, { method: 'GET' })
  }
}

export const api = new ApiClient(API_BASE_URL)
export default api
