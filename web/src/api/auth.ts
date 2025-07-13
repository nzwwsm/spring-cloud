import axios from 'axios'
import { responseInterceptor, errorInterceptor } from './common'
import { API_URLS, BASE_URL } from '@/config/api'

interface LoginData {
  username: string
  password: string
}

interface LoginResponse {
  token: string
  message?: string
  code?: number
}

// 创建 axios 实例
const request = axios.create({
  baseURL: BASE_URL,
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 登录请求不需要添加 token
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(responseInterceptor, errorInterceptor)

// 登录接口
export const login = (data: LoginData) => {
  return request.post<LoginResponse>(API_URLS.authLogin(), data)
}

// 注册接口
export const register = (data: LoginData) => {
  return request.post<LoginResponse>(API_URLS.authRegister(), data)
}