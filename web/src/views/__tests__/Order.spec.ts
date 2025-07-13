import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import Order from '../Order.vue'
import { useCartStore } from '../../stores/cart'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

vi.mock('../../stores/cart', () => ({
  useCartStore: vi.fn()
}))

describe('Order.vue', () => {
  const mockOrder = {
    businessId: 1,
    items: [
      {
        id: 1,
        commodityName: '商品1',
        price: 10,
        quantity: 2,
        image: 'test.jpg'
      },
      {
        id: 2,
        commodityName: '商品2',
        price: 20,
        quantity: 1,
        image: 'test2.jpg'
      }
    ],
    totalPrice: 40,
    createTime: '2024-03-20T10:00:00Z'
  }

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/businessList', component: { template: '<div>BusinessList</div>' } },
      { path: '/orderList', component: { template: '<div>OrderList</div>' } },
      { path: '/login', component: { template: '<div>Login</div>' } }
    ]
  })

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    window.alert = vi.fn()
    localStorageMock.getItem.mockReturnValue('fake-token')
  })

  it('组件能正常渲染', () => {
    vi.mocked(useCartStore).mockReturnValue({
      getCurrentOrder: () => mockOrder,
      clearCart: vi.fn(),
      clearCurrentOrder: vi.fn()
    } as any)

    const wrapper = mount(Order, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true,
          Bottom: true
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('没有订单信息时跳转到商家列表', async () => {
    vi.mocked(useCartStore).mockReturnValue({
      getCurrentOrder: () => null,
      clearCart: vi.fn(),
      clearCurrentOrder: vi.fn()
    } as any)

    const push = vi.fn()
    router.push = push

    mount(Order, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true,
          Bottom: true
        }
      }
    })

    expect(window.alert).toHaveBeenCalledWith('订单信息不存在')
    expect(push).toHaveBeenCalledWith('/businessList')
  })

  it('正确显示订单信息', () => {
    vi.mocked(useCartStore).mockReturnValue({
      getCurrentOrder: () => mockOrder,
      clearCart: vi.fn(),
      clearCurrentOrder: vi.fn()
    } as any)

    const wrapper = mount(Order, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true,
          Bottom: true
        }
      }
    })

    expect(wrapper.text()).toContain('商品1')
    expect(wrapper.text()).toContain('商品2')
    expect(wrapper.text()).toContain('¥40.00')
  })

  it('正确格式化时间', () => {
    vi.mocked(useCartStore).mockReturnValue({
      getCurrentOrder: () => mockOrder,
      clearCart: vi.fn(),
      clearCurrentOrder: vi.fn()
    } as any)

    const wrapper = mount(Order, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true,
          Bottom: true
        }
      }
    })

    // 检查时间格式是否包含正确的日期部分
    expect(wrapper.text()).toContain('2024-03-20')
    // 检查是否包含时间部分
    expect(wrapper.text()).toContain('10:00')
  })

  it('提交订单成功', async () => {
    vi.mocked(useCartStore).mockReturnValue({
      getCurrentOrder: () => mockOrder,
      clearCart: vi.fn(),
      clearCurrentOrder: vi.fn()
    } as any)

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true
    } as any)

    const push = vi.fn()
    router.push = push

    const wrapper = mount(Order, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true,
          Bottom: true
        }
      }
    })

    await wrapper.find('button').trigger('click')

    expect(window.alert).toHaveBeenCalledWith('订单提交成功')
    expect(push).toHaveBeenCalledWith('/orderList')
  })

  it('提交订单失败', async () => {
    vi.mocked(useCartStore).mockReturnValue({
      getCurrentOrder: () => mockOrder,
      clearCart: vi.fn(),
      clearCurrentOrder: vi.fn()
    } as any)

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false
    } as any)

    const wrapper = mount(Order, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true,
          Bottom: true
        }
      }
    })

    await wrapper.find('button').trigger('click')

    expect(window.alert).toHaveBeenCalledWith('提交订单失败，请重试')
  })

  it('未登录时跳转到登录页面', async () => {
    vi.mocked(useCartStore).mockReturnValue({
      getCurrentOrder: () => mockOrder,
      clearCart: vi.fn(),
      clearCurrentOrder: vi.fn()
    } as any)

    localStorageMock.getItem.mockReturnValue(null)

    const push = vi.fn()
    router.push = push

    const wrapper = mount(Order, {
      global: {
        plugins: [router, createPinia()],
        stubs: {
          'router-link': true,
          Bottom: true
        }
      }
    })

    await wrapper.find('button').trigger('click')

    expect(window.alert).toHaveBeenCalledWith('请先登录')
    expect(push).toHaveBeenCalledWith('/login')
  })
}) 