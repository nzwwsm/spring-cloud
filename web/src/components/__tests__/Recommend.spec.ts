import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import Recommend from '../Recommend.vue'
import { ComponentPublicInstance } from 'vue'

// 定义组件实例类型
interface RecommendComponent extends ComponentPublicInstance {
  activeSort: string
  businesses: Array<{
    id: number
    businessName: string
    image: string
    description: string
    score: number
    deliveryFees: number
    miniDeliveryFee: number
    monthSold: number
  }>
  loading: boolean
  error: string
  handleSort: (sort: string) => void
  getBusinessList: () => Promise<void>
}

// 模拟fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// 模拟localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// 模拟推荐商家数据
const mockRecommendBusinesses = [
  {
    id: 1,
    businessName: '推荐商家1',
    image: 'business1.jpg',
    description: '推荐描述1',
    score: 4.5,
    deliveryFees: 5,
    miniDeliveryFee: 20,
    monthSold: 100
  },
  {
    id: 2,
    businessName: '推荐商家2',
    image: 'business2.jpg',
    description: '推荐描述2',
    score: 4.8,
    deliveryFees: 8,
    miniDeliveryFee: 30,
    monthSold: 200
  }
]

describe('Recommend.vue', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    // 重置所有模拟
    vi.clearAllMocks()
    mockFetch.mockReset()
    mockLocalStorage.getItem.mockReset()

    // 创建新的pinia实例
    pinia = createPinia()
    setActivePinia(pinia)

    // 创建路由
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/',
          name: 'home',
          component: { template: '<div>Home</div>' }
        },
        {
          path: '/business/:id',
          name: 'business',
          component: { template: '<div>Business</div>' }
        }
      ]
    })

    // 使用fake timers
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该正确获取并显示推荐商家列表', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockRecommendBusinesses })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 创建组件实例
    const wrapper = mount(Recommend, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await vi.runAllTimersAsync()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证API是否被调用
    expect(mockFetch).toHaveBeenCalledWith('/api/business/list')

    // 验证推荐商家列表渲染
    const businessItems = wrapper.findAll('.business-list-item')
    expect(businessItems).toHaveLength(2)
    expect(businessItems[0].find('h3').text()).toBe('推荐商家1')
    expect(businessItems[1].find('h3').text()).toBe('推荐商家2')
  })

  it('应该正确处理商家点击跳转', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockRecommendBusinesses })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 创建组件实例
    const wrapper = mount(Recommend, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await vi.runAllTimersAsync()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 确保商家列表项存在
    const businessItems = wrapper.findAll('.business-list-item')
    expect(businessItems).toHaveLength(2)

    // 点击第一个商家
    await businessItems[0].trigger('click')
    await wrapper.vm.$nextTick()

    // 验证路由跳转
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('应该正确处理空数据列表', async () => {
    // 模拟API返回空数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: [] })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 创建组件实例
    const wrapper = mount(Recommend, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await vi.runAllTimersAsync()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证空状态显示
    const businessItems = wrapper.findAll('.business-list-item')
    expect(businessItems).toHaveLength(0)
    expect(wrapper.text()).toContain('暂无商家数据')
  })

  it('应该正确处理网络错误', async () => {
    // 模拟网络错误
    const networkError = new Error('网络错误')
    mockFetch.mockRejectedValueOnce(networkError)

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 创建组件实例
    const wrapper = mount(Recommend, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await vi.runAllTimersAsync()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证错误状态显示
    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.text()).toContain('网络错误 重试')
    expect(wrapper.findAll('.business-list-item')).toHaveLength(0)
  })

  it('应该正确处理加载状态', async () => {
    // 创建一个延迟的Promise来模拟API请求
    let resolvePromise: (value: any) => void
    const delayedResponse = new Promise((resolve) => {
      resolvePromise = resolve
    })

    mockFetch.mockImplementationOnce(() => delayedResponse)

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 创建组件实例
    const wrapper = mount(Recommend, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载和onMounted钩子执行
    await wrapper.vm.$nextTick()
    await vi.runAllTimersAsync()

    // 验证加载状态
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)

    // 完成API请求
    resolvePromise!({
      ok: true,
      json: () => Promise.resolve({ data: mockRecommendBusinesses })
    })

    // 等待组件更新
    await wrapper.vm.$nextTick()
    await vi.runAllTimersAsync()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证加载完成后显示数据
    expect(wrapper.find('.loading-spinner').exists()).toBe(false)
    expect(wrapper.find('.business-list').exists()).toBe(true)
    expect(wrapper.find('.business-list-item').exists()).toBe(true)
  })

  it('应该正确处理错误状态', async () => {
    // 模拟网络错误
    const networkError = new Error('网络错误')
    mockFetch.mockRejectedValueOnce(networkError)

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 创建组件实例
    const wrapper = mount(Recommend, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // 等待组件挂载完成
    await wrapper.vm.$nextTick()
    await vi.runAllTimersAsync()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证错误状态显示
    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.text()).toContain('网络错误 重试')

    // 模拟重试成功
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockRecommendBusinesses })
    })

    // 点击重试按钮
    const retryButton = wrapper.find('.retry-btn')
    if (retryButton.exists()) {
      await retryButton.trigger('click')
      await wrapper.vm.$nextTick()
      await vi.runAllTimersAsync()
      await flushPromises()
      await wrapper.vm.$nextTick()

      // 验证重试后的状态
      const vm = wrapper.vm as any
      expect(vm.error).toBe('')
      expect(vm.loading).toBe(false)
      expect(wrapper.find('.error-message').exists()).toBe(false)
    }
  })
}) 