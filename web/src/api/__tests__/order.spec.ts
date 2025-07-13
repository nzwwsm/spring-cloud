import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DefaultApi } from '../api'
import { OrderDTO } from '../api'
import axios from 'axios'

vi.mock('axios')

describe('OrderApi', () => {
  let api: DefaultApi

  beforeEach(() => {
    api = new DefaultApi()
    vi.clearAllMocks()
  })

  it('savedOrder应该正确保存订单', async () => {
    const mockResponse = {
      data: {
        orderId: 1,
        status: 'success'
      }
    }
    vi.mocked(axios.request).mockResolvedValueOnce(mockResponse)

    const orderData: OrderDTO = {
      payAmount: 100,
      businessName: '测试商家',
      orderItemDTOs: [
        { commodityId: 1, quantity: 2 }
      ]
    }
    const result = await api.savedOrder(orderData)
    expect(result).toEqual(mockResponse)
    expect(axios.request).toHaveBeenCalledWith({
      method: 'PUT',
      url: 'http://localhost:8080/api/user/saveorder',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify(orderData)
    })
  })

  it('getPayedOrder应该正确获取已支付订单', async () => {
    const mockResponse = {
      data: [
        { orderId: 1, status: 'paid' },
        { orderId: 2, status: 'paid' }
      ]
    }
    vi.mocked(axios.request).mockResolvedValueOnce(mockResponse)

    const result = await api.getPayedOrder()
    expect(result).toEqual(mockResponse)
    expect(axios.request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/user/payedorder',
      headers: {}
    })
  })

  it('getUnpayOrder应该正确获取未支付订单', async () => {
    const mockResponse = {
      data: [
        { orderId: 1, status: 'unpaid' },
        { orderId: 2, status: 'unpaid' }
      ]
    }
    vi.mocked(axios.request).mockResolvedValueOnce(mockResponse)

    const result = await api.getUnpayOrder()
    expect(result).toEqual(mockResponse)
    expect(axios.request).toHaveBeenCalledWith({
      method: 'GET',
      url: '/api/user/unpayorder',
      headers: {}
    })
  })

  it('应该正确处理订单创建失败', async () => {
    const orderDTO: OrderDTO = {
      payAmount: 100,
      businessName: '测试商家',
      orderItemDTOs: []
    }
    const mockResponse = {
      data: {
        error: '订单创建失败'
      }
    }
    vi.mocked(axios.request).mockRejectedValueOnce(new Error('订单创建失败'))
    
    await expect(api.savedOrder(orderDTO)).rejects.toThrow()
  })
}) 