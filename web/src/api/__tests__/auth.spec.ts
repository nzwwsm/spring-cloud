import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { AxiosInstance, AxiosResponse } from 'axios'

// 配置 mock
vi.mock('axios', () => {
  const mockPost = vi.fn()
  const mockAxiosInstance = {
    post: mockPost,
    interceptors: {
      request: {
        use: vi.fn()
      },
      response: {
        use: vi.fn()
      }
    }
  } as unknown as AxiosInstance

  return {
    default: {
      create: () => mockAxiosInstance
    }
  }
})

// 导入被测试的模块
import axios from 'axios'
import { login, register } from '../auth'

describe('auth.ts', () => {
  const mockData = {
    username: 'testuser',
    password: 'password123'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('应该成功调用登录接口', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          code: 200
        }
      }
      const mockAxiosInstance = axios.create()
      vi.mocked(mockAxiosInstance.post).mockResolvedValueOnce(mockResponse as AxiosResponse)

      const response = await login(mockData)
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/login', mockData)
      expect(response).toEqual(mockResponse)
    })

    it('应该处理登录失败的情况', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            message: '用户名或密码错误'
          }
        }
      }
      const mockAxiosInstance = axios.create()
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(mockError)

      await expect(login(mockData)).rejects.toEqual(mockError)
    })

    it('应该处理网络错误', async () => {
      const mockError = {
        request: {},
        message: '网络错误'
      }
      const mockAxiosInstance = axios.create()
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(mockError)

      await expect(login(mockData)).rejects.toEqual(mockError)
    })

    it('应该处理其他错误', async () => {
      const mockError = {
        message: '未知错误'
      }
      const mockAxiosInstance = axios.create()
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(mockError)

      await expect(login(mockData)).rejects.toEqual(mockError)
    })
  })

  describe('register', () => {
    it('应该成功调用注册接口', async () => {
      const mockResponse = {
        data: {
          message: '注册成功',
          code: 200
        }
      }
      const mockAxiosInstance = axios.create()
      vi.mocked(mockAxiosInstance.post).mockResolvedValueOnce(mockResponse as AxiosResponse)

      const response = await register(mockData)
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/user/post', mockData)
      expect(response).toEqual(mockResponse)
    })

    it('应该处理注册失败的情况', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            message: '用户名已存在'
          }
        }
      }
      const mockAxiosInstance = axios.create()
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(mockError)

      await expect(register(mockData)).rejects.toEqual(mockError)
    })

    it('应该处理网络错误', async () => {
      const mockError = {
        request: {},
        message: '网络错误'
      }
      const mockAxiosInstance = axios.create()
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(mockError)

      await expect(register(mockData)).rejects.toEqual(mockError)
    })

    it('应该处理其他错误', async () => {
      const mockError = {
        message: '未知错误'
      }
      const mockAxiosInstance = axios.create()
      vi.mocked(mockAxiosInstance.post).mockRejectedValueOnce(mockError)

      await expect(register(mockData)).rejects.toEqual(mockError)
    })
  })
})