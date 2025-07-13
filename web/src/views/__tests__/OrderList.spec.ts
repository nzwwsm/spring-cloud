import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import OrderList from '../OrderList.vue'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getPaidOrders, getUnpaidOrders } from '../../api/order'
import axios, { AxiosResponse, AxiosError } from 'axios'

// Mock API calls
vi.mock('../../api/order', () => ({
  getPaidOrders: vi.fn(),
  getUnpaidOrders: vi.fn()
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock fetch
global.fetch = vi.fn()

// Mock window.alert
global.alert = vi.fn()

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/orderList', component: OrderList }
  ]
})

describe('OrderList.vue', () => {
  const mockPaidOrders = [
    {
      orderId: 1,
      payAmount: 100,
      businessName: '测试商家1',
      businessDeliveryFees: 5,
      orderItemDTOs: [
        {
          quanity: 2,
          productName: '商品1',
          commodityPrice: 45,
          image: 'test1.jpg'
        }
      ]
    }
  ]

  const mockUnpaidOrders = [
    {
      orderId: 2,
      payAmount: 150,
      businessName: '测试商家2',
      businessDeliveryFees: 5,
      orderItemDTOs: [
        {
          quanity: 1,
          productName: '商品2',
          commodityPrice: 145,
          image: 'test2.jpg'
        }
      ]
    }
  ]

  const mockAxiosResponse = (data: any): AxiosResponse => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue('fake-token')
    vi.mocked(getPaidOrders).mockResolvedValue(mockAxiosResponse(mockPaidOrders))
    vi.mocked(getUnpaidOrders).mockResolvedValue(mockAxiosResponse(mockUnpaidOrders))
    vi.useFakeTimers()
  })

  it('页面能正常渲染', () => {
    const wrapper = mount(OrderList, {
      global: { plugins: [createPinia(), router] }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('未登录时跳转到登录页面', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    const push = vi.fn()
    router.push = push

    mount(OrderList, {
      global: { plugins: [createPinia(), router] }
    })

    expect(window.alert).toHaveBeenCalledWith('请先登录后再查看订单')
    expect(push).toHaveBeenCalledWith('/login')
  })

  it('成功获取并显示订单列表', async () => {
    const wrapper = mount(OrderList, {
      global: { plugins: [createPinia(), router] }
    })

    // 等待异步操作完成
    await vi.runAllTimersAsync()

    expect(wrapper.text()).toContain('测试商家1')
    expect(wrapper.text()).toContain('测试商家2')
    expect(wrapper.text()).toContain('¥100')
    expect(wrapper.text()).toContain('¥150')
  })

  it('处理获取订单列表失败的情况', async () => {
    // Mock localStorage to return null (not logged in)
    localStorageMock.getItem.mockReturnValue(null)

    const wrapper = mount(OrderList, {
      global: {
        plugins: [router]
      }
    })

    await router.push('/orderList')
    await wrapper.vm.$nextTick()

    // 验证alert被调用
    expect(window.alert).toHaveBeenCalledWith('请先登录后再查看订单')
  }, 5000)

  it('处理401未授权错误', async () => {
    const error = {
      response: {
        status: 401,
        statusText: 'Unauthorized'
      },
      isAxiosError: true
    } as AxiosError
    vi.mocked(getPaidOrders).mockRejectedValueOnce(error)
    const push = vi.fn()
    router.push = push

    mount(OrderList, {
      global: { plugins: [createPinia(), router] }
    })

    // 等待异步操作完成
    await vi.runAllTimersAsync()

    expect(window.alert).toHaveBeenCalledWith('登录已过期，请重新登录')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    expect(push).toHaveBeenCalledWith('/login')
  })

  it('处理404错误', async () => {
    const error = {
      response: {
        status: 404,
        statusText: 'Not Found'
      },
      isAxiosError: true
    } as AxiosError
    vi.mocked(getPaidOrders).mockRejectedValueOnce(error)

    mount(OrderList, {
      global: { plugins: [createPinia(), router] }
    })

    // 等待异步操作完成
    await vi.runAllTimersAsync()

    expect(window.alert).toHaveBeenCalledWith('系统错误，请稍后重试')
  })

  it('处理网络超时错误', async () => {
    const error = {
      code: 'ECONNABORTED',
      isAxiosError: true
    } as AxiosError
    vi.mocked(getPaidOrders).mockRejectedValueOnce(error)

    mount(OrderList, {
      global: { plugins: [createPinia(), router] }
    })

    // 等待异步操作完成
    await vi.runAllTimersAsync()

    expect(window.alert).toHaveBeenCalledWith('网络请求超时，请检查网络后重试')
  })

  it('处理网络连接失败错误', async () => {
    const error = {
      code: 'ERR_NETWORK',
      isAxiosError: true
    } as AxiosError
    vi.mocked(getPaidOrders).mockRejectedValueOnce(error)

    mount(OrderList, {
      global: { plugins: [createPinia(), router] }
    })

    // 等待异步操作完成
    await vi.runAllTimersAsync()

    expect(window.alert).toHaveBeenCalledWith('网络连接失败，请检查网络设置')
  })

  it('切换订单展开状态', async () => {
    const wrapper = mount(OrderList, {
      global: { plugins: [createPinia(), router] }
    })

    // 等待异步操作完成
    await vi.runAllTimersAsync()
    await wrapper.vm.$nextTick()

    // 获取所有订单
    const orders = wrapper.findAll('.bg-white.rounded-lg.mb-3.p-4')
    expect(orders.length).toBeGreaterThan(0)

    // 点击第一个订单
    const firstOrder = orders[0]
    const orderHeader = firstOrder.find('.flex.justify-between.items-center')
    await orderHeader.trigger('click')
    await wrapper.vm.$nextTick()
    await vi.runAllTimersAsync()

    // 检查订单是否展开
    const firstOrderDetails = firstOrder.find('.mt-2.text-gray-600')
    expect(firstOrderDetails.attributes('style')).not.toContain('display: none')

    // 再次点击
    await orderHeader.trigger('click')
    await wrapper.vm.$nextTick()
    await vi.runAllTimersAsync()

    // 检查订单是否收起
    expect(firstOrderDetails.attributes('style')).toContain('display: none')
  })
}) 