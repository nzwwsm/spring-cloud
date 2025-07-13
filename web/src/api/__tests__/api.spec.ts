import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import type { AxiosInstance, AxiosResponse } from 'axios'
import { DefaultApi, AuthApi, ControllerApi } from '../api'
import type { BusinessDTO, CommodityDTO, FoodTypeDTO, OrderDTO, OrderTableDTO, UserDTO } from '../api'
import { Configuration } from '../configuration'
import * as common from '../common'

// 配置 mock
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
    defaults: {
      baseURL: '/api'
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

describe('API Tests', () => {
  let mockAxiosInstance: AxiosInstance
  let defaultApi: DefaultApi
  let authApi: AuthApi
  let controllerApi: ControllerApi
  const configuration = new Configuration({
    basePath: '/api'
  })

  beforeAll(() => {
    // 创建 mockAxiosInstance 时就设置好 defaults
    mockAxiosInstance = {
      request: vi.fn(),
      defaults: { baseURL: '/api' }
    } as unknown as AxiosInstance
    ;(common as any).globalAxios = mockAxiosInstance
  })

  beforeEach(() => {
    // 重置 mock 函数
    vi.mocked(mockAxiosInstance.request).mockReset()
    
    // 初始化 API 实例
    defaultApi = new DefaultApi(configuration, '/api', mockAxiosInstance)
    authApi = new AuthApi(configuration, '/api', mockAxiosInstance)
    controllerApi = new ControllerApi(configuration, '/api', mockAxiosInstance)
  })

  describe('DefaultApi', () => {
    describe('getBusinessList', () => {
      it('应该成功获取商家列表', async () => {
        const mockResponse: BusinessDTO[] = [{
          id: 1,
          businessName: '测试商家',
          image: 'test.jpg',
          description: '测试描述',
          score: 4.5,
          deliveryFees: 5,
          miniDeliveryFee: 20,
          monthSold: 100
        }]

        vi.mocked(mockAxiosInstance.request).mockResolvedValueOnce({ data: mockResponse } as AxiosResponse)
        const response = await defaultApi.getBusinessList()
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
          url: '/business/list',
          method: 'GET'
        }))
        expect(response.data).toEqual(mockResponse)
      })

      it('应该处理空响应', async () => {
        vi.mocked(mockAxiosInstance.request).mockResolvedValueOnce({ data: [] } as AxiosResponse)
        const response = await defaultApi.getBusinessList()
        expect(response.data).toEqual([])
      })

      it('应该处理错误响应', async () => {
        vi.mocked(mockAxiosInstance.request).mockRejectedValueOnce(new Error('Network error'))
        await expect(defaultApi.getBusinessList()).rejects.toThrow('Network error')
      })
    })

    describe('getCommodityList', () => {
      it('应该成功获取商品列表', async () => {
        const mockResponse: CommodityDTO[] = [{
          id: 1,
          commodityName: '测试商品',
          commodityDescription: '测试描述',
          image: 'test.jpg',
          price: 50
        }]

        vi.mocked(mockAxiosInstance.request).mockResolvedValueOnce({ data: mockResponse } as AxiosResponse)
        const response = await defaultApi.getCommodityList(1)
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
          url: '/business/itemList?id=1',
          method: 'GET'
        }))
        expect(response.data).toEqual(mockResponse)
      })

      it('应该处理空响应', async () => {
        vi.mocked(mockAxiosInstance.request).mockResolvedValueOnce({ data: [] } as AxiosResponse)
        const response = await defaultApi.getCommodityList(1)
        expect(response.data).toEqual([])
      })

      it('应该处理错误响应', async () => {
        vi.mocked(mockAxiosInstance.request).mockRejectedValueOnce(new Error('Network error'))
        await expect(defaultApi.getCommodityList(1)).rejects.toThrow('Network error')
      })
    })

    describe('getFoodTypeList', () => {
      it('应该成功获取食品类型列表', async () => {
        const mockResponse: FoodTypeDTO[] = [{
          typeName: '测试类型',
          image: 'test.jpg'
        }]

        vi.mocked(mockAxiosInstance.request).mockResolvedValueOnce({ data: mockResponse } as AxiosResponse)
        const response = await defaultApi.getFoodTypeList()
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
          url: '/foodtype/foodTypeList',
          method: 'GET'
        }))
        expect(response.data).toEqual(mockResponse)
      })

      it('应该处理空响应', async () => {
        vi.mocked(mockAxiosInstance.request).mockResolvedValueOnce({ data: [] } as AxiosResponse)
        const response = await defaultApi.getFoodTypeList()
        expect(response.data).toEqual([])
      })

      it('应该处理错误响应', async () => {
        vi.mocked(mockAxiosInstance.request).mockRejectedValueOnce(new Error('Network error'))
        await expect(defaultApi.getFoodTypeList()).rejects.toThrow('Network error')
      })
    })
  })

  describe('AuthApi', () => {
    describe('getToken', () => {
      it('应该成功获取token', async () => {
        const mockResponse = { token: 'test-token' }
        const mockUser: UserDTO = {
          username: 'test',
          password: 'password'
        }
        vi.mocked(mockAxiosInstance.request).mockResolvedValueOnce({ data: mockResponse } as AxiosResponse)
        const response = await authApi.getToken(mockUser)
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
          url: '/auth/login',
          method: 'POST',
          data: JSON.stringify(mockUser),
          headers: { 'Content-Type': 'application/json' }
        }))
        expect(response.data).toEqual(mockResponse)
      })

      it('应该处理错误响应', async () => {
        const mockUser: UserDTO = {
          username: 'test',
          password: 'wrong'
        }
        vi.mocked(mockAxiosInstance.request).mockRejectedValueOnce(new Error('Invalid credentials'))
        await expect(authApi.getToken(mockUser)).rejects.toThrow('Invalid credentials')
      })
    })

    describe('register', () => {
      it('应该成功注册用户', async () => {
        const mockResponse = { success: true }
        const mockUser: UserDTO = {
          username: 'test',
          password: 'password'
        }
        vi.mocked(mockAxiosInstance.request).mockResolvedValueOnce({ data: mockResponse } as AxiosResponse)
        const response = await authApi.register(mockUser)
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
          url: '/user/post',
          method: 'POST',
          data: JSON.stringify(mockUser),
          headers: { 'Content-Type': 'application/json' }
        }))
        expect(response.data).toEqual(mockResponse)
      })

      it('应该处理错误响应', async () => {
        const mockUser: UserDTO = {
          username: 'test',
          password: 'password'
        }
        vi.mocked(mockAxiosInstance.request).mockRejectedValueOnce(new Error('Register failed'))
        await expect(authApi.register(mockUser)).rejects.toThrow('Register failed')
      })
    })
  })

  describe('ControllerApi', () => {
    describe('构造函数和配置', () => {
      it('应该正确初始化 ControllerApi 实例', async () => {
        const mockResponse = []
        vi.mocked(mockAxiosInstance.request).mockResolvedValueOnce({ data: mockResponse } as AxiosResponse)
        const api = new ControllerApi(configuration, '', mockAxiosInstance)
        await api.getPayedOrder()
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
          url: '/user/payedorder',
          method: 'GET'
        }))
      })

      it('应该使用默认配置初始化 ControllerApi 实例', async () => {
        const mockResponse = []
        // 创建一个新的 mock 实例，专门用于默认配置测试
        const defaultMockAxios = {
          request: vi.fn().mockResolvedValueOnce({ data: mockResponse }),
          defaults: {
            baseURL: '/api',
            headers: {
              common: {}
            }
          }
        } as unknown as AxiosInstance
        
        // 创建一个默认配置
        const defaultConfig = new Configuration({
          basePath: '/api'
        })
        
        // 使用默认配置创建 ControllerApi 实例
        const api = new ControllerApi(defaultConfig, '/api', defaultMockAxios)
        await api.getPayedOrder()
        expect(defaultMockAxios.request).toHaveBeenCalledWith(expect.objectContaining({
          url: '/user/payedorder',
          method: 'GET'
        }))
      })
    })

    describe('savedOrder', () => {
      it('应该成功保存订单', async () => {
        const mockOrder: OrderDTO = { orderItemDTOs: [] }
        vi.mocked(mockAxiosInstance.request).mockResolvedValueOnce({ data: undefined } as AxiosResponse)
        const response = await controllerApi.savedOrder(mockOrder)
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
          url: '/user/saveorder',
          method: 'PUT',
          data: JSON.stringify(mockOrder),
          headers: { 'Content-Type': 'application/json' }
        }))
        expect(response.data).toBeUndefined()
      })

      it('应该处理错误响应', async () => {
        const mockOrder: OrderDTO = { orderItemDTOs: [] }
        vi.mocked(mockAxiosInstance.request).mockRejectedValueOnce(new Error('Invalid order'))
        await expect(controllerApi.savedOrder(mockOrder)).rejects.toThrow('Invalid order')
      })

      it('应该处理自定义请求选项', async () => {
        const mockOrder: OrderDTO = { orderItemDTOs: [] }
        vi.mocked(mockAxiosInstance.request).mockRejectedValueOnce(new Error('Invalid order'))
        await expect(controllerApi.savedOrder(mockOrder, { headers: { 'X-Test': '1' } })).rejects.toThrow('Invalid order')
      })
    })

    describe('getPayedOrder', () => {
      it('应该成功获取已支付订单列表', async () => {
        const mockResponse = [
          {
            orderId: 1,
            businessName: '测试商家',
            businessDeliveryFees: 5,
            payAmount: 100,
            orderItemDTOs: [
              { productName: '测试商品', image: 'test.jpg', quanity: 2, commodityPrice: 50 }
            ]
          }
        ]
        vi.mocked(mockAxiosInstance.request).mockResolvedValueOnce({ data: mockResponse } as AxiosResponse)
        const response = await controllerApi.getPayedOrder()
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
          url: '/user/payedorder',
          method: 'GET'
        }))
        expect(response.data).toEqual(mockResponse)
      })

      it('应该处理空响应', async () => {
        vi.mocked(mockAxiosInstance.request).mockResolvedValueOnce({ data: [] } as AxiosResponse)
        const response = await controllerApi.getPayedOrder()
        expect(response.data).toEqual([])
      })

      it('应该处理错误响应', async () => {
        vi.mocked(mockAxiosInstance.request).mockRejectedValueOnce(new Error('Network error'))
        await expect(controllerApi.getPayedOrder()).rejects.toThrow('Network error')
      })

      it('应该处理自定义请求选项', async () => {
        vi.mocked(mockAxiosInstance.request).mockRejectedValueOnce(new Error('Network error'))
        await expect(controllerApi.getPayedOrder({ headers: { 'X-Test': '1' } })).rejects.toThrow('Network error')
      })
    })

    describe('getUnpayOrder', () => {
      it('应该成功获取未支付订单列表', async () => {
        const mockResponse = [
          {
            orderId: 1,
            businessName: '测试商家',
            businessDeliveryFees: 5,
            payAmount: 100,
            orderItemDTOs: [
              { productName: '测试商品', image: 'test.jpg', quanity: 2, commodityPrice: 50 }
            ]
          }
        ]
        vi.mocked(mockAxiosInstance.request).mockResolvedValueOnce({ data: mockResponse } as AxiosResponse)
        const response = await controllerApi.getUnpayOrder()
        expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
          url: '/user/unpayorder',
          method: 'GET'
        }))
        expect(response.data).toEqual(mockResponse)
      })

      it('应该处理空响应', async () => {
        vi.mocked(mockAxiosInstance.request).mockResolvedValueOnce({ data: [] } as AxiosResponse)
        const response = await controllerApi.getUnpayOrder()
        expect(response.data).toEqual([])
      })

      it('应该处理错误响应', async () => {
        vi.mocked(mockAxiosInstance.request).mockRejectedValueOnce(new Error('Network error'))
        await expect(controllerApi.getUnpayOrder()).rejects.toThrow('Network error')
      })

      it('应该处理自定义请求选项', async () => {
        vi.mocked(mockAxiosInstance.request).mockRejectedValueOnce(new Error('Network error'))
        await expect(controllerApi.getUnpayOrder({ headers: { 'X-Test': '1' } })).rejects.toThrow('Network error')
      })
    })
  })
}) 