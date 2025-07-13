import axios from 'axios'
import { responseInterceptor, errorInterceptor } from './common'

interface OrderItem {
  quanity: number
  productName: string
  commodityPrice: number
  image: string
}

interface Order {
  orderId: number
  payAmount: number
  businessName: string
  businessDeliveryFees: number
  orderItemDTOs: OrderItem[]
}

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(responseInterceptor, errorInterceptor)

// 获取已支付订单
export const getPaidOrders = () => {
  return request.get<Order[]>('http://localhost:80/api/user/payedorder')
}

// 获取未支付订单
export const getUnpaidOrders = () => {
  return request.get<Order[]>('http://localhost:80/api/user/unpayorder')
} 