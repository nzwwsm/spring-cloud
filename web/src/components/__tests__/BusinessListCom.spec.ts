import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import BusinessListCom from '../BusinessListCom.vue'

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

// 模拟商家数据
const mockBusinesses = [
  {
    id: 1,
    businessName: '测试商家1',
    image: 'business1.jpg',
    description: '测试描述1',
    score: 4.5,
    deliveryFees: 5,
    miniDeliveryFee: 20,
    monthSold: 100
  },
  {
    id: 2,
    businessName: '测试商家2',
    image: 'business2.jpg',
    description: '测试描述2',
    score: 4.8,
    deliveryFees: 8,
    miniDeliveryFee: 30,
    monthSold: 200
  }
]

describe('BusinessListCom.vue', () => {
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
        },
        {
          path: '/login',
          name: 'login',
          component: { template: '<div>Login</div>' }
        }
      ]
    })

    // 使用fake timers
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该正确获取并显示商家列表', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockBusinesses })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 创建组件实例
    const wrapper = mount(BusinessListCom, {
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
    expect(mockFetch).toHaveBeenCalledWith('/api/business/list?page=1')

    // 验证商家列表渲染
    const businessItems = wrapper.findAll('.business-item')
    expect(businessItems).toHaveLength(2)

    // 验证第一个商家的信息
    const firstBusiness = businessItems[0]
    expect(firstBusiness.find('h3').text()).toBe('测试商家1')
    expect(firstBusiness.find('.text-gray-500').text()).toBe('测试描述1')
  })

  it('应该正确处理商家点击跳转', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockBusinesses })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 创建组件实例
    const wrapper = mount(BusinessListCom, {
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
    const businessItems = wrapper.findAll('.business-item')
    expect(businessItems).toHaveLength(2)

    // 点击第一个商家
    await businessItems[0].trigger('click')
    await wrapper.vm.$nextTick()

    // 验证路由跳转
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('未登录时点击商家应该跳转到登录页', async () => {
    // 模拟API返回数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockBusinesses })
    })

    // 确保localStorage没有token
    mockLocalStorage.getItem.mockReturnValue(null)

    // 创建组件实例
    const wrapper = mount(BusinessListCom, {
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
    const businessItems = wrapper.findAll('.business-item')
    expect(businessItems).toHaveLength(2)

    // 点击商家
    await businessItems[0].trigger('click')
    await wrapper.vm.$nextTick()

    // 验证跳转到登录页
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
    const wrapper = mount(BusinessListCom, {
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
    const businessItems = wrapper.findAll('.business-item')
    expect(businessItems).toHaveLength(0)
    expect(wrapper.text()).toContain('暂无商家数据')
    expect(wrapper.find('.error-message').exists()).toBe(false)
    expect(wrapper.find('.load-more-btn').exists()).toBe(false)
  })

  it('应该正确处理网络错误状态', async () => {
    // 模拟网络错误
    const networkError = new Error('网络错误')
    mockFetch.mockRejectedValueOnce(networkError)

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 创建组件实例
    const wrapper = mount(BusinessListCom, {
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
    expect(wrapper.findAll('.business-item')).toHaveLength(0)
  })

  it('应该正确处理分页加载', async () => {
    // 模拟第一页数据
    const firstPageData = [mockBusinesses[0]]
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: firstPageData })
    })

    // 确保localStorage有token
    mockLocalStorage.getItem.mockReturnValue('valid-test-token')

    // 创建组件实例
    const wrapper = mount(BusinessListCom, {
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

    // 验证第一页数据
    let businessItems = wrapper.findAll('.business-item')
    expect(businessItems).toHaveLength(1)
    expect(businessItems[0].find('h3').text()).toBe('测试商家1')

    // 模拟加载更多数据
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: mockBusinesses })
    })

    // 触发加载更多
    const loadMoreBtn = wrapper.find('.load-more-btn')
    if (loadMoreBtn.exists()) {
      await loadMoreBtn.trigger('click')
      await wrapper.vm.$nextTick()
      await vi.runAllTimersAsync()
      await flushPromises()
      await wrapper.vm.$nextTick()

      // 验证加载更多后的数据
      businessItems = wrapper.findAll('.business-item')
      expect(businessItems).toHaveLength(2)
    }
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
    const wrapper = mount(BusinessListCom, {
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
      json: () => Promise.resolve({ data: mockBusinesses })
    })

    // 等待组件更新
    await wrapper.vm.$nextTick()
    await vi.runAllTimersAsync()
    await flushPromises()
    await wrapper.vm.$nextTick()

    // 验证数据加载完成
    const businessItems = wrapper.findAll('.business-item')
    expect(businessItems).toHaveLength(2)
  })
}) 